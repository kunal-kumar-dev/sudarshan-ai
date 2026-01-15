# 🧠 SUDARSHAN AI  
### A Personal AI System for Thinking, Learning, and Self-Improvement

SUDARSHAN AI is a **self-built personal AI system** created to explore how modern AI models, long-term memory, and voice interfaces can work together in a **real, usable assistant**.

This project is **not a generic chatbot**.  
It is designed for **focused thinking, honest feedback, and consistent personal growth**.

---

## 🌟 Why SUDARSHAN AI?

Most AI assistants today are:
- generic  
- overly polite  
- forgetful  
- optimized for mass users  

SUDARSHAN AI is different.

It is built to:
- give **direct and corrective feedback**
- remember **only meaningful long-term information**
- adapt responses based on user behavior
- respect API limits and system constraints
- feel like a **tool**, not entertainment

---

## ✨ Key Capabilities

### 💬 Intelligent Conversation
- Text-based AI assistant
- Hinglish-friendly responses
- Clear, practical, no-nonsense tone
- Designed for thinking, planning, and reflection

---

### 🧠 Long-Term Memory (Local)
- Stores:
  - goals  
  - weaknesses  
  - behavioral patterns  
  - important notes  
- Ignores noise like greetings or casual talk  
- Memory is **selective**, not automatic

Stored locally in `memory.json`.

---

### ⚖️ Quota-Aware AI Routing
- Uses a primary Gemini model with fallback
- Automatically switches models when limits are hit
- Prevents crashes and silent failures

---

### 🎤 Voice Interaction
- Optional voice output (toggle based)
- Indian English female voice (Murf TTS)
- Optimized for Hinglish clarity
- Single-audio lifecycle (no overlap issues)

---

### 🖥️ Minimal Terminal-Style UI
- Clean terminal-inspired interface
- Typing animation and processing feedback
- Built with plain HTML, CSS, and JavaScript
- No frontend frameworks (by design)

---

## 🏗️ System Architecture

```
Browser (Terminal UI)
        ↓
Express.js Backend
        ↓
Gemini API (Primary + Fallback)
        ↓
Local Memory (memory.json)
        ↓
Murf Text-to-Speech API
```

---

## 🤖 AI Models Used

- **Primary:** `models/gemini-2.5-flash`  
- **Fallback:** `models/gemini-2.5-flash-lite`

Model routing is automatic and quota-aware.

---

## ⚙️ Tech Stack

- Node.js (ES Modules)
- Express.js
- Google Gemini API
- Murf Text-to-Speech API
- Vanilla HTML / CSS / JavaScript
- Local JSON-based memory storage

No database.  
No analytics.  
No tracking.

---

## 📁 Project Structure

```
sudarshan-ai/
├── server.js
├── memory.json
├── package.json
├── .env
└── public/
    ├── index.html
    ├── script.js
    └── styles.css
```

---

## 🚀 Run Locally

### 1. Install dependencies
```bash
npm install
```

### 2. Create `.env`
```env
GEMINI_API_KEY=your_gemini_api_key
MURF_API_KEY=your_murf_api_key
```

### 3. Start the server
```bash
npm start
```

### 4. Open in browser
```
http://localhost:3000
```

---

## 🔐 Privacy & Scope

- Designed for a single primary user
- No authentication layer (intentional)
- All memory stored locally
- No cloud database

This project focuses on **system design and behavior**, not scale.

---

## 🧭 Future Improvements

- Command-based interaction (`/plan`, `/review`, `/reflect`)
- Weekly self-review summaries
- Smarter memory conflict handling
- Improved reasoning prompts
- Enhanced voice interaction

---

## 👤 Author

**Kunal Kumar**  
Computer Science & Engineering  
Focus: Data Science, AI/ML, and applied AI systems

---

### ✅ Final Note

SUDARSHAN AI is built to **think better**, not just talk better.  
The goal is long-term usefulness, clarity, and personal growth — not hype.
