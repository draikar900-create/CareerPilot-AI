import os
import json
import joblib
import pandas as pd
import numpy as np
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

app = FastAPI(
    title="CareerPilot AI - ML Placement Prediction Microservice",
    version="1.0.0",
    description="Machine Learning placement prediction engine for CareerPilot AI"
)

MODEL_DIR = os.path.join(os.path.dirname(__file__), 'saved_model')
MODEL_PATH = os.path.join(MODEL_DIR, 'model_pipeline.joblib')
METADATA_PATH = os.path.join(MODEL_DIR, 'model_metadata.json')

# Global variables to hold loaded model artifacts
trained_pipeline = None
model_metadata = None

def load_artifacts():
    global trained_pipeline, model_metadata
    if os.path.exists(MODEL_PATH) and os.path.exists(METADATA_PATH):
        try:
            trained_pipeline = joblib.load(MODEL_PATH)
            with open(METADATA_PATH, 'r') as f:
                model_metadata = json.load(f)
            print(f"[OK] Loaded ML Model: {model_metadata.get('selected_model')} (v{model_metadata.get('model_version')})")
        except Exception as e:
            print(f"[WARN] Error loading ML model artifacts: {e}")
            trained_pipeline = None
            model_metadata = None
    else:
        print("[INFO] No pre-trained ML model found. Service ready for dataset training.")

@app.on_event("startup")
def startup_event():
    load_artifacts()

class PredictionInput(BaseModel):
    cgpa: Optional[float] = Field(None, ge=0.0, le=10.0, description="Student CGPA")
    semester: Optional[int] = Field(None, ge=1, le=10, description="Current semester")
    graduation_year: Optional[int] = Field(None, description="Graduation year")
    skills_count: Optional[int] = Field(0, ge=0, description="Total technical skills count")
    projects_count: Optional[int] = Field(0, ge=0, description="Saved/completed projects count")
    certificates_count: Optional[int] = Field(0, ge=0, description="Certificates earned count")
    internships_count: Optional[int] = Field(0, ge=0, description="Internships count")
    readiness_score: Optional[int] = Field(0, ge=0, le=100, description="Assessment readiness test score")
    branch: Optional[str] = Field("Computer Science", description="Department/Branch")
    academic_year: Optional[str] = Field("4th Year", description="Academic Year")

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "CareerPilot AI ML Prediction Microservice",
        "model_loaded": trained_pipeline is not None,
        "model_version": model_metadata.get("model_version") if model_metadata else None,
        "selected_model": model_metadata.get("selected_model") if model_metadata else None,
        "metrics": model_metadata.get("metrics") if model_metadata else None
    }

def compute_model_explanation(pipeline, df_input, input_data):
    """
    Computes true model-driven explainability (XAI) feature contributions
    from the trained scikit-learn pipeline (LogisticRegression or Tree models).
    """
    try:
        preprocessor = pipeline.named_steps['preprocessor']
        classifier = pipeline.named_steps['classifier']

        # Get transformed feature array
        X_trans = preprocessor.transform(df_input)
        feature_names = preprocessor.get_feature_names_out()

        if hasattr(classifier, 'coef_'):
            coefs = classifier.coef_[0]
            contributions_raw = coefs * X_trans[0]
        elif hasattr(classifier, 'feature_importances_'):
            importances = classifier.feature_importances_
            contributions_raw = importances * X_trans[0]
        else:
            contributions_raw = np.zeros(len(feature_names))

        feature_display_names = {
            'cgpa': ('Academic CGPA', f"{input_data.cgpa}/10.0"),
            'readiness_score': ('Assessment Readiness Score', f"{input_data.readiness_score}%"),
            'internships_count': ('Practical Internships', f"{input_data.internships_count} Internships"),
            'projects_count': ('Completed Projects', f"{input_data.projects_count} Projects"),
            'skills_count': ('Technical Skills Count', f"{input_data.skills_count} Skills"),
            'certificates_count': ('Certifications Earned', f"{input_data.certificates_count} Certificates"),
            'branch': ('Academic Branch', f"{input_data.branch}"),
            'academic_year': ('Academic Year', f"{input_data.academic_year}"),
            'semester': ('Current Semester', f"Sem {input_data.semester}"),
            'graduation_year': ('Graduation Year', f"{input_data.graduation_year or 2026}")
        }

        feature_impacts = {}
        for fname, val in zip(feature_names, contributions_raw):
            raw_name = fname.split('__')[-1]
            base_feature = None
            for key in feature_display_names:
                if key in raw_name:
                    base_feature = key
                    break
            
            if base_feature:
                feature_impacts[base_feature] = feature_impacts.get(base_feature, 0.0) + float(val)

        positive_factors = []
        improvement_areas = []
        contributions = []

        sorted_features = sorted(feature_impacts.items(), key=lambda item: item[1], reverse=True)

        for feat_key, impact_score in sorted_features:
            disp_name, disp_val = feature_display_names.get(feat_key, (feat_key, 'N/A'))
            
            if impact_score > 0:
                impact_label = "High Positive Impact" if impact_score >= 0.4 else "Positive Impact"
                positive_factors.append({
                    "feature": disp_name,
                    "value": disp_val,
                    "contribution": round(impact_score, 4),
                    "impact": impact_label
                })
                contributions.append({
                    "feature": disp_name,
                    "value": disp_val,
                    "impact": "High" if impact_score >= 0.4 else "Moderate",
                    "type": "positive"
                })
            else:
                impact_label = "Needs Skill Enhancement" if impact_score <= -0.4 else "Recommended Area of Growth"
                improvement_areas.append({
                    "feature": disp_name,
                    "value": disp_val,
                    "contribution": round(impact_score, 4),
                    "impact": impact_label
                })
                contributions.append({
                    "feature": disp_name,
                    "value": disp_val,
                    "impact": "Needs Work" if impact_score <= -0.4 else "Moderate",
                    "type": "negative"
                })

        return {
            "positive_factors": positive_factors,
            "improvement_areas": improvement_areas,
            "contributions": contributions
        }

    except Exception as e:
        print(f"[WARN] Error computing XAI feature explanation: {e}")
        return {
            "positive_factors": [],
            "improvement_areas": [],
            "contributions": []
        }

@app.post("/predict")
def predict_placement(input_data: PredictionInput):
    """
    Generates model-estimated placement probability and class prediction
    based on student features using the trained scikit-learn model.
    """
    if trained_pipeline is None:
        return {
            "success": False,
            "status": "model_not_trained",
            "message": "Placement prediction ML model is initialized but not yet trained on a dataset.",
            "probability": None,
            "prediction": None,
            "missing_fields": []
        }

    # Check required critical features - DO NOT fabricate missing student features
    missing_fields = []
    if input_data.cgpa is None:
        missing_fields.append("cgpa")
    if input_data.semester is None:
        missing_fields.append("semester")

    if missing_fields:
        return {
            "success": False,
            "status": "insufficient_data",
            "message": f"Insufficient student profile data for prediction. Missing fields: {', '.join(missing_fields)}.",
            "probability": None,
            "prediction": None,
            "missing_fields": missing_fields
        }

    try:
        # Prepare input dataframe matching training feature names
        feature_dict = {
            "cgpa": [input_data.cgpa],
            "semester": [input_data.semester],
            "graduation_year": [input_data.graduation_year or 2026],
            "skills_count": [input_data.skills_count or 0],
            "projects_count": [input_data.projects_count or 0],
            "certificates_count": [input_data.certificates_count or 0],
            "internships_count": [input_data.internships_count or 0],
            "readiness_score": [input_data.readiness_score or 0],
            "branch": [input_data.branch or "Computer Science"],
            "academic_year": [input_data.academic_year or "4th Year"]
        }

        df_input = pd.DataFrame(feature_dict)

        # Generate probability and prediction from pipeline
        prob_array = trained_pipeline.predict_proba(df_input)[0]
        placement_prob = float(prob_array[1]) if len(prob_array) > 1 else float(prob_array[0])
        pred_class = int(trained_pipeline.predict(df_input)[0])

        # Status category mapping based on statistical probability
        if placement_prob >= 0.75:
            placement_status = "High Readiness"
        elif placement_prob >= 0.50:
            placement_status = "Moderate Readiness"
        else:
            placement_status = "Needs Skill Enhancement"

        # Model-driven feature contribution analysis for explainability (XAI)
        xai_explanation = compute_model_explanation(trained_pipeline, df_input, input_data)

        return {
            "success": True,
            "status": placement_status,
            "probability": round(placement_prob, 4),
            "probability_percentage": round(placement_prob * 100, 1),
            "predicted_class": pred_class,
            "prediction": "Placed" if pred_class == 1 else "Not Placed",
            "model_version": model_metadata.get("model_version", "1.0.0") if model_metadata else "1.0.0",
            "selected_model": model_metadata.get("selected_model", "LogisticRegression") if model_metadata else "LogisticRegression",
            "explanation": xai_explanation,
            "contributions": xai_explanation.get("contributions", []),
            "missing_fields": [],
            "disclaimer": "ML prediction is a statistical estimate based on available student profile features and historical placement data. It is not a placement guarantee."
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)

