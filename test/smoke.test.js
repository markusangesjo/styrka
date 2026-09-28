// Smoke test: render the app in jsdom, catch runtime errors, verify
// single-fire handlers (regression: stacked listeners made ± fire N times).
const { JSDOM } = require("jsdom");
const fs = require("fs");

const dom = new JSDOM(`<!doctype html><html><body>
<div id="app"></div><header></header><main></main>
<div id="program"></div><div id="log"></div>
<button id="library-btn"></button><button id="info-toggle"></button>
<div id="info-panel" hidden></div>
</body></html>`, {
  url: "https://markusangesjo.github.io/styrka/",
  runScripts: "outside-only",
  pretendToBeVisual: true,
});

const w = dom.window;
w.navigator.vibrate = () => {};
w.matchMedia = () => ({ matches: false, addEventListener() {}, addListener() {} });
w.localStorage.setItem("styrka-state-v2", JSON.stringify({
  sets: {}, weights: {}, reps: {}, log: []
}));

const errs = [];
w.addEventListener("error", (e) => errs.push(e.message));

let failed = false;
function check(name, cond) {
  if (cond) console.log("PASS:", name);
  else { failed = true; console.log("FAIL:", name); }
}

try {
  w.eval(fs.readFileSync("app.js", "utf8"));
  w.document.dispatchEvent(new w.Event("DOMContentLoaded", { bubbles: true }));
} catch (e) {
  console.log("THROWN:", e.message);
  process.exit(1);
}
check("no runtime errors on render", errs.length === 0);
check("program rendered", w.document.getElementById("program").innerHTML.length > 1000);

// Regression: +/- on weight must fire exactly once per tap
const firstPlus = w.document.querySelector('[data-key$=":0"] + .weight-display-unit ~ .stepper-btn.plus')
  || w.document.querySelectorAll(".stepper-btn.plus").find?.((b) => b.dataset.key);
const plusBtn = [...w.document.querySelectorAll(".stepper-btn.plus")].find((b) => b.dataset.key);
check("weight stepper exists", !!plusBtn);
const disp = w.document.querySelector(`[data-weight-display="${plusBtn.dataset.key}"]`);
const before = parseFloat(disp.textContent);
plusBtn.dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
const after = parseFloat(disp.textContent);
check(`weight + fires exactly once (${before} → ${after})`, after === before + 5);
plusBtn.dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
check("second tap also +5", parseFloat(disp.textContent) === before + 10);

// Exercise-level "Klar" checks all sets (skip warmup card, it has its own)
const doneBtn = [...w.document.querySelectorAll(".ex-done-btn")]
  .find((b) => !b.closest(".warmup-exercise"));
doneBtn.dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
const checked = w.document.querySelectorAll('input[type="checkbox"]:checked').length;
check("exercise-level Klar checks sets", checked > 0);

// Warmup card exists with its own Klar + timer
const warmDone = w.document.querySelector(".warmup-exercise .ex-done-btn");
check("warmup card with Klar button", !!warmDone);
check("warmup timer button", !!w.document.querySelector(".warmup-exercise .ex-timer-btn"));

// Sets stepper re-renders without errors
const setPlus = w.document.querySelector("[data-sets-ex].plus");
setPlus.dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
check("no errors after sets change", errs.length === 0);
check("program re-rendered after sets change", w.document.getElementById("program").innerHTML.length > 1000);

process.exit(failed ? 1 : 0);