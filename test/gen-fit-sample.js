// Genererar en FIT-fil från en exempelpost för validering med Garmins SDK.
const path = require("path");
const { buildStrengthFit } = require(path.join(__dirname, "..", "fit-export.js"));

// Mini-version av biblioteket (samma fält som Styrkas library-objekt)
const exercises = [
  { id: "bankpress", name: "Bänkpress", sets: 3, reps: "8", rest: 90, muscle: "Bröst" },
  { id: "plankan", name: "Plankan", sets: 3, reps: "45 sek", rest: 60, muscle: "Core" },
  { id: "triceps-pushdown", name: "Triceps pushdown", sets: 3, reps: "12", rest: 60, muscle: "Triceps" }
];

const entry = {
  dayId: "push",
  dayName: "Pass 1 – Push",
  date: "2026-09-28",
  time: "18:30",
  expectedSeconds: 2400,
  weights: { "push:0:0": 20, "push:0:1": 20, "push:0:2": 22.5 },
  reps: { "push:0:0": 8, "push:0:1": 8, "push:0:2": 6, "push:1:0": 45, "push:1:1": 45, "push:2:0": 12, "push:2:1": 12, "push:2:2": 10 }
};

const bytes = buildStrengthFit(entry, exercises);
require("fs").writeFileSync(path.join(__dirname, "..", "test-output.fit"), Buffer.from(bytes));
console.log("wrote test-output.fit,", bytes.length, "bytes");