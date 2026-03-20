const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testAI() {
  const model = "liquid/lfm-2.5-1.2b-instruct:free";
  const messages = [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: "Hello" }
  ];

  console.log(`Testing with model: ${model}`);
  console.log(`API Key: ${process.env.OPENROUTER_API_KEY ? 'Present' : 'Missing'}`);

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
      }),
    });

    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

testAI();
