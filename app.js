// Styrka – personligt styrketräningsprogram (Push/Pull/Legs, 3 pass/vecka)
// Allt sparas lokalt i webbläsaren (localStorage). Inget skickas till någon server.

const STORAGE_KEY = "styrka-state-v2";
const STORAGE_KEY_V1 = "styrka-state-v1";
const LIBRARY_KEY = "styrka-library-v1";

// ── Exercise library data ─────────────────────────────────────────────────────

const DEFAULT_LIBRARY = [
  {
    id: "bankpress",
    name: "Bänkpress (skivstång eller hantlar)",
    muscle: "Bröst",
    description: "Grundövning för bröst. Ligg på bänken, ta ett grepp lite bredare än axelbredd. Sänk stången kontrollerat till bröstet och pressa upp.",
    tips: "Håll skulderbladen ihop och bakåt. Håll fötterna i golvet.",
    defaultWeight: 20,
    step: 5,
    sets: 3,
    reps: "8–10",
    rest: "90 sek",
    days: ["push"]
  },
  {
    id: "axelpress-sittande",
    name: "Axelpress, sittande (hantlar)",
    muscle: "Axlar",
    description: "Sittande axelpress med hantlar. Håll hantelarna i axelhöjd med armbågarna utåt och pressa upp till armarna är raka.",
    tips: "Undvik att svänga med ryggen. Håll core aktiverat under hela rörelsen.",
    defaultWeight: 10,
    step: 2.5,
    sets: 3,
    reps: "8–10",
    rest: "90 sek",
    days: ["push"]
  },
  {
    id: "lutande-hantelpress",
    name: "Lutande hantelpress eller cable press",
    muscle: "Bröst",
    description: "Tränar övre bröstmuskulaturen. Utförs på lutande bänk med hantlar eller kabelmaskin. Pressa uppåt och lätt inåt.",
    tips: "Sänk kontrollerat. Undvik att låsa ut armbågarna helt i toppläget.",
    defaultWeight: 10,
    step: 2.5,
    sets: 3,
    reps: "10",
    rest: "75 sek",
    days: ["push"]
  },
  {
    id: "sidolyft-axlar",
    name: "Sidolyft axlar (hantlar)",
    muscle: "Axlar",
    description: "Isolationsövning för de laterala deltoideusmusklerna. Lyft hantelarna ut åt sidorna till axelhöjd med lätt böjda armar.",
    tips: "Håll rörelsen kontrollerad, undvik att svänga med kroppen. Fokusera på att lyfta med axlarna.",
    defaultWeight: 5,
    step: 2.5,
    sets: 3,
    reps: "12–15",
    rest: "60 sek",
    days: ["push"]
  },
  {
    id: "triceps-pushdown",
    name: "Triceps pushdown (kabel)",
    muscle: "Triceps",
    description: "Isolationsövning för triceps med kabelmaskin. Stå upprätt, håll armbågarna nära kroppen och pressa kabeln nedåt till armarna är raka.",
    tips: "Håll överkroppen stilla. Armbågarna ska vara fasta – bara underarmen rör sig.",
    defaultWeight: 15,
    step: 2.5,
    sets: 3,
    reps: "10–12",
    rest: "60 sek",
    days: ["push"]
  },
  {
    id: "plankan",
    name: "Plankan",
    muscle: "Core",
    description: "Statisk coreövning. Håll kroppen rak i plankaposition med stöd på underarmarna och tårna. Håll positionen under angiven tid.",
    tips: "Undvik att lyfta höfterna för högt eller sjunka med ryggen. Andas normalt.",
    defaultWeight: 0,
    step: 0,
    sets: 3,
    reps: "30–45 sek",
    rest: "45 sek",
    days: ["push"]
  },
  {
    id: "latsdrag",
    name: "Latsdrag eller assisterade pull-ups",
    muscle: "Rygg",
    description: "Grundövning för latissimus dorsi. Dra stången eller handtaget ned mot övre bröstet med rak rygg.",
    tips: "Undvik att svänga med kroppen. Tänk på att dra med armbågarna nedåt och bakåt.",
    defaultWeight: 40,
    step: 5,
    sets: 3,
    reps: "8–10",
    rest: "90 sek",
    days: ["pull"]
  },
  {
    id: "sittande-rodd",
    name: "Sittande rodd (kabel eller hantlar)",
    muscle: "Rygg",
    description: "Roddövning som tränar hela ryggen, framförallt de mellersta delarna. Dra handtaget mot buken med rak rygg.",
    tips: "Håll ryggen rak och bröstkorgen upp. Dra armbågarna bakåt, inte uppåt.",
    defaultWeight: 30,
    step: 5,
    sets: 3,
    reps: "8–10",
    rest: "90 sek",
    days: ["pull"]
  },
  {
    id: "rumansk-marklyft",
    name: "Rumänsk marklyft (raka ben)",
    muscle: "Bakre lår",
    description: "Tränar bakre lårmuskulaturen och sätesmusklerna. Håll stången nära kroppen och böj i höften med raka ben (svagt böjda knän).",
    tips: "Håll ryggen rak. Känn sträcket i bakre låret. Gå inte lägre än du kan hålla ryggen neutral.",
    defaultWeight: 30,
    step: 5,
    sets: 3,
    reps: "8–10",
    rest: "90 sek",
    days: ["pull"]
  },
  {
    id: "face-pull",
    name: "Face pull (kabel)",
    muscle: "Bakre axlar",
    description: "Tränar bakre deltoideus och rotatorkuffen. Dra kabeln mot ansiktet med armbågarna högt och ut åt sidan.",
    tips: "Håll armbågarna i axelhöjd eller högre. Bra för att motverka framåtrundat läge.",
    defaultWeight: 15,
    step: 2.5,
    sets: 3,
    reps: "12–15",
    rest: "60 sek",
    days: ["pull"]
  },
  {
    id: "bicepscurl",
    name: "Bicepscurl (hantlar)",
    muscle: "Biceps",
    description: "Isolationsövning för biceps. Stå eller sitt med hantelarna längs sidan, curl upp med kontroll.",
    tips: "Håll armbågarna fixerade vid sidan. Undvik att svänga med kroppen för att hjälpa upp vikten.",
    defaultWeight: 8,
    step: 2.5,
    sets: 3,
    reps: "10–12",
    rest: "60 sek",
    days: ["pull"]
  },
  {
    id: "sidoplanka",
    name: "Sidoplanka",
    muscle: "Core",
    description: "Statisk coreövning som tränar de oblika bukmusklerna. Håll kroppen rak på sidan med stöd på underarmen och foten.",
    tips: "Håll höfterna uppe. Undvik att rulla framåt eller bakåt. Byt sida.",
    defaultWeight: 0,
    step: 0,
    sets: 2,
    reps: "30 sek / sida",
    rest: "45 sek",
    days: ["pull"]
  },
  {
    id: "knaboj-eller-benpress",
    name: "Knäböj eller benpress",
    muscle: "Quadriceps",
    description: "Grundövning för benen. Knäböj med stång på ryggen eller benpress i maskin. Gå ned tills låren är parallella med golvet.",
    tips: "Håll knäna i linje med tårna. Håll hälen i golvet och ryggen rak.",
    defaultWeight: 40,
    step: 5,
    sets: 3,
    reps: "8–10",
    rest: "120 sek",
    days: ["legs"]
  },
  {
    id: "utfallssteg",
    name: "Utfallssteg (hantlar)",
    muscle: "Quadriceps",
    description: "Utfallssteg med hantlar tränar quadriceps, säte och balansmuskler. Ta ett stort steg framåt och sänk bakre knät mot golvet.",
    tips: "Håll överkroppen upprätt. Framre knät ska inte gå förbi tårna.",
    defaultWeight: 10,
    step: 2.5,
    sets: 3,
    reps: "10 / ben",
    rest: "90 sek",
    days: ["legs"]
  },
  {
    id: "marklyft-teknik",
    name: "Marklyft, rak stång (lätt vikt, teknikfokus)",
    muscle: "Rygg/Lår",
    description: "Marklyft med fokus på teknik och rörlighet. Lyft stången från golvet med rak rygg, drivkraft från benen och höfterna.",
    tips: "Håll stången nära kroppen. Lås blicken framåt-nedåt. Aktivera core innan lyftet.",
    defaultWeight: 30,
    step: 5,
    sets: 3,
    reps: "8",
    rest: "120 sek",
    days: ["legs"]
  },
  {
    id: "bencurl",
    name: "Bencurl (liggande/sittande maskin)",
    muscle: "Bakre lår",
    description: "Isolationsövning för bakre lårmuskulaturen. Använd bencurlmaskin, liggande eller sittande. Curl upp kontrollerat.",
    tips: "Håll höfterna nedtryckta mot bänken. Rör inte på ryggen under övningen.",
    defaultWeight: 25,
    step: 5,
    sets: 3,
    reps: "10–12",
    rest: "60 sek",
    days: ["legs"]
  },
  {
    id: "tahavningar",
    name: "Tåhävningar (vader)",
    muscle: "Vader",
    description: "Isolationsövning för vaderna. Stå med fötterna höftbrett isär, res dig upp på tårna och sänk kontrollerat.",
    tips: "Gå igenom hela rörelseomfånget. Håll toppen en sekund för bättre kontraktion.",
    defaultWeight: 0,
    step: 5,
    sets: 3,
    reps: "15",
    rest: "45 sek",
    days: ["legs"]
  },
  {
    id: "situps-crunches",
    name: "Situps / crunches",
    muscle: "Core",
    description: "Mageövning som tränar raka bukmusklerna. Ligg på rygg med knäna böjda, lyft överkroppen mot knäna.",
    tips: "Undvik att dra i nacken. Fokusera på att rulla upp med bukmuskeln.",
    defaultWeight: 0,
    step: 0,
    sets: 3,
    reps: "15",
    rest: "45 sek",
    days: ["legs"]
  }
];

// ── Library functions ─────────────────────────────────────────────────────────

function initLibrary() {
  if (localStorage.getItem(LIBRARY_KEY)) return;
  localStorage.setItem(LIBRARY_KEY, JSON.stringify(DEFAULT_LIBRARY));
}

function loadLibrary() {
  try {
    return JSON.parse(localStorage.getItem(LIBRARY_KEY)) || DEFAULT_LIBRARY;
  } catch {
    return DEFAULT_LIBRARY;
  }
}

function saveLibrary(lib) {
  localStorage.setItem(LIBRARY_KEY, JSON.stringify(lib));
}

function buildProgramFromLibrary() {
  const lib = loadLibrary();
  const days = [
    { id: "push", name: "Pass 1 – Push", subtitle: "Bröst, axlar, triceps", warmup: "5–10 min: rodd-/cykelmaskin + armcirklar + lätta armhävningar" },
    { id: "pull", name: "Pass 2 – Pull", subtitle: "Rygg, biceps, bakre axlar", warmup: "5–10 min: rodd-/cykelmaskin + axelrullningar + band pull-apart" },
    { id: "legs", name: "Pass 3 – Legs", subtitle: "Ben, säte, vader", warmup: "5–10 min: cykel + höftcirklar + kroppsviktsknäböj" }
  ];
  return days.map(day => ({
    ...day,
    exercises: lib
      .filter(ex => ex.days.includes(day.id))
      .map(ex => ({ name: ex.name, id: ex.id, sets: ex.sets, reps: ex.reps, rest: ex.rest, start: ex.defaultWeight, step: ex.step }))
  }));
}

// ── State management ──────────────────────────────────────────────────────────

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
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { sets: {}, weights: {}, reps: {}, log: [] };
  } catch {
    return { sets: {}, weights: {}, reps: {}, log: [] };
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// ── Init library + program ────────────────────────────────────────────────────

initLibrary();
let PROGRAM = buildProgramFromLibrary();
let state = loadState();

// ── Helpers ───────────────────────────────────────────────────────────────────

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
  if (text) text.textContent = progressText(day, dayId, done, total);
}

// Remaining expected seconds for a day, scaled by unchecked sets per exercise.
function remainingDaySeconds(dayId, day) {
  return day.exercises.reduce((s, ex, exIdx) => {
    let doneEx = 0;
    for (let i = 0; i < ex.sets; i++) {
      if (state.sets[setKey(dayId, exIdx, i)]) doneEx++;
    }
    if (doneEx >= ex.sets) return s;
    return s + (expectedExerciseSeconds(ex) * (ex.sets - doneEx)) / ex.sets;
  }, 0);
}

// "12 / 15 set · klar ca 19:14" (or without ETA when nearly done)
function progressText(day, dayId, done, total) {
  const remaining = remainingDaySeconds(dayId, day);
  if (remaining <= 60) return `${done} / ${total} set`;
  const eta = new Date(Date.now() + remaining * 1000);
  const hh = String(eta.getHours()).padStart(2, "0");
  const mm = String(eta.getMinutes()).padStart(2, "0");
  return `${done} / ${total} set · ${fmtMinutes(remaining)} kvar · klar ca ${hh}:${mm}`;
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

// Parse the rep target from an exercise reps string ("8–10" → 10).
// Returns null for time-based exercises ("30–45 sek", "30 sek / sida").
function parseDefaultReps(repsStr) {
  if (!repsStr || /sek|sida/i.test(repsStr)) return null;
  const nums = String(repsStr).match(/\d+/g);
  return nums ? Math.max(...nums.map(Number)) : null;
}

// Time-based exercise ("30–45 sek", "30 sek / sida") → counted in seconds, not reps/kg.
// Display helper: "sek" → "s" (avoids confusion with SEK currency).
function fmtSek(str) {
  return String(str ?? "").replace(/sek/g, "s");
}
function isTimedExercise(ex) {
  return !!(ex && ex.reps && /sek|sida/i.test(ex.reps));
}

// Estimated duration per set (s): timed exercises use target seconds,
// rep-based exercises assume ~4 s per rep.
function workSecondsPerSet(ex) {
  return isTimedExercise(ex)
    ? parseDefaultSeconds(ex)
    : Math.round((parseDefaultReps(ex.reps) || 10) * 4);
}

function parseRestSeconds(restStr) {
  const m = String(restStr || "").match(/\d+/);
  return m ? Number(m[0]) : 60;
}

// Expected exercise duration: work for all sets + rest between sets (not after last).
function expectedExerciseSeconds(ex) {
  const sets = ex.sets || 3;
  return sets * workSecondsPerSet(ex) + (sets - 1) * parseRestSeconds(ex.rest);
}

function fmtMinutes(sec) {
  const m = Math.round(sec / 60);
  return m < 1 ? "<1 min" : `${m} min`;
}

// Target seconds from the reps string ("30–45 sek" → 45).
function parseDefaultSeconds(ex) {
  const nums = String(ex.reps || "").match(/\d+/g);
  return nums ? Math.max(...nums.map(Number)) : 30;
}

// Returns the last logged reps for an exercise (from log history)
function lastLoggedReps(dayId, exIdx) {
  for (const entry of state.log) {
    if (entry.reps) {
      for (let s = 0; s < 10; s++) {
        const k = setKey(dayId, exIdx, s);
        if (entry.reps[k] !== undefined && entry.reps[k] !== "") {
          return entry.reps[k];
        }
      }
    }
  }
  return null;
}

function adjustReps(key, delta, fallback) {
  const current = state.reps && state.reps[key] !== undefined ? state.reps[key] : fallback;
  const next = Math.max(0, (current || 0) + delta);
  if (!state.reps) state.reps = {};
  state.reps[key] = next;
  saveState(state);
  const display = document.querySelector(`[data-reps-display="${key}"]`);
  if (display) display.textContent = next;
}

function getSmartDefault() {
  const day = new Date().getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  if (day === 1 || day === 4) return "push";  // Mon, Thu
  if (day === 2 || day === 5) return "pull";  // Tue, Fri
  if (day === 3 || day === 6) return "legs";  // Wed, Sat
  return "push"; // Sun
}

let activeDay = getSmartDefault();

// ── Render tabs ───────────────────────────────────────────────────────────────

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

// ── Render program ────────────────────────────────────────────────────────────

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
  const daySeconds = day.exercises.reduce((s, ex) => s + expectedExerciseSeconds(ex), 0);
  const done = day.exercises.reduce((s, ex, exIdx) => {
    for (let i = 0; i < ex.sets; i++) {
      if (state.sets[setKey(day.id, exIdx, i)]) s++;
    }
    return s;
  }, 0);
  const pct = total ? Math.round((done / total) * 100) : 0;

  header.innerHTML = `
    <h2>${day.name}</h2>
    <p class="subtitle">${day.subtitle} · ≈ ${fmtMinutes(daySeconds)}</p>
    <p class="warmup"><strong>Uppvärmning:</strong> ${day.warmup}</p>
  `;
  section.appendChild(header);

  // Sticky progress bar — rendered outside the card, pinned below tab bar
  const stickyProgress = document.createElement("div");
  stickyProgress.className = "sticky-progress";
  stickyProgress.innerHTML = `
    <div class="progress-bar-bg">
      <div class="progress-bar-fill" data-progress-fill="${day.id}" style="width:${pct}%"></div>
    </div>
    <span class="progress-text" data-progress-text="${day.id}">${progressText(day, day.id, done, total)}</span>
  `;
  root.appendChild(stickyProgress);

  const table = document.createElement("div");
  table.className = "exercise-list";

  day.exercises.forEach((ex, exIdx) => {
    const exEl = document.createElement("div");
    exEl.className = "exercise";

    const prevWeight = lastLoggedWeight(day.id, exIdx) || (ex.start ?? 0);
    const exStep = ex.step ?? 2.5;
    const timed = isTimedExercise(ex);
    const defaultReps = timed ? null : parseDefaultReps(ex.reps);
    const defaultSeconds = timed ? parseDefaultSeconds(ex) : null;

    const setsHtml = Array.from({ length: ex.sets })
      .map((_, setIdx) => {
        const key = setKey(day.id, exIdx, setIdx);
        const checked = state.sets[key] ? "checked" : "";
        const weight =
          state.weights[key] !== undefined ? state.weights[key] : prevWeight;
        const displayWeight = weight % 1 === 0 ? weight : parseFloat(weight).toFixed(1);

        const weightHtml = timed ? "" : `
          <div class="weight-stepper">
            <button class="stepper-btn minus" data-key="${key}" data-delta="-${exStep}" aria-label="Minska vikt">−</button>
            <span class="weight-display" data-weight-display="${key}">${displayWeight}</span>
            <span class="weight-display-unit">kg</span>
            <button class="stepper-btn plus" data-key="${key}" data-delta="${exStep}" aria-label="Öka vikt">+</button>
          </div>`;

        // Reps / seconds: saved > last logged > exercise default
        let repsHtml = "";
        if (timed || defaultReps !== null) {
          const unit = timed ? "s" : "rep";
          const delta = timed ? 5 : 1;
          const fallback = timed ? defaultSeconds : defaultReps;
          const val =
            state.reps && state.reps[key] !== undefined
              ? state.reps[key]
              : (lastLoggedReps(day.id, exIdx) ?? fallback);
          repsHtml = `
          <div class="reps-stepper">
            <button class="stepper-btn minus" data-reps-key="${key}" data-delta="-${delta}" aria-label="Minska">−</button>
            <span class="reps-display" data-reps-display="${key}">${val}</span>
            <span class="reps-display-unit">${unit}</span>
            <button class="stepper-btn plus" data-reps-key="${key}" data-delta="${delta}" aria-label="Öka">+</button>
          </div>`;
        }

        return `<div class="set-row">
          <label class="set-check${state.sets[key] ? " is-checked" : ""}">
            <input type="checkbox" data-key="${key}" ${checked}/>
            <span>${setIdx + 1}</span>
          </label>
          ${weightHtml}
          ${repsHtml}
        </div>`;
      })
      .join("");

    const exId = ex.id || "";
    let allDone = true;
    for (let i = 0; i < ex.sets; i++) {
      if (!state.sets[setKey(day.id, exIdx, i)]) { allDone = false; break; }
    }
    const exAdjustDelta = timed ? 5 : 1;
    exEl.innerHTML = `
      <span class="exercise-name-btn" data-ex-id="${exId}" role="button" tabindex="0">${ex.name}</span>
      <div class="exercise-meta"><span class="exercise-time">≈ ${fmtMinutes(expectedExerciseSeconds(ex))}</span> · ${timed ? fmtSek(ex.reps) : `${fmtSek(ex.reps)} reps`} &middot; vila ${fmtSek(ex.rest)}</div>
      <div class="ex-controls">
        <button class="ex-done-btn${allDone ? " is-done" : ""}" data-ex-done="${day.id}:${exIdx}">${allDone ? "Klar ✓" : "Klar"}</button>
        ${timed ? "" : `
        <div class="weight-stepper ex-adjust-stepper">
          <button class="stepper-btn minus" data-weight-all="${day.id}:${exIdx}" data-delta="-${exStep}" aria-label="Minska vikt för alla set">−</button>
          <span class="weight-adjust-label">kg</span>
          <button class="stepper-btn plus" data-weight-all="${day.id}:${exIdx}" data-delta="${exStep}" aria-label="Öka vikt för alla set">+</button>
        </div>`}
        ${timed || defaultReps !== null ? `
        <div class="reps-stepper ex-adjust-stepper">
          <button class="stepper-btn minus" data-reps-all="${day.id}:${exIdx}" data-delta="-${exAdjustDelta}" aria-label="Minska för alla set">−</button>
          <span class="weight-adjust-label">${timed ? "s" : "rep"}</span>
          <button class="stepper-btn plus" data-reps-all="${day.id}:${exIdx}" data-delta="${exAdjustDelta}" aria-label="Öka för alla set">+</button>
        </div>` : ""}
        ${timed ? `<button class="ex-timer-btn" data-timer-ex="${day.id}:${exIdx}" aria-label="Starta tidtagning">▶</button>` : ""}
      </div>
      <div class="sets-rows">${setsHtml}</div>
    `;
    table.appendChild(exEl);
  });

  section.appendChild(table);

  const btnRow = document.createElement("div");
  btnRow.className = "btn-row";

  const finishBtn = document.createElement("button");
  finishBtn.className = "finish-btn";
  finishBtn.textContent = "Pass klart";
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
      // Start rest timer when a set is completed
      if (e.target.checked) {
        const [, exIdxStr] = key.split(":");
        const day = PROGRAM.find((d) => d.id === dayId);
        const ex = day ? day.exercises[Number(exIdxStr)] : null;
        const rest = ex ? parseRestSeconds(ex.rest) : 0;
        if (rest > 0) startTimer("Vila · " + ex.name, rest);
      }
    }
  });

  // +/- button handler
  root.addEventListener("click", (e) => {
    // Exercise-level: mark whole exercise done
    const doneBtn = e.target.closest(".ex-done-btn");
    if (doneBtn) {
      const [dayId, exIdxStr] = doneBtn.dataset.exDone.split(":");
      const day = PROGRAM.find((d) => d.id === dayId);
      const exIdx = Number(exIdxStr);
      const ex = day.exercises[exIdx];
      let allDone = true;
      for (let i = 0; i < ex.sets; i++) {
        if (!state.sets[setKey(dayId, exIdx, i)]) { allDone = false; break; }
      }
      for (let i = 0; i < ex.sets; i++) {
        const key = setKey(dayId, exIdx, i);
        state.sets[key] = !allDone;
        const input = root.querySelector(`input[type="checkbox"][data-key="${key}"]`);
        if (input) input.checked = !allDone;
        const label = input ? input.closest(".set-check") : null;
        if (label) label.classList.toggle("is-checked", !allDone);
      }
      saveState(state);
      doneBtn.classList.toggle("is-done", !allDone);
      doneBtn.textContent = !allDone ? "Klar ✓" : "Klar";
      if (navigator.vibrate && !allDone) navigator.vibrate(10);
      updateProgress(dayId);
      return;
    }
    // Exercise-level: adjust weight for all sets
    const wAll = e.target.closest("[data-weight-all]");
    if (wAll) {
      const [dayId, exIdxStr] = wAll.dataset.weightAll.split(":");
      const ex = PROGRAM.find((d) => d.id === dayId).exercises[Number(exIdxStr)];
      const delta = parseFloat(wAll.dataset.delta);
      for (let s = 0; s < ex.sets; s++) {
        const key = setKey(dayId, Number(exIdxStr), s);
        const disp = root.querySelector(`[data-weight-display="${key}"]`);
        const cur = disp ? (parseFloat(disp.textContent) || 0) : 0;
        const next = Math.max(0, Math.round((cur + delta) * 10) / 10);
        state.weights[key] = next;
        if (disp) disp.textContent = next % 1 === 0 ? next : next.toFixed(1);
      }
      saveState(state);
      return;
    }
    // Exercise-level: adjust reps/seconds for all sets
    const rAll = e.target.closest("[data-reps-all]");
    if (rAll) {
      const [dayId, exIdxStr] = rAll.dataset.repsAll.split(":");
      const day = PROGRAM.find((d) => d.id === dayId);
      const exIdx = Number(exIdxStr);
      const ex = day.exercises[exIdx];
      const delta = parseFloat(rAll.dataset.delta);
      const fallback = isTimedExercise(ex) ? parseDefaultSeconds(ex) : parseDefaultReps(ex.reps);
      for (let s = 0; s < ex.sets; s++) {
        adjustReps(setKey(dayId, exIdx, s), delta, fallback ?? 0);
      }
      return;
    }
    // Exercise-level: start countdown timer (timed exercises)
    const tBtn = e.target.closest("[data-timer-ex]");
    if (tBtn) {
      const [dayId, exIdxStr] = tBtn.dataset.timerEx.split(":");
      const ex = PROGRAM.find((d) => d.id === dayId).exercises[Number(exIdxStr)];
      const key = setKey(dayId, Number(exIdxStr), 0);
      const seconds = state.reps && state.reps[key] !== undefined
        ? state.reps[key]
        : parseDefaultSeconds(ex);
      if (seconds > 0) startTimer(ex.name, seconds, true);
      return;
    }
    const btn = e.target.closest(".stepper-btn");
    if (btn) {
      if (btn.dataset.repsKey !== undefined) {
        // Reps button — find this exercise's default as fallback
        const repKey = btn.dataset.repsKey;
        const [dayId, exIdxStr] = repKey.split(":");
        const day = PROGRAM.find((d) => d.id === dayId);
        const ex = day ? day.exercises[Number(exIdxStr)] : null;
        const fallback = ex
          ? (isTimedExercise(ex) ? parseDefaultSeconds(ex) : parseDefaultReps(ex.reps))
          : 0;
        adjustReps(repKey, parseFloat(btn.dataset.delta), fallback ?? 0);
      } else {
        adjustWeight(btn.dataset.key, parseFloat(btn.dataset.delta));
      }
      return;
    }
    // Exercise name click handler
    const nameBtn = e.target.closest(".exercise-name-btn");
    if (nameBtn && nameBtn.dataset.exId) {
      openExerciseModal(nameBtn.dataset.exId);
    }
  });

  // Keyboard handler for exercise name buttons
  root.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      const nameBtn = e.target.closest(".exercise-name-btn");
      if (nameBtn && nameBtn.dataset.exId) {
        e.preventDefault();
        openExerciseModal(nameBtn.dataset.exId);
      }
    }
  });

  renderLog();
}

// ── Timer overlay (vila / tidsövningar) ───────────────────────────────────────

let timerInterval = null;
let timerEndsAt = 0;
let timerTotal = 0;
let timerPausedLeft = 0;
let timerBeep = false;

function ensureTimerOverlay() {
  let el = document.getElementById("timer-overlay");
  if (el) return el;
  el = document.createElement("div");
  el.id = "timer-overlay";
  el.innerHTML = `
    <div class="timer-info">
      <span class="timer-label"></span>
      <span class="timer-time">0:00</span>
    </div>
    <div class="timer-bar"><div class="timer-bar-fill"></div></div>
    <div class="timer-btns">
      <button class="timer-pause" aria-label="Pausa">⏸</button>
      <button class="timer-stop" aria-label="Avbryt timer">✕</button>
    </div>
  `;
  document.body.appendChild(el);
  el.querySelector(".timer-stop").addEventListener("click", stopTimer);
  el.querySelector(".timer-pause").addEventListener("click", () => {
    if (timerInterval) {
      // pause
      timerPausedLeft = Math.max(0, Math.round((timerEndsAt - Date.now()) / 1000));
      clearInterval(timerInterval);
      timerInterval = null;
      el.querySelector(".timer-pause").textContent = "▶";
    } else if (timerPausedLeft) {
      // resume
      timerEndsAt = Date.now() + timerPausedLeft * 1000;
      timerPausedLeft = 0;
      el.querySelector(".timer-pause").textContent = "⏸";
      timerInterval = setInterval(tickTimer, 250);
    }
  });
  return el;
}

function startTimer(label, seconds, beep) {
  const el = ensureTimerOverlay();
  if (timerInterval) clearInterval(timerInterval);
  el.querySelector(".timer-label").textContent = label;
  el.querySelector(".timer-pause").textContent = "⏸";
  timerEndsAt = Date.now() + seconds * 1000;
  timerTotal = seconds;
  timerPausedLeft = 0;
  timerBeep = !!beep;
  timerInterval = setInterval(tickTimer, 250);
  el.classList.add("is-active");
  tickTimer();
}

function tickTimer() {
  const el = document.getElementById("timer-overlay");
  if (!el) return;
  const left = Math.max(0, Math.ceil((timerEndsAt - Date.now()) / 1000));
  const m = Math.floor(left / 60);
  const s = left % 60;
  el.querySelector(".timer-time").textContent = `${m}:${String(s).padStart(2, "0")}`;
  const fill = el.querySelector(".timer-bar-fill");
  if (fill) fill.style.width = timerTotal ? `${(left / timerTotal) * 100}%` : "0%";
  if (left <= 0) {
    clearInterval(timerInterval);
    timerInterval = null;
    timerFinished();
  }
}

function timerFinished() {
  const el = document.getElementById("timer-overlay");
  if (!el) return;
  el.querySelector(".timer-time").textContent = "Klar ✓";
  const fill = el.querySelector(".timer-bar-fill");
  if (fill) fill.style.width = "0%";
  if (timerBeep) playTimerBeep();
  if (navigator.vibrate) navigator.vibrate([120, 80, 120]);
  setTimeout(() => el.classList.remove("is-active"), 2500);
}

function stopTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = null;
  timerPausedLeft = 0;
  const el = document.getElementById("timer-overlay");
  if (el) el.classList.remove("is-active");
}

// Short double beep via WebAudio (no audio files needed)
function playTimerBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.25].forEach((offset) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = 880;
      osc.connect(gain);
      gain.connect(ctx.destination);
      const t = ctx.currentTime + offset;
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.exponentialRampToValueAtTime(0.2, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      osc.start(t);
      osc.stop(t + 0.2);
    });
    setTimeout(() => ctx.close(), 1000);
  } catch {
    // audio not available — vibration still fires
  }
}

// ── Exercise modal ────────────────────────────────────────────────────────────

function openExerciseModal(exId) {
  const lib = loadLibrary();
  const ex = lib.find(e => e.id === exId);
  if (!ex) return;

  closeExerciseModal();

  const backdrop = document.createElement("div");
  backdrop.id = "exercise-modal";
  backdrop.className = "modal-backdrop";

  const dayLabels = { push: "Push", pull: "Pull", legs: "Legs" };

  const stepOptions = [0, 1, 2.5, 5, 10];
  const stepsHtml = stepOptions.map(s =>
    `<button class="step-chip${ex.step === s ? " active" : ""}" data-step="${s}">${s === 0 ? "0" : s} kg</button>`
  ).join("");

  const dayChipsHtml = ["push", "pull", "legs"].map(d =>
    `<button class="day-chip${ex.days.includes(d) ? " active" : ""}" data-day="${d}">${dayLabels[d]}</button>`
  ).join("");

  const tipsHtml = ex.tips ? `<p class="modal-tips">${ex.tips}</p>` : "";
  const weightDisplay = ex.defaultWeight % 1 === 0 ? ex.defaultWeight : ex.defaultWeight.toFixed(1);
  const timed = isTimedExercise(ex);
  const weightSectionHtml = timed ? "" : `
      <p class="modal-section-label">Defaultvikt</p>
      <div class="weight-stepper" style="display:inline-flex;margin-bottom:0.5rem;">
        <button class="stepper-btn minus" id="modal-weight-minus" aria-label="Minska vikt">−</button>
        <span class="weight-display" id="modal-weight-display">${weightDisplay}</span>
        <span class="weight-display-unit">kg</span>
        <button class="stepper-btn plus" id="modal-weight-plus" aria-label="Öka vikt">+</button>
      </div>
      <p class="modal-section-label">Stegstorlek</p>
      <div class="step-chips" id="step-chips-container">
        ${stepsHtml}
      </div>`;

  backdrop.innerHTML = `
    <div class="modal-sheet" role="dialog" aria-modal="true" aria-label="${ex.name}">
      <div class="modal-header">
        <h3 style="margin:0;font-size:1rem;">${ex.name}</h3>
        <button class="modal-close" id="modal-close-btn" aria-label="Stäng">×</button>
      </div>
      <span class="muscle-badge">${ex.muscle}</span>
      <p class="modal-description">${ex.description}</p>
      ${tipsHtml}
      ${weightSectionHtml}
      <p class="modal-section-label">Pass</p>
      <div class="day-chips" id="day-chips-container">
        ${dayChipsHtml}
      </div>
    </div>
  `;

  document.body.appendChild(backdrop);

  // Current editing state
  let currentWeight = ex.defaultWeight;
  let currentStep = ex.step;
  let currentDays = [...ex.days];

  function updateWeightDisplay() {
    const d = document.getElementById("modal-weight-display");
    if (d) d.textContent = currentWeight % 1 === 0 ? currentWeight : currentWeight.toFixed(1);
  }

  function saveChanges() {
    const lib2 = loadLibrary();
    const idx = lib2.findIndex(e => e.id === exId);
    if (idx === -1) return;
    lib2[idx].defaultWeight = currentWeight;
    lib2[idx].step = currentStep;
    lib2[idx].days = currentDays;
    saveLibrary(lib2);
    // Rebuild program and re-render
    PROGRAM = buildProgramFromLibrary();
    renderTabs();
    renderProgram(activeDay);
  }

  // Weight stepper (only for weight-based exercises)
  if (document.getElementById("modal-weight-minus")) {
  document.getElementById("modal-weight-minus").addEventListener("click", () => {
    currentWeight = Math.max(0, Math.round((currentWeight - (currentStep || 2.5)) * 10) / 10);
    updateWeightDisplay();
    saveChanges();
  });
  document.getElementById("modal-weight-plus").addEventListener("click", () => {
    currentWeight = Math.max(0, Math.round((currentWeight + (currentStep || 2.5)) * 10) / 10);
    updateWeightDisplay();
    saveChanges();
  });

  // Step chips
  document.getElementById("step-chips-container").addEventListener("click", (e) => {
    const chip = e.target.closest(".step-chip");
    if (!chip) return;
    currentStep = parseFloat(chip.dataset.step);
    document.querySelectorAll("#step-chips-container .step-chip").forEach(c => c.classList.remove("active"));
    chip.classList.add("active");
    saveChanges();
  });
  }

  // Day chips
  document.getElementById("day-chips-container").addEventListener("click", (e) => {
    const chip = e.target.closest(".day-chip");
    if (!chip) return;
    const d = chip.dataset.day;
    const idx = currentDays.indexOf(d);
    if (idx === -1) {
      currentDays.push(d);
      chip.classList.add("active");
    } else {
      currentDays.splice(idx, 1);
      chip.classList.remove("active");
    }
    saveChanges();
  });

  // Close handlers
  document.getElementById("modal-close-btn").addEventListener("click", closeExerciseModal);
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) closeExerciseModal();
  });
}

function closeExerciseModal() {
  const m = document.getElementById("exercise-modal");
  if (m) m.remove();
}

// ── Library overlay ───────────────────────────────────────────────────────────

function openLibrary() {
  closeLibrary();

  const lib = loadLibrary();

  // Group by muscle, sorted alphabetically
  const groups = {};
  lib.forEach(ex => {
    if (!groups[ex.muscle]) groups[ex.muscle] = [];
    groups[ex.muscle].push(ex);
  });
  const sortedMuscles = Object.keys(groups).sort((a, b) => a.localeCompare(b, "sv"));

  const dayLabels = { push: "Push", pull: "Pull", legs: "Legs" };

  const groupsHtml = sortedMuscles.map(muscle => {
    const exRows = groups[muscle].map(ex => {
      const dayPillsHtml = ex.days.map(d =>
        `<span class="library-day-pill library-day-pill--${d}">${dayLabels[d] || d}</span>`
      ).join("");
      return `
        <div class="library-exercise-row" data-ex-id="${ex.id}" role="button" tabindex="0">
          <div class="library-ex-name">${ex.name}</div>
          <div class="library-ex-days">${dayPillsHtml}</div>
        </div>
      `;
    }).join("");
    return `
      <div class="library-group-label">${muscle}</div>
      ${exRows}
    `;
  }).join("");

  const overlay = document.createElement("div");
  overlay.id = "library-overlay";
  overlay.className = "library-overlay";
  overlay.innerHTML = `
    <div class="library-header">
      <h2>Övningsbibliotek</h2>
      <button class="modal-close" id="library-close-btn" aria-label="Stäng">×</button>
    </div>
    <div class="library-body">
      ${groupsHtml}
    </div>
  `;

  document.body.appendChild(overlay);

  document.getElementById("library-close-btn").addEventListener("click", closeLibrary);

  overlay.querySelector(".library-body").addEventListener("click", (e) => {
    const row = e.target.closest(".library-exercise-row");
    if (row && row.dataset.exId) {
      closeLibrary();
      openExerciseModal(row.dataset.exId);
    }
  });

  overlay.querySelector(".library-body").addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      const row = e.target.closest(".library-exercise-row");
      if (row && row.dataset.exId) {
        e.preventDefault();
        closeLibrary();
        openExerciseModal(row.dataset.exId);
      }
    }
  });
}

function closeLibrary() {
  const l = document.getElementById("library-overlay");
  if (l) l.remove();
}

// ── Reset / log ───────────────────────────────────────────────────────────────

function resetSession(dayId) {
  if (!confirm("Rensa alla bockar för detta pass?")) return;
  // Clear only checkboxes for this day, keep weights and log intact
  const day = PROGRAM.find((d) => d.id === dayId);
  if (!day) return;
  day.exercises.forEach((ex, exIdx) => {
    for (let s = 0; s < ex.sets; s++) {
      const k = setKey(dayId, exIdx, s);
      delete state.sets[k];
      if (state.reps) delete state.reps[k];
    }
  });
  saveState(state);
  renderProgram(dayId);
}

function logSession(dayId, dayName) {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const clock = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  // Snapshot current weights and reps for this day
  const day = PROGRAM.find((d) => d.id === dayId);
  const sessionWeights = {};
  const sessionReps = {};
  if (day) {
    day.exercises.forEach((ex, exIdx) => {
      for (let s = 0; s < ex.sets; s++) {
        const k = setKey(dayId, exIdx, s);
        const w = state.weights[k];
        if (w !== undefined && w !== "" && w !== 0) {
          sessionWeights[k] = w;
        }
        const r = state.reps ? state.reps[k] : undefined;
        if (r !== undefined && r !== "" && r !== 0) {
          sessionReps[k] = r;
        }
      }
    });
  }

  state.log.unshift({
    dayId,
    dayName,
    date: today,
    time: clock,
    expectedSeconds: day
      ? day.exercises.reduce((s, ex) => s + expectedExerciseSeconds(ex), 0)
      : undefined,
    weights: sessionWeights,
    reps: sessionReps
  });
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

      const expSec = entry.expectedSeconds ?? (day
        ? day.exercises.reduce((s, ex) => s + expectedExerciseSeconds(ex), 0)
        : undefined);
      const expectedStr = expSec ? ` · ≈${fmtMinutes(expSec)}` : "";
      const timeStr = entry.time ? `, kl ${entry.time}` : "";

      if ((entry.weights || entry.reps) && day) {
        const lines = day.exercises
          .map((ex, exIdx) => {
            const ws = [];
            const rs = [];
            for (let s = 0; s < ex.sets; s++) {
              const k = setKey(entry.dayId, exIdx, s);
              const w = entry.weights ? entry.weights[k] : undefined;
              if (w !== undefined && w !== null && w !== "" && w !== 0) ws.push(w);
              const r = entry.reps ? entry.reps[k] : undefined;
              if (r !== undefined && r !== null && r !== "" && r !== 0) rs.push(r);
            }
            if (!ws.length && !rs.length) return null;
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
            const repsStr = rs.length ? ` &middot; ${rs.join("/")}${isTimedExercise(ex) ? " s" : " rep"}` : "";
            return `<span class="log-ex"><em>${ex.name}:</em> ${collapsed}${repsStr}</span>`;
          })
          .filter(Boolean);

        if (lines.length) {
          weightSummary = `<div class="log-weights">${lines.join("")}</div>`;
        }
      }

      return `<li>
        <div class="log-entry-header">${entry.date}${timeStr} – ${entry.dayName}${expectedStr}</div>
        ${weightSummary}
      </li>`;
    })
    .join("");

  logEl.innerHTML = "<h2>Träningslogg</h2><ul>" + rows + "</ul>";
}

// ── Update banner ─────────────────────────────────────────────────────────────
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
    <span>Ny version tillgänglig</span>
    <button id="update-btn">Uppdatera nu</button>
  `;
  document.body.prepend(banner);

  document.getElementById("update-btn").addEventListener("click", () => {
    worker.postMessage({ type: "SKIP_WAITING" });
  });
}

// ── DOMContentLoaded ──────────────────────────────────────────────────────────

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

  // Library button
  const libraryBtn = document.getElementById("library-btn");
  if (libraryBtn) {
    libraryBtn.addEventListener("click", openLibrary);
  }

  // Force update: unregister SW, clear all caches, hard reload from network
  const forceUpdateBtn = document.getElementById("force-update-btn");
  if (forceUpdateBtn) {
    forceUpdateBtn.addEventListener("click", async () => {
      forceUpdateBtn.disabled = true;
      forceUpdateBtn.textContent = "Uppdaterar…";
      try {
        if ("serviceWorker" in navigator) {
          const regs = await navigator.serviceWorker.getRegistrations();
          for (const reg of regs) await reg.unregister();
        }
        if (window.caches) {
          const keys = await caches.keys();
          for (const key of keys) await caches.delete(key);
        }
      } catch {
        // fortsätt med reload även om rensningen misslyckas
      }
      // Ladda om och kringgå HTTP-cache
      location.reload(true);
    });
  }
});
