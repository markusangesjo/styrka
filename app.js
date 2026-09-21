// Styrka – personligt styrketräningsprogram (Push/Pull/Legs, 3 pass/vecka)
// Allt sparas lokalt i webbläsaren (localStorage). Inget skickas till någon server.

const STORAGE_KEY = "styrka-state-v1";

const PROGRAM = [
  {
    id: "push",
    name: "Pass 1 – Push",
    subtitle: "Bröst, axlar, triceps",
    warmup: "5–10 min: rodd-/cykelmaskin + armcirklar + lätta armhävningar",
    exercises: [
      { name: "Bänkpress (skivstång eller hantlar)", sets: 3, reps: "8–10", rest: "90 sek" },
      { name: "Axelpress, sittande (hantlar)", sets: 3, reps: "8–10", rest: "90 sek" },
      { name: "Lutande hantelpress eller cable press", sets: 3, reps: "10", rest: "75 sek" },
      { name: "Sidolyft axlar (hantlar)", sets: 3, reps: "12–15", rest: "60 sek" },
      { name: "Triceps pushdown (kabel)", sets: 3, reps: "10–12", rest: "60 sek" },
      { name: "Plankan", sets: 3, reps: "30–45 sek", rest: "45 sek" }
    ]
  },
  {
    id: "pull",
    name: "Pass 2 – Pull",
    subtitle: "Rygg, biceps, bakre axlar",
    warmup: "5–10 min: rodd-/cykelmaskin + axelrullningar + band pull-apart",
    exercises: [
      { name: "Latsdrag eller assisterade pull-ups", sets: 3, reps: "8–10", rest: "90 sek" },
      { name: "Sittande rodd (kabel eller hantlar)", sets: 3, reps: "8–10", rest: "90 sek" },
      { name: "Rumänsk marklyft (raka ben)", sets: 3, reps: "8–10", rest: "90 sek" },
      { name: "Face pull (kabel)", sets: 3, reps: "12–15", rest: "60 sek" },
      { name: "Bicepscurl (hantlar)", sets: 3, reps: "10–12", rest: "60 sek" },
      { name: "Sidoplanka", sets: 2, reps: "30 sek / sida", rest: "45 sek" }
    ]
  },
  {
    id: "legs",
    name: "Pass 3 – Legs",
    subtitle: "Ben, säte, vader",
    warmup: "5–10 min: cykel + höftcirklar + kroppsviktsknäböj",
    exercises: [
      { name: "Knäböj eller benpress", sets: 3, reps: "8–10", rest: "120 sek" },
      { name: "Utfallssteg (hantlar)", sets: 3, reps: "10 / ben", rest: "90 sek" },
      { name: "Marklyft, rak stång (lätt vikt, teknikfokus)", sets: 3, reps: "8", rest: "120 sek" },
      { name: "Bencurl (liggande/sittande maskin)", sets: 3, reps: "10–12", rest: "60 sek" },
      { name: "Tåhävningar (vader)", sets: 3, reps: "15", rest: "45 sek" },
      { name: "Situps / crunches", sets: 3, reps: "15", rest: "45 sek" }
    ]
  }
];

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { sets: {}, log: [] };
  } catch {
    return { sets: {}, log: [] };
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

let state = loadState();

function setKey(dayId, exIdx, setIdx) {
  return `${dayId}:${exIdx}:${setIdx}`;
}

function renderProgram() {
  const root = document.getElementById("program");
  root.innerHTML = "";

  PROGRAM.forEach((day) => {
    const section = document.createElement("section");
    section.className = "day-card";

    const header = document.createElement("div");
    header.className = "day-header";
    header.innerHTML = `
      <h2>${day.name}</h2>
      <p class="subtitle">${day.subtitle}</p>
      <p class="warmup"><strong>Uppvärmning:</strong> ${day.warmup}</p>
    `;
    section.appendChild(header);

    const table = document.createElement("div");
    table.className = "exercise-list";

    day.exercises.forEach((ex, exIdx) => {
      const exEl = document.createElement("div");
      exEl.className = "exercise";

      const setsHtml = Array.from({ length: ex.sets })
        .map((_, setIdx) => {
          const key = setKey(day.id, exIdx, setIdx);
          const checked = state.sets[key] ? "checked" : "";
          return `<label class="set-check">
            <input type="checkbox" data-key="${key}" ${checked}/>
            <span>Set ${setIdx + 1}</span>
          </label>`;
        })
        .join("");

      exEl.innerHTML = `
        <div class="exercise-name">${ex.name}</div>
        <div class="exercise-meta">${ex.reps} reps &middot; vila ${ex.rest}</div>
        <div class="sets-row">${setsHtml}</div>
      `;
      table.appendChild(exEl);
    });

    section.appendChild(table);

    const finishBtn = document.createElement("button");
    finishBtn.className = "finish-btn";
    finishBtn.textContent = "Markera pass som klart";
    finishBtn.addEventListener("click", () => logSession(day.id, day.name));
    section.appendChild(finishBtn);

    root.appendChild(section);
  });

  root.addEventListener("change", (e) => {
    if (e.target.matches('input[type="checkbox"][data-key]')) {
      state.sets[e.target.dataset.key] = e.target.checked;
      saveState(state);
    }
  });

  renderLog();
}

function logSession(dayId, dayName) {
  const today = new Date().toISOString().slice(0, 10);
  state.log.unshift({ dayId, dayName, date: today });
  saveState(state);
  renderLog();
}

function renderLog() {
  const logEl = document.getElementById("log");
  if (!state.log.length) {
    logEl.innerHTML = "<p class='muted'>Inga genomförda pass ännu. Kör igång!</p>";
    return;
  }
  logEl.innerHTML =
    "<h2>Träningslogg</h2><ul>" +
    state.log
      .slice(0, 20)
      .map((entry) => `<li>${entry.date} – ${entry.dayName}</li>`)
      .join("") +
    "</ul>";
}

document.addEventListener("DOMContentLoaded", () => {
  renderProgram();

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js").catch(() => {
      /* offline-stöd är en bonus, ignorera fel tyst */
    });
  }
});
