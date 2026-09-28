// Styrka – personligt styrketräningsprogram (Push/Pull/Legs, 3 pass/vecka)
// Allt sparas lokalt i webbläsaren (localStorage). Inget skickas till någon server.

const STORAGE_KEY = "styrka-state-v2";
const STORAGE_KEY_V1 = "styrka-state-v1";

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

// Migrate v1 state (no weights) to v2
function migrateState() {
  const v1Raw = localStorage.getItem(STORAGE_KEY_V1);
  if (v1Raw && !localStorage.getItem(STORAGE_KEY)) {
    try {
      const v1 = JSON.parse(v1Raw);
      const v2 = { sets: v1.sets || {}, weights: {}, log: v1.log || [] };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(v2));
    } catch {
      // ignore corrupt v1 data
    }
  }
}

function loadState() {
  migrateState();
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { sets: {}, weights: {}, log: [] };
  } catch {
    return { sets: {}, weights: {}, log: [] };
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

let state = loadState();

function setKey(dayId, exIdx, setIdx) {
  return `${dayId}:${exIdx}:${setIdx}`;
}

// Returns the last logged weight for an exercise (from log history), for pre-filling
function lastLoggedWeight(dayId, exIdx) {
  for (const entry of state.log) {
    if (entry.weights) {
      for (let s = 0; s < 10; s++) {
        const k = setKey(dayId, exIdx, s);
        if (entry.weights[k] !== undefined && entry.weights[k] !== "") {
          return entry.weights[k];
        }
      }
    }
  }
  return "";
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

      const prevWeight = lastLoggedWeight(day.id, exIdx);

      const setsHtml = Array.from({ length: ex.sets })
        .map((_, setIdx) => {
          const key = setKey(day.id, exIdx, setIdx);
          const checked = state.sets[key] ? "checked" : "";
          // Use saved weight for this set, fall back to last logged weight
          const weight =
            state.weights[key] !== undefined ? state.weights[key] : prevWeight;
          return `<div class="set-row">
            <label class="set-check">
              <input type="checkbox" data-key="${key}" ${checked}/>
              <span>Set ${setIdx + 1}</span>
            </label>
            <div class="weight-input-wrap">
              <input
                type="number"
                class="weight-input"
                data-weight-key="${key}"
                value="${weight}"
                min="0"
                step="0.5"
                placeholder="–"
                aria-label="Vikt för set ${setIdx + 1}"
              />
              <span class="weight-unit">kg</span>
            </div>
          </div>`;
        })
        .join("");

      exEl.innerHTML = `
        <div class="exercise-name">${ex.name}</div>
        <div class="exercise-meta">${ex.reps} reps &middot; vila ${ex.rest}</div>
        <div class="sets-rows">${setsHtml}</div>
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

  // Checkbox handler
  root.addEventListener("change", (e) => {
    if (e.target.matches('input[type="checkbox"][data-key]')) {
      state.sets[e.target.dataset.key] = e.target.checked;
      saveState(state);
    }
    if (e.target.matches('input[type="number"][data-weight-key]')) {
      const val = e.target.value.trim();
      state.weights[e.target.dataset.weightKey] =
        val === "" ? "" : parseFloat(val);
      saveState(state);
    }
  });

  // Also save weight on blur (handles mobile keyboards that don't fire change)
  root.addEventListener(
    "blur",
    (e) => {
      if (e.target.matches('input[type="number"][data-weight-key]')) {
        const val = e.target.value.trim();
        state.weights[e.target.dataset.weightKey] =
          val === "" ? "" : parseFloat(val);
        saveState(state);
      }
    },
    true
  );

  renderLog();
}

function logSession(dayId, dayName) {
  const today = new Date().toISOString().slice(0, 10);

  // Snapshot current weights for this day
  const day = PROGRAM.find((d) => d.id === dayId);
  const sessionWeights = {};
  if (day) {
    day.exercises.forEach((ex, exIdx) => {
      for (let s = 0; s < ex.sets; s++) {
        const k = setKey(dayId, exIdx, s);
        if (state.weights[k] !== undefined && state.weights[k] !== "") {
          sessionWeights[k] = state.weights[k];
        }
      }
    });
  }

  state.log.unshift({ dayId, dayName, date: today, weights: sessionWeights });
  saveState(state);
  renderLog();
}

function renderLog() {
  const logEl = document.getElementById("log");
  if (!state.log.length) {
    logEl.innerHTML =
      "<p class='muted'>Inga genomförda pass ännu. Kör igång!</p>";
    return;
  }

  const rows = state.log
    .slice(0, 20)
    .map((entry) => {
      const day = PROGRAM.find((d) => d.id === entry.dayId);
      let weightSummary = "";

      if (entry.weights && day) {
        const lines = day.exercises
          .map((ex, exIdx) => {
            const ws = [];
            for (let s = 0; s < ex.sets; s++) {
              const k = setKey(entry.dayId, exIdx, s);
              if (entry.weights[k] !== undefined) ws.push(entry.weights[k]);
            }
            if (!ws.length) return null;
            // Collapse identical weights: "20 kg ×3" instead of "20, 20, 20"
            const collapsed = ws
              .reduce((acc, w) => {
                if (acc.length && acc[acc.length - 1].w === w) {
                  acc[acc.length - 1].n++;
                } else {
                  acc.push({ w, n: 1 });
                }
                return acc;
              }, [])
              .map(({ w, n }) => (n > 1 ? `${w} kg ×${n}` : `${w} kg`))
              .join(", ");
            return `<span class="log-ex"><em>${ex.name}:</em> ${collapsed}</span>`;
          })
          .filter(Boolean);

        if (lines.length) {
          weightSummary = `<div class="log-weights">${lines.join("")}</div>`;
        }
      }

      return `<li>
        <div class="log-entry-header">${entry.date} – ${entry.dayName}</div>
        ${weightSummary}
      </li>`;
    })
    .join("");

  logEl.innerHTML = "<h2>Träningslogg</h2><ul>" + rows + "</ul>";
}

document.addEventListener("DOMContentLoaded", () => {
  renderProgram();

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js").catch(() => {
      /* offline-stöd är en bonus, ignorera fel tyst */
    });
  }
});
