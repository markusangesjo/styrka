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
      { name: "Bänkpress (skivstång eller hantlar)", sets: 3, reps: "8–10", rest: "90 sek", start: 20, step: 5 },
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

// Step size for +/- buttons (kg)
const WEIGHT_STEP = 2.5;

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
  return 0;
}

function updateProgress(dayId) {
  const day = PROGRAM.find((d) => d.id === dayId);
  if (!day) return;
  const total = day.exercises.reduce((s, ex) => s + ex.sets, 0);
  const done = day.exercises.reduce((s, ex, exIdx) => {
    for (let i = 0; i < ex.sets; i++) {
      if (state.sets[setKey(dayId, exIdx, i)]) s++;
    }
    return s;
  }, 0);
  const pct = total ? Math.round((done / total) * 100) : 0;
  const fill = document.querySelector(`[data-progress-fill="${dayId}"]`);
  const text = document.querySelector(`[data-progress-text="${dayId}"]`);
  if (fill) fill.style.width = pct + "%";
  if (text) text.textContent = `${done} / ${total} set`;
}

function adjustWeight(key, delta) {
  const current = parseFloat(state.weights[key]) || 0;
  const next = Math.max(0, Math.round((current + delta) * 10) / 10);
  state.weights[key] = next;
  saveState(state);
  // Update the display
  const display = document.querySelector(`[data-weight-display="${key}"]`);
  if (display) display.textContent = next % 1 === 0 ? next : next.toFixed(1);
}

function getSmartDefault() {
  const day = new Date().getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  if (day === 1 || day === 4) return "push";  // Mon, Thu
  if (day === 2 || day === 5) return "pull";  // Tue, Fri
  if (day === 3 || day === 6) return "legs";  // Wed, Sat
  return "push"; // Sun
}

let activeDay = getSmartDefault();

function renderTabs() {
  const main = document.querySelector("main");
  let tabBar = document.getElementById("tab-bar");
  if (!tabBar) {
    tabBar = document.createElement("div");
    tabBar.id = "tab-bar";
    tabBar.className = "tab-bar";
    main.prepend(tabBar);
  }
  tabBar.innerHTML = PROGRAM.map((day) => {
    const label = day.id.charAt(0).toUpperCase() + day.id.slice(1);
    const isActive = day.id === activeDay;
    return `<button data-day="${day.id}" class="${isActive ? "active" : ""}" aria-pressed="${isActive}">${label}</button>`;
  }).join("");

  tabBar.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-day]");
    if (!btn || btn.dataset.day === activeDay) return;
    activeDay = btn.dataset.day;
    renderTabs();
    renderProgram(activeDay);
  });
}

function renderProgram(dayId) {
  if (!dayId) dayId = activeDay;
  const root = document.getElementById("program");
  root.innerHTML = "";

  const day = PROGRAM.find((d) => d.id === dayId);
  if (!day) return;

  const section = document.createElement("section");
  section.className = "day-card";

    const header = document.createElement("div");
    header.className = "day-header";

    const total = day.exercises.reduce((s, ex) => s + ex.sets, 0);
    const done = day.exercises.reduce((s, ex, exIdx) => {
      for (let i = 0; i < ex.sets; i++) {
        if (state.sets[setKey(day.id, exIdx, i)]) s++;
      }
      return s;
    }, 0);
    const pct = total ? Math.round((done / total) * 100) : 0;

    header.innerHTML = `
      <h2>${day.name}</h2>
      <p class="subtitle">${day.subtitle}</p>
      <p class="warmup"><strong>Uppvärmning:</strong> ${day.warmup}</p>
      <div class="progress-wrap">
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" data-progress-fill="${day.id}" style="width:${pct}%"></div>
        </div>
        <span class="progress-text" data-progress-text="${day.id}">${done} / ${total} set</span>
      </div>
    `;
    section.appendChild(header);

    const table = document.createElement("div");
    table.className = "exercise-list";

    day.exercises.forEach((ex, exIdx) => {
      const exEl = document.createElement("div");
      exEl.className = "exercise";

      const prevWeight = lastLoggedWeight(day.id, exIdx) || (ex.start ?? 0);
      const exStep = ex.step ?? WEIGHT_STEP;

      const setsHtml = Array.from({ length: ex.sets })
        .map((_, setIdx) => {
          const key = setKey(day.id, exIdx, setIdx);
          const checked = state.sets[key] ? "checked" : "";
          const weight =
            state.weights[key] !== undefined ? state.weights[key] : prevWeight;
          const displayWeight = weight % 1 === 0 ? weight : parseFloat(weight).toFixed(1);

          return `<div class="set-row">
            <label class="set-check${state.sets[key] ? " is-checked" : ""}">
              <input type="checkbox" data-key="${key}" ${checked}/>
              <span>Set ${setIdx + 1}</span>
            </label>
            <div class="weight-stepper">
              <button class="stepper-btn minus" data-key="${key}" data-delta="-${exStep}" aria-label="Minska vikt">−</button>
              <span class="weight-display" data-weight-display="${key}">${displayWeight}</span>
              <span class="weight-display-unit">kg</span>
              <button class="stepper-btn plus" data-key="${key}" data-delta="${exStep}" aria-label="Öka vikt">+</button>
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

    const btnRow = document.createElement("div");
    btnRow.className = "btn-row";

    const finishBtn = document.createElement("button");
    finishBtn.className = "finish-btn";
    finishBtn.textContent = "✓ Pass klart";
    finishBtn.addEventListener("click", () => logSession(day.id, day.name));

    const resetBtn = document.createElement("button");
    resetBtn.className = "reset-btn";
    resetBtn.textContent = "Nytt pass";
    resetBtn.addEventListener("click", () => resetSession(day.id));

  btnRow.appendChild(finishBtn);
  btnRow.appendChild(resetBtn);
  section.appendChild(btnRow);

  root.appendChild(section);

  // Checkbox handler — save state + update checked styling
  root.addEventListener("change", (e) => {
    if (e.target.matches('input[type="checkbox"][data-key]')) {
      state.sets[e.target.dataset.key] = e.target.checked;
      saveState(state);
      if (navigator.vibrate) navigator.vibrate(10);
      // Toggle visual state on the parent set-check label
      const label = e.target.closest(".set-check");
      if (label) label.classList.toggle("is-checked", e.target.checked);
      // Update progress bar for this day
      const key = e.target.dataset.key;
      const dayId = key.split(":")[0];
      updateProgress(dayId);
    }
  });

  // +/- button handler
  root.addEventListener("click", (e) => {
    const btn = e.target.closest(".stepper-btn");
    if (!btn) return;
    adjustWeight(btn.dataset.key, parseFloat(btn.dataset.delta));
  });

  renderLog();
}

function resetSession(dayId) {
  if (!confirm("Rensa alla bockar för detta pass?")) return;
  // Clear only checkboxes for this day, keep weights and log intact
  const day = PROGRAM.find((d) => d.id === dayId);
  if (!day) return;
  day.exercises.forEach((ex, exIdx) => {
    for (let s = 0; s < ex.sets; s++) {
      delete state.sets[setKey(dayId, exIdx, s)];
    }
  });
  saveState(state);
  renderProgram(dayId);
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
        const w = state.weights[k];
        if (w !== undefined && w !== "" && w !== 0) {
          sessionWeights[k] = w;
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
              const w = entry.weights[k];
              if (w !== undefined && w !== null && w !== "" && w !== 0) ws.push(w);
            }
            if (!ws.length) return null;
            // Collapse identical weights: "20 kg ×3"
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

// ── Update banner ────────────────────────────────────────────────────────────
function setupUpdateBanner() {
  if (!("serviceWorker" in navigator)) return;

  navigator.serviceWorker.register("service-worker.js").then((reg) => {
    // A new SW is waiting — show banner immediately
    if (reg.waiting) showUpdateBanner(reg.waiting);

    // A new SW installs while the page is open
    reg.addEventListener("updatefound", () => {
      const newWorker = reg.installing;
      newWorker.addEventListener("statechange", () => {
        if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
          showUpdateBanner(newWorker);
        }
      });
    });
  }).catch(() => {
    // offline support is a bonus, fail silently
  });

  // When the SW activates (after skipWaiting), reload the page
  let refreshing = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });
}

function showUpdateBanner(worker) {
  const existing = document.getElementById("update-banner");
  if (existing) return;

  const banner = document.createElement("div");
  banner.id = "update-banner";
  banner.innerHTML = `
    <span>🆕 Ny version tillgänglig</span>
    <button id="update-btn">Uppdatera nu</button>
  `;
  document.body.prepend(banner);

  document.getElementById("update-btn").addEventListener("click", () => {
    worker.postMessage({ type: "SKIP_WAITING" });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderTabs();
  renderProgram(activeDay);
  setupUpdateBanner();

  // Info toggle
  const toggle = document.getElementById("info-toggle");
  const panel = document.getElementById("info-panel");
  if (toggle && panel) {
    toggle.addEventListener("click", () => {
      const hidden = panel.hasAttribute("hidden");
      if (hidden) {
        panel.removeAttribute("hidden");
        toggle.setAttribute("aria-expanded", "true");
      } else {
        panel.setAttribute("hidden", "");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }
});
