import 'dotenv/config';

async function listModels() {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GOOGLE_API_KEY}`);
    const json = await res.json();
    if (json.models) {
      console.log("Available models:");
      json.models.filter(m => m.supportedGenerationMethods.includes('generateContent')).forEach(m => {
        console.log(`- ${m.name}`);
      });
    } else {
      console.log("Error:", json);
    }
  } catch (err) {
    console.error("Fetch error:", err);
  }
}
listModels();
