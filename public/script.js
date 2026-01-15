console.log("script.js loaded");

// ===============================
// BASIC REFERENCES
// ===============================
const input = document.getElementById("input");
const messages = document.getElementById("messages");
const sendBtn = document.getElementById("sendBtn");
const voiceBtn = document.getElementById("voiceToggle");
const micBtn = document.getElementById("micBtn");
const voiceSelect = document.getElementById("voiceSelect");

// ===============================
// STATES
// ===============================
let voiceEnabled = false;
let micEnabled = false;
let recognition = null;
let audioPlayer = null;

// ===============================
// 🔊 SPEAKER TOGGLE (FIXED)
// ===============================
voiceBtn.addEventListener("click", () => {
  voiceEnabled = !voiceEnabled;
  voiceBtn.innerText = voiceEnabled ? "🔊 VOICE ON" : "🔇 VOICE OFF";

  // stop audio immediately when OFF
  if (!voiceEnabled && audioPlayer) {
    audioPlayer.pause();
    audioPlayer.currentTime = 0;
    audioPlayer = null;
  }
});

// ===============================
// 🎤 MIC TOGGLE (FIXED)
// ===============================
micBtn.addEventListener("click", () => {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Speech recognition not supported. Use Chrome / Edge.");
    return;
  }

  // MIC ON
  if (!micEnabled) {
    recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      micEnabled = true;
      micBtn.innerText = "🎤 MIC ON";
      addMsg("🎧 Listening...", "ai");
    };

    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript.trim();
      if (spokenText) sendMessage(spokenText);
    };

    recognition.onerror = (e) => {
      addMsg("❌ Mic error: " + e.error, "ai");
      stopMic();
    };

    recognition.onend = () => {
      stopMic();
    };

    recognition.start();
  }
  // MIC OFF
  else {
    stopMic();
  }
});

function stopMic() {
  if (recognition) {
    recognition.stop();
    recognition = null;
  }
  micEnabled = false;
  micBtn.innerText = "🎤 SPEAK";
}

// ===============================
// ⌨️ INPUT HANDLING
// ===============================

// auto resize textarea
input.addEventListener("input", () => {
  input.style.height = "auto";
  input.style.height = input.scrollHeight + "px";
});

// Enter = send | Shift+Enter = newline
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendText();
  }
});

sendBtn.addEventListener("click", sendText);

function sendText() {
  const text = input.value.trim();
  if (!text) return;

  input.value = "";
  input.style.height = "auto";
  sendMessage(text);
}

// ===============================
// CORE CHAT FLOW
// ===============================
async function sendMessage(text) {
  addMsg(text, "user");
  const loader = addMsg("Processing...", "ai");

  try {
    const res = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    });

    const data = await res.json();
    loader.remove();

    const reply = data.reply || "No response received.";
    addMsg(reply, "ai");

    if (voiceEnabled) {
      speak(reply);
    }
  } catch {
    loader.remove();
    addMsg("❌ Backend unreachable", "ai");
  }
}

// ===============================
// 🔊 VOICE OUTPUT (MURF) — STABLE
// ===============================
function cleanForSpeech(text) {
  return text
    .replace(/[^\w\s.,!?]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

async function speak(text) {
  try {
    if (audioPlayer) {
      audioPlayer.pause();
      audioPlayer.currentTime = 0;
      audioPlayer = null;
    }

    const res = await fetch("/speak", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: cleanForSpeech(text),
        voiceId: voiceSelect.value
      })
    });

    const data = await res.json();
    if (!data.audio) return;

    audioPlayer = new Audio(data.audio);
    audioPlayer.onended = () => (audioPlayer = null);
    audioPlayer.play();
  } catch {
    addMsg("❌ Voice output failed", "ai");
  }
}

// ===============================
// UI HELPERS (AVATAR SAFE)
// ===============================
function addMsg(text, cls) {
  const wrap = document.createElement("div");
  wrap.className = `msg-wrapper ${cls}`;

  const avatar = document.createElement("img");
  avatar.src = cls === "ai" ? "ai.png" : "user.png";
  avatar.className = "avatar";

  const msg = document.createElement("div");
  msg.className = `msg ${cls}`;
  msg.innerText = text;

  cls === "ai"
    ? wrap.append(avatar, msg)
    : wrap.append(msg, avatar);

  messages.appendChild(wrap);
  messages.scrollTop = messages.scrollHeight;
  return msg;
}
