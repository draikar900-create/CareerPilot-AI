import os
import sys
import json
import argparse
import joblib
import pandas as pd
import numpy as np

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix
)

# Feature definitions expected from CareerPilot AI student profiles
NUMERICAL_FEATURES = [
    'cgpa',
    'semester',
    'graduation_year',
    'skills_count',
    'projects_count',
    'certificates_count',
    'internships_count',
    'readiness_score'
]

CATEGORICAL_FEATURES = [
    'branch',
    'academic_year'
]

TARGET_COLUMN = 'placed'

def build_preprocessing_pipeline():
    """Builds a scikit-learn ColumnTransformer preprocessing pipeline."""
    num_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())
    ])

    cat_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='most_frequent')),
        ('encoder', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ('num', num_transformer, NUMERICAL_FEATURES),
            ('cat', cat_transformer, CATEGORICAL_FEATURES)
        ]
    )

    return preprocessor

def train_and_evaluate(df, output_dir='saved_model'):
    """
    Trains multiple classification models on input dataframe,
    evaluates real performance metrics, selects the best model based on F1-score,
    and serializes model artifacts and metadata.
    """
    os.makedirs(output_dir, exist_ok=True)

    # Validate columns
    missing_cols = [c for c in NUMERICAL_FEATURES + CATEGORICAL_FEATURES + [TARGET_COLUMN] if c not in df.columns]
    if missing_cols:
        raise ValueError(f"Dataset is missing required columns: {missing_cols}")

    X = df[NUMERICAL_FEATURES + CATEGORICAL_FEATURES]
    y = df[TARGET_COLUMN].astype(int)

    # Train / Test split with fixed seed for reproducibility
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y if len(y.unique()) > 1 else None
    )

    preprocessor = build_preprocessing_pipeline()

    candidate_models = {
        'LogisticRegression': LogisticRegression(random_state=42, max_iter=1000),
        'DecisionTree': DecisionTreeClassifier(random_state=42, max_depth=5),
        'RandomForest': RandomForestClassifier(n_estimators=100, random_state=42, max_depth=6),
        'GradientBoosting': GradientBoostingClassifier(n_estimators=100, random_state=42, max_depth=4)
    }

    best_model_name = None
    best_f1 = -1.0
    best_pipeline = None
    best_metrics = {}
    all_results = {}

    for name, clf in candidate_models.items():
        pipeline = Pipeline(steps=[
            ('preprocessor', preprocessor),
            ('classifier', clf)
        ])

        pipeline.fit(X_train, y_train)

        y_pred = pipeline.predict(X_test)
        y_prob = pipeline.predict_proba(X_test)[:, 1] if hasattr(pipeline, "predict_proba") else y_pred

        acc = float(accuracy_score(y_test, y_pred))
        prec = float(precision_score(y_test, y_pred, zero_division=0))
        rec = float(recall_score(y_test, y_pred, zero_division=0))
        f1 = float(f1_score(y_test, y_pred, zero_division=0))
        auc = float(roc_auc_score(y_test, y_prob)) if len(np.unique(y_test)) > 1 else 0.5
        cm = confusion_matrix(y_test, y_pred).tolist()

        metrics = {
            'accuracy': round(acc, 4),
            'precision': round(prec, 4),
            'recall': round(rec, 4),
            'f1_score': round(f1, 4),
            'roc_auc': round(auc, 4),
            'confusion_matrix': cm
        }

        all_results[name] = metrics
        print(f"Model: {name:20s} | Accuracy: {acc:.4f} | F1: {f1:.4f} | ROC-AUC: {auc:.4f}")

        if f1 > best_f1:
            best_f1 = f1
            best_model_name = name
            best_pipeline = pipeline
            best_metrics = metrics

    print(f"\n[OK] Selected Model: {best_model_name} (F1 Score: {best_f1:.4f})")

    # Serialize trained pipeline and metadata
    model_path = os.path.join(output_dir, 'model_pipeline.joblib')
    joblib.dump(best_pipeline, model_path)

    metadata = {
        'model_version': '1.0.0',
        'selected_model': best_model_name,
        'metrics': best_metrics,
        'all_candidate_metrics': all_results,
        'train_samples': len(X_train),
        'test_samples': len(X_test),
        'numerical_features': NUMERICAL_FEATURES,
        'categorical_features': CATEGORICAL_FEATURES,
        'timestamp': pd.Timestamp.now().isoformat()
    }

    metadata_path = os.path.join(output_dir, 'model_metadata.json')
    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=2)

    print(f"Model pipeline saved to: {model_path}")
    print(f"Model metadata saved to: {metadata_path}")
    return metadata

def generate_benchmark_dataset(filename='placement_data.csv', n_samples=1200):
    """Generates a realistic benchmark historical placement dataset."""
    np.random.seed(42)
    branches = ['Computer Science', 'Information Technology', 'Electronics & Comm', 'Mechanical', 'Electrical']
    academic_years = ['4th Year', '3rd Year']
    
    cgpa = np.clip(np.random.normal(7.6, 1.1, n_samples), 5.0, 9.9)
    semesters = np.random.choice([6, 7, 8], size=n_samples, p=[0.2, 0.4, 0.4])
    grad_years = [2024 if s == 8 else 2025 for s in semesters]
    skills_cnt = np.clip(np.random.poisson(6, n_samples), 1, 15)
    projects_cnt = np.clip(np.random.poisson(3, n_samples), 0, 8)
    certs_cnt = np.clip(np.random.poisson(2, n_samples), 0, 6)
    internships_cnt = np.clip(np.random.binomial(3, 0.35, n_samples), 0, 3)
    readiness_sc = np.clip(np.random.normal(70, 15, n_samples), 20, 100).astype(int)
    branch_choice = np.random.choice(branches, size=n_samples, p=[0.45, 0.25, 0.15, 0.1, 0.05])
    year_choice = ['4th Year' if s >= 7 else '3rd Year' for s in semesters]
    
    # Calculate placement probability based on feature weights
    logit = (
        (cgpa - 7.0) * 1.2 +
        (projects_cnt - 2) * 0.4 +
        internships_cnt * 0.8 +
        (skills_cnt - 4) * 0.25 +
        (readiness_sc - 60) * 0.04 +
        np.random.normal(0, 0.5, n_samples)
    )
    prob = 1 / (1 + np.exp(-logit))
    placed = (prob >= 0.5).astype(int)
    
    df = pd.DataFrame({
        'cgpa': np.round(cgpa, 2),
        'semester': semesters,
        'graduation_year': grad_years,
        'skills_count': skills_cnt,
        'projects_count': projects_cnt,
        'certificates_count': certs_cnt,
        'internships_count': internships_cnt,
        'readiness_score': readiness_sc,
        'branch': branch_choice,
        'academic_year': year_choice,
        'placed': placed
    })
    df.to_csv(filename, index=False)
    print(f"[INFO] Generated benchmark placement dataset ({n_samples} samples) saved to: {filename}")
    return df

def main():
    default_dir = os.path.join(os.path.dirname(__file__), 'saved_model')
    default_dataset = os.path.join(os.path.dirname(__file__), 'placement_data.csv')

    parser = argparse.ArgumentParser(description="Train CareerPilot ML Placement Prediction Model")
    parser.add_argument('--dataset', type=str, default=default_dataset, help='Path to dataset CSV file')
    parser.add_argument('--output-dir', type=str, default=default_dir, help='Directory to save trained model artifacts')
    args = parser.parse_args()

    if not os.path.exists(args.dataset):
        print(f"[INFO] Dataset '{args.dataset}' not found. Creating realistic historical benchmark dataset...")
        df = generate_benchmark_dataset(args.dataset)
    else:
        print(f"[INFO] Loading dataset from: {args.dataset}")
        df = pd.read_csv(args.dataset)

    train_and_evaluate(df, output_dir=args.output_dir)

if __name__ == '__main__':
    main()
