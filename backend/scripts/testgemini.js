const { GoogleGenAI } = require("@google/genai");

const genAI = new GoogleGenAI({ apiKey: "AIzaSyBPzdwvqYgcYFYBvWSczx-IjtfX0ezPpUU" });

async function listModels() {
  const models = await genAI.models.list();
  for await (const model of models) {
    console.log(model.name);
  }
}

listModels().catch(console.error);