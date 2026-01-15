import cors from "cors";
import "dotenv/config";
import express from "express";
import fs from "fs";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

/* ===============================
   CONFIG
================================ */

const MODELS = [
  "models/gemini-2.5-flash",
  "models/gemini-2.5-flash-lite"
];

const SYSTEM_PROMPT = `
You are a focused personal AI assistant designed for a single serious learner.

Your role:
- Provide clear, direct, and corrective guidance.
- Avoid sugarcoating or generic motivational talk.
- Prioritize clarity, execution, and long-term improvement.
- Challenge weak reasoning and vague thinking.
- Prefer practical, implementation-oriented explanations.

Behavior rules:
- Be concise but thoughtful.
- Give actionable advice.
- Explain trade-offs and limitations when relevant.
- Act like a reliable technical mentor, not a chatbot.

Tone:
- Professional, honest, and grounded.
- Helpful without being overly polite or verbose.
`;


/* ===============================
   MEMORY HELPERS
================================ */

function loadMemory() {
  if (!fs.existsSync("memory.json")) {
    fs.writeFileSync(
      "memory.json",
      JSON.stringify(
        { profile: {}, goals: [], weaknesses: [], patterns: [], notes: [] },
        null,
        2
      )
    );
  }
  return JSON.parse(fs.readFileSync("memory.json", "utf-8"));
}

function saveMemory(memory) {
  fs.writeFileSync("memory.json", JSON.stringify(memory, null, 2));
}

/* ===============================
   MEMORY DECISION LOGIC
================================ */

function shouldCheckMemory(message, counter) {
  const keywords = [
    "goal", "habit", "problem", "confused",
    "struggle", "plan", "future",
    "daily", "repeat", "lazy"
  ];

  if (message.length > 60) return true;
  if (keywords.some(k => message.toLowerCase().includes(k))) return true;
  if (counter % 4 === 0) return true;

  return false;
}

/* ===============================
   GEMINI CALL
================================ */

async function callGemini(prompt) {
  for (const model of MODELS) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1/${model}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-goog-api-key": process.env.GEMINI_API_KEY
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        }
      );

      const data = await res.json();
      if (data.candidates?.length) {
        return data.candidates[0].content.parts.map(p => p.text).join(" ");
      }
    } catch {}
  }
  return null;
}

let messageCount = 0;

/* ===============================
   CHAT ENDPOINT
================================ */

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;
  if (!userMessage) return res.status(400).json({ error: "Message required" });

  messageCount++;
  const memory = loadMemory();

  const reply = await callGemini(
    SYSTEM_PROMPT +
    "\n\nMemory:\n" +
    JSON.stringify(memory) +
    "\n\nUser:\n" +
    userMessage
  );

  if (shouldCheckMemory(userMessage, messageCount)) {
    const memPrompt = `
Respond ONLY in JSON:
{
  "remember": true/false,
  "type": "goals | weaknesses | patterns | notes",
  "content": "short sentence"
}
User message: "${userMessage}"
`;
    try {
      const mem = JSON.parse(await callGemini(memPrompt));
      if (mem.remember && !memory[mem.type].includes(mem.content)) {
        memory[mem.type].push(mem.content);
        saveMemory(memory);
      }
    } catch {}
  }

  res.json({ reply: reply || "Quota khatam. Kal aage badhenge." });
});

/* ===============================
   SPEAK ENDPOINT (MULTI VOICE)
================================ */

app.post("/speak", async (req, res) => {
  const { text, voiceId } = req.body;
  if (!text || !voiceId) {
    return res.status(400).json({ error: "Text and voiceId required" });
  }

  const response = await fetch(
    "https://api.murf.ai/v1/speech/generate",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.MURF_API_KEY
      },
      body: JSON.stringify({
        text,
        voiceId,
        format: "mp3"
      })
    }
  );

  const data = await response.json();
  if (!data.audioFile) {
    return res.status(500).json({ error: "Voice generation failed" });
  }

  res.json({ audio: data.audioFile });
});

/* ===============================
   START SERVER
================================ */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
