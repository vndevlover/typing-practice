const textDisplay = document.getElementById("text-display");
const textInput = document.getElementById("text-input");
const wpmDisplay = document.getElementById("wpm");
const accuracyDisplay = document.getElementById("accuracy");
const restartBtn = document.getElementById("restart-btn");
const timerSpan = document.getElementById("timer");
const timeSelect = document.getElementById("time-select");
const modeSelect = document.getElementById("mode-select");
const endSound = document.getElementById("end-sound");
const historyList = document.getElementById("history");

const container = document.querySelector(".container");

const paragraphText = `Luyện gõ phím giúp bạn tăng tốc độ đánh máy và cải thiện độ chính xác. Hãy cố gắng gõ đúng từng từ!`;
const homeRowText = `asdf jkl; asdf jkl; asdf jkl; asdf jkl; asdf jkl;`;

let sampleText = paragraphText;

let startTime;
let timerStarted = false;
let countdownInterval;
let totalTime = parseInt(timeSelect.value);
let timeLeft = totalTime;

function renderText() {
  textDisplay.innerHTML = "";
  sampleText.split("").forEach(char => {
    const span = document.createElement("span");
    span.innerText = char;
    textDisplay.appendChild(span);
  });
}

function calculateStats() {
  const elapsedTime = (new Date() - startTime) / 1000 / 60;
  const wordsTyped = textInput.value.trim().split(/\s+/).length;
  const wpm = Math.round(wordsTyped / elapsedTime);

  const expected = sampleText;
  const actual = textInput.value;
  let correctChars = 0;
  for (let i = 0; i < actual.length; i++) {
    if (actual[i] === expected[i]) correctChars++;
  }
  const accuracy = Math.round((correctChars / expected.length) * 100);

  wpmDisplay.innerText = `WPM: ${isFinite(wpm) ? wpm : 0}`;
  accuracyDisplay.innerText = `Độ chính xác: ${accuracy}%`;

  return { wpm, accuracy };
}

function startCountdown() {
  countdownInterval = setInterval(() => {
    timeLeft--;
    timerSpan.innerText = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(countdownInterval);
      textInput.disabled = true;
      const result = calculateStats();
      container.classList.add("timeout");
      endSound.play();
      saveResult(result);
    }
  }, 1000);
}

function saveResult({ wpm, accuracy }) {
  const today = new Date().toLocaleDateString("vi-VN");
  const now = new Date().toLocaleTimeString("vi-VN");
  const record = `${today} ${now} - WPM: ${wpm}, Độ chính xác: ${accuracy}%`;
  const history = JSON.parse(localStorage.getItem("typingHistory") || "[]");
  history.unshift(record);
  localStorage.setItem("typingHistory", JSON.stringify(history.slice(0, 10)));
  loadHistory();
}

function loadHistory() {
  const history = JSON.parse(localStorage.getItem("typingHistory") || "[]");
  historyList.innerHTML = "";
  history.forEach(item => {
    const li = document.createElement("li");
    li.innerText = item;
    historyList.appendChild(li);
  });
}

textInput.addEventListener("input", () => {
  const input = textInput.value.split("");
  const spanArray = textDisplay.querySelectorAll("span");

  if (!timerStarted) {
    startTime = new Date();
    timerStarted = true;
    startCountdown();
  }

  spanArray.forEach((span, index) => {
    if (input[index] == null) {
      span.classList.remove("correct", "incorrect");
    } else if (input[index] === span.innerText) {
      span.classList.add("correct");
      span.classList.remove("incorrect");
    } else {
      span.classList.add("incorrect");
      span.classList.remove("correct");
    }
  });

  calculateStats();
});

restartBtn.addEventListener("click", () => {
  sampleText = modeSelect.value === "home-row" ? homeRowText : paragraphText;
  totalTime = parseInt(timeSelect.value);
  timeLeft = totalTime;
  timerSpan.innerText = totalTime;

  clearInterval(countdownInterval);
  textInput.value = "";
  textInput.disabled = false;
  container.classList.remove("timeout");
  wpmDisplay.innerText = "WPM: 0";
  accuracyDisplay.innerText = "Độ chính xác: 100%";
  timerStarted = false;
  renderText();
  textInput.focus();
});

timeSelect.addEventListener("change", () => {
  if (!timerStarted) {
    totalTime = parseInt(timeSelect.value);
    timeLeft = totalTime;
    timerSpan.innerText = totalTime;
  }
});

modeSelect.addEventListener("change", () => {
  if (!timerStarted) {
    sampleText = modeSelect.value === "home-row" ? homeRowText : paragraphText;
    renderText();
  }
});

loadHistory();
sampleText = paragraphText;
renderText();


const fingerSelect = document.getElementById("finger-select");
const fingerDrills = {
  "left-pinky": "q a z q a z q a z",
  "left-ring": "w s x w s x w s x",
  "left-middle": "e d c e d c e d c",
  "left-index": "r t f g v b r t f g v b",
  "right-index": "y u h j n m y u h j n m",
  "right-middle": "i k , i k , i k ,",
  "right-ring": "o l . o l . o l .",
  "right-pinky": "p ; / p ; / p ; /"
};

fingerSelect.addEventListener("change", () => {
  const key = fingerSelect.value;
  if (key && fingerDrills[key]) {
    sampleText = fingerDrills[key];
    renderText();
  } else {
    sampleText = modeSelect.value === "home-row" ? homeRowText : paragraphText;
    renderText();
  }
});

document.getElementById("export-btn").addEventListener("click", () => {
  const stats = JSON.parse(localStorage.getItem("chartData") || "[]");
  if (stats.length === 0) {
    alert("Chưa có dữ liệu để xuất.");
    return;
  }

  const rows = stats.map(s => ({
    Ngày: s.date,
    WPM: s.wpm,
    "Độ chính xác (%)": s.accuracy
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Luyện gõ");

  XLSX.writeFile(workbook, "Thong_ke_go_phim.xlsx");
});


// Toggle Dark Mode
const darkModeToggle = document.createElement("button");
darkModeToggle.innerText = "🌙 Dark Mode";
darkModeToggle.style.marginTop = "10px";
darkModeToggle.onclick = () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
};
document.querySelector(".container").appendChild(darkModeToggle);

if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
}

// Quick 1-minute test
const quickTestBtn = document.createElement("button");
quickTestBtn.innerText = "🕐 Kiểm tra nhanh 1 phút";
quickTestBtn.style.marginTop = "10px";
quickTestBtn.onclick = () => {
  totalTime = 60;
  timeLeft = 60;
  timerSpan.innerText = timeLeft;
  textInput.value = "";
  textInput.disabled = false;
  container.classList.remove("timeout");
  wpmDisplay.innerText = "WPM: 0";
  accuracyDisplay.innerText = "Độ chính xác: 100%";
  timerStarted = false;
  sampleText = paragraphText;
  renderText();
  textInput.focus();
};
document.querySelector(".container").appendChild(quickTestBtn);

const langSelect = document.getElementById("lang-select");
const translations = {
  vi: {
    title: "Luyện Gõ Phím",
    mode: "🧩 Chế độ luyện tập:",
    finger: "✋ Chọn luyện theo ngón:",
    time: "⏱ Chọn thời gian luyện tập:",
    timer: "Thời gian còn lại:",
    inputPlaceholder: "Bắt đầu gõ tại đây...",
    restart: "Gõ lại",
    history: "Lịch sử luyện tập",
    chart: "📊 Biểu đồ tiến bộ",
    exportExcel: "📥 Xuất thống kê ra Excel",
    exportPDF: "📄 Xuất PDF thống kê",
    darkMode: "🌙 Dark Mode",
    quickTest: "🕐 Kiểm tra nhanh 1 phút"
  },
  en: {
    title: "Typing Practice",
    mode: "🧩 Practice Mode:",
    finger: "✋ Select Finger Drill:",
    time: "⏱ Select Practice Time:",
    timer: "Time Left:",
    inputPlaceholder: "Start typing here...",
    restart: "Restart",
    history: "Typing History",
    chart: "📊 Progress Chart",
    exportExcel: "📥 Export to Excel",
    exportPDF: "📄 Export to PDF",
    darkMode: "🌙 Dark Mode",
    quickTest: "🕐 Quick 1-minute Test"
  }
};

langSelect.addEventListener("change", () => {
  const lang = langSelect.value;
  const t = translations[lang];
  document.getElementById("title").innerText = t.title;
  document.querySelector("label[for='mode-select']").innerText = t.mode;
  document.querySelector("label[for='finger-select']").innerText = t.finger;
  document.querySelector("label[for='time-select']").innerText = t.time;
  document.querySelector(".timer").childNodes[0].nodeValue = t.timer + " ";
  document.getElementById("text-input").placeholder = t.inputPlaceholder;
  document.getElementById("restart-btn").innerText = t.restart;
  document.querySelector("h2").innerText = t.history;
  document.querySelector("h2 + canvas").previousElementSibling.innerText = t.chart;
  document.getElementById("export-btn").innerText = t.exportExcel;
  document.getElementById("export-pdf-btn").innerText = t.exportPDF;
  darkModeToggle.innerText = t.darkMode;
  quickTestBtn.innerText = t.quickTest;
});

const levelSelect = document.getElementById("level-select");
const levelTexts = {
  easy: "asdf jkl; asdf jkl; asdf jkl;",
  medium: "cat dog sun run jump",
  hard: "The quick brown fox jumps over the lazy dog.",
  advanced: `Typing practice improves your speed and accuracy. Focus on every word and try not to make mistakes!`
};

function unlockNextLevel(level) {
  const levels = ["easy", "medium", "hard", "advanced"];
  const index = levels.indexOf(level);
  if (index >= 0 && index < levels.length - 1) {
    const next = levels[index + 1];
    const opt = levelSelect.querySelector("option[value='" + next + "']");
    if (opt) opt.disabled = false;
    localStorage.setItem("unlockedLevels", JSON.stringify(levels.slice(0, index + 2)));
  }
}

function applyUnlockedLevels() {
  const unlocked = JSON.parse(localStorage.getItem("unlockedLevels") || '["easy"]');
  levelSelect.querySelectorAll("option").forEach(opt => {
    opt.disabled = !unlocked.includes(opt.value);
  });
}

levelSelect.addEventListener("change", (e) => {
  const level = e.target.value;
  sampleText = levelTexts[level] || paragraphText;
  renderText();
});

function checkLevelCompletion(result) {
  if (result.wpm >= 20 && result.accuracy >= 90) {
    const current = levelSelect.value;
    unlockNextLevel(current);
    applyUnlockedLevels();
  }
}

const originalSaveResult = saveResult;
saveResult = function(result) {
  originalSaveResult(result);
  checkLevelCompletion(result);
};

applyUnlockedLevels();
document.getElementById("start-custom").addEventListener("click", () => {
  const custom = document.getElementById("custom-text").value.trim();
  if (custom.length < 5) {
    alert("Đoạn văn quá ngắn!");
    return;
  }

  sampleText = custom;
  textInput.value = "";
  textInput.disabled = false;
  timerStarted = false;
  timeLeft = parseInt(timeSelect.value);
  timerSpan.innerText = timeLeft;
  container.classList.remove("timeout");
  wpmDisplay.innerText = "WPM: 0";
  accuracyDisplay.innerText = "Độ chính xác: 100%";
  renderText();
  textInput.focus();
});
