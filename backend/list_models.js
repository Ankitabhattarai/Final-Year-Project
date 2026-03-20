const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function listModels() {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/models", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      }
    });

    const data = await response.json();
    const freeModels = data.data
      .filter(m => m.pricing.prompt === "0" && m.pricing.completion === "0")
      .map(m => m.id);
    
    console.log("FREE MODELS FOUND:");
    console.log(JSON.stringify(freeModels.slice(0, 10), null, 2));
  } catch (err) {
    console.error("Error fetching models:", err);
  }
}

listModels();
