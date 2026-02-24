const Hospital = require("../models/Hospital");
const User = require("../models/User");

const FREE_MODELS = "google/gemma-3-4b-it:free";

const buildSystemInstruction = async (currentUser) => {
  try {
    const hospitals = await Hospital.find({ isActive: true });
    const doctors = await User.find({ role: "doctor", isActive: true }).populate(
      "hospitalId",
      "name"
    );

    const hospitalContext = hospitals
      .slice(0, 5)
      .map((h) => {
        const depts = h.departments
          .filter((d) => d.isActive)
          .map((d) => d.name)
          .join(", ");
        return `- ${h.name} (${h.address.city}): Departments [${depts}]`;
      })
      .join("\n");

    const doctorContext = doctors
      .slice(0, 10)
      .map((d) => {
        return `- ${d.fullName} (${d.employeeDetails?.specialization || "General"}) at ${
          d.hospitalId?.name || "N/A"
        }`;
      })
      .join("\n");

    return `
You are Careline AI, a specialized medical assistant for the Careline Hospital Management System in Nepal.
Your goal is to assist patients with booking tokens, answering FAQs, and enhancing their experience.

CURRENT APPLICATION DATA:
1. Hospitals & Departments:
${hospitalContext || "No hospitals currently active."}

2. Doctors & Specialists:
${doctorContext || "No doctors currently listed."}

USER CONTEXT:
- Current Patient: ${currentUser?.fullName || "Guest"}

HOW TO BOOK A TOKEN:
- Go to the Patient Dashboard.
- Select the Hospital from the dropdown.
- Choose the Department.
- Select a Doctor (the system auto-selects the least busy one).
- Click "Book Token".

QUEUE INFO:
- Patients can see their live position and estimated wait time on the dashboard once booked.
- Wait times vary by department but usually average 15-30 minutes.

GUIDELINES:
- Be professional, empathetic, and concise.
- If a patient asks about medical advice, tell them you are an AI assistant and they should consult a doctor, but you can help them book an appointment.
- ONLY provide info about the hospitals and doctors listed above.
- If asked about technical issues, tell them to contact support at support@careline.com.
- Keep responses short and to the point.
`;
  } catch (error) {
    console.error("Error building system instruction:", error);
    return "You are Careline AI, a helpful medical assistant. Currently, database services are having issues. Please guide users to the dashboard for manual bookings.";
  }
};


const callWithFallback = async (messages) => {
  const errors = [];

  for (const model of FREE_MODELS) {
    try {
      console.log(`🤖 Trying model: ${model}`);

      // Gemma models don't support system role — merge into first user message
      let formattedMessages = messages;
      if (model.includes("gemma")) {
        const systemMsg = messages.find(m => m.role === "system");
        const otherMsgs = messages.filter(m => m.role !== "system");
        if (systemMsg && otherMsgs[0]) {
          otherMsgs[0] = {
            ...otherMsgs[0],
            content: `${systemMsg.content}\n\n${otherMsgs[0].content}`
          };
        }
        formattedMessages = otherMsgs;
      }

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:5000",
          "X-Title": "Careline Hospital System",
        },
        body: JSON.stringify({
          model,
          messages: formattedMessages,
          max_tokens: 512,
          temperature: 0.7,
        }),
      });

      const data = await response.json();

      if (response.ok && data.choices?.[0]?.message?.content) {
        console.log(`✅ Success with model: ${model}`);
        return data.choices[0].message.content;
      }

      const reason = data.error?.metadata?.raw || data.error?.message || `HTTP ${response.status}`;
      console.warn(`⚠️ Model ${model} failed: ${reason}`);
      errors.push(`${model}: ${reason}`);

    } catch (fetchError) {
      console.warn(`⚠️ Model ${model} fetch error: ${fetchError.message}`);
      errors.push(`${model}: ${fetchError.message}`);
    }
  }

  console.error("❌ All models failed:", errors);
  throw new Error("All AI models are currently unavailable. Please try again in a moment.");
};

exports.getChatResponse = async (req, res) => {
  try {
    const { message, history } = req.body;

    // Validate input
    if (!message || message.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Message cannot be empty.",
      });
    }

    // Check API key
    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(500).json({
        success: false,
        message:
          "OpenRouter API Key is missing. Please add OPENROUTER_API_KEY to your .env file.",
      });
    }

    // Build system prompt
    const systemInstruction = await buildSystemInstruction(req.user);

    // Format chat history — only last 6 messages to stay within token limits
    const recentHistory = Array.isArray(history) ? history.slice(-6) : [];
    const formattedHistory = recentHistory.map((h) => ({
      role: h.sender === "user" ? "user" : "assistant",
      content: h.text,
    }));

    // Build full messages array
    const messages = [
      { role: "system", content: systemInstruction },
      ...formattedHistory,
      { role: "user", content: message.trim() },
    ];

    // Call AI with fallback
    const reply = await callWithFallback(messages);

    res.status(200).json({
      success: true,
      data: reply,
    });

  } catch (error) {
    console.error("Chatbot Controller Error:", error.message);

    res.status(500).json({
      success: false,
      message: error.message || "Error communicating with AI service",
    });
  }
};