/* ==========================================
   Global Variables & State Management
   ========================================== */
let allSigns = window.ROAD_SIGNS || [];
let deck = [];
let current = null;
let score = 0;
let answered = 0;
let locked = false;

// DOM Selector Helper
const $ = (id) => document.getElementById(id);

/* ==========================================
   Event Listeners & Initialization
   ========================================== */
$("category").addEventListener("change", buildDeck);
$("mode").addEventListener("change", renderCurrent);
$("restart").addEventListener("click", buildDeck);
$("next").addEventListener("click", nextQuestion);

// Run initial setup on load
buildDeck();

/* ==========================================
   Core Game Flow Functions
   ========================================== */
function buildDeck() {
  const cat = $("category").value;
  deck = shuffle(allSigns.filter((x) => cat === "all" || x.category === cat));
  score = 0;
  answered = 0;
  current = null;
  locked = false;

  updateScore();
  nextQuestion();
}

function nextQuestion() {
  if (deck.length === 0) {
    current = null;
    $("signImage").removeAttribute("src");
    $("question").textContent = "Quiz complete. Restart to practise again.";
    $("answers").innerHTML = "";
    $("feedback").hidden = false;
    $("feedback").textContent = `Final score: ${score} / ${answered}`;
    $("next").disabled = true;
    updateProgress();
    return;
  }

  current = deck.shift();
  locked = false;
  $("next").disabled = true;
  $("feedback").hidden = true;

  renderCurrent();
  updateProgress();
}

/* ==========================================
   Rendering & DOM Injection
   ========================================== */
function renderCurrent() {
  if (!current) return;

  const mode = $("mode").value;

  $("qNumber").textContent = `Question ${answered + 1}`;
  $("categoryLabel").textContent = current.category;
  $("signImage").src = current.image;
  $("question").textContent =
    mode === "meaning"
      ? "What does this road sign mean?"
      : "Which code identifies this road sign?";

  const options = makeOptions(current, mode);
  $("answers").innerHTML = "";

  options.forEach((opt) => {
    const b = document.createElement("button");
    b.className = "answer";
    b.textContent = opt;
    b.onclick = () => choose(b, opt, mode);
    $("answers").appendChild(b);
  });
}

/* ==========================================
   Game Mechanics & Scoring
   ========================================== */
function choose(btn, value, mode) {
  if (locked) return;
  locked = true;
  answered++;

  const correct = mode === "meaning" ? current.meaning : current.code;
  const ok = value === correct;

  if (ok) score++;

  // Disable all buttons and highlight the correct one
  document.querySelectorAll(".answer").forEach((b) => {
    b.disabled = true;
    if (b.textContent === correct) {
      b.classList.add("correct");
    }
  });

  // Highlight chosen button if it was wrong
  if (!ok) {
    btn.classList.add("wrong");
  }

  // Display dynamic feedback
  $("feedback").hidden = false;
  $("feedback").innerHTML = ok
    ? `<strong>Correct.</strong> ${mode === "meaning" ? `This is <b>${current.code}</b>.` : current.meaning + "."}`
    : `<strong>Not quite.</strong> Correct answer: <b>${correct}</b>.`;

  $("next").disabled = false;
  updateScore();
  updateProgress();
}

/* ==========================================
   Utility & Helper Functions
   ========================================== */
function makeOptions(item, mode) {
  const key = mode === "meaning" ? "meaning" : "code";
  const pool = shuffle(
    allSigns.filter((x) => x.code !== item.code && x[key] !== item[key]),
  );
  const out = [item[key], ...pool.slice(0, 3).map((x) => x[key])];

  return shuffle([...new Set(out)]).slice(0, 4);
}

function updateScore() {
  $("score").textContent = `${score} / ${answered}`;
}

function updateProgress() {
  const total = allSigns.filter(
    (x) => $("category").value === "all" || x.category === $("category").value,
  ).length;
  $("progressBar").style.width = total
    ? `${Math.min(100, (answered / total) * 100)}%`
    : "0%";
}

function shuffle(a) {
  return [...a].sort(() => Math.random() - 0.5);
}
