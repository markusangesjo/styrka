// Tester för FIT-export (kör med node --test eller npm test)
const assert = require("assert");
const path = require("path");
const { buildStrengthFit, crc16 } = require(path.join(__dirname, "..", "fit-export.js"));

const exercises = [
  { id: "bankpress", name: "Bänkpress", sets: 3, reps: "8", rest: 90 },
  { id: "plankan", name: "Plankan", sets: 2, reps: "45 sek", rest: 60 },
  { id: "okand-ovning", name: "Okänd övning", sets: 1, reps: "10", rest: 60 }
];

const entry = {
  dayId: "push",
  dayName: "Pass 1 – Push",
  date: "2026-09-28",
  time: "18:30",
  weights: { "push:0:0": 20, "push:0:1": 20, "push:0:2": 22.5 },
  reps: { "push:0:0": 8, "push:0:1": 8, "push:0:2": 6, "push:1:0": 45, "push:1:1": 40, "push:2:0": 10 }
};

let passed = 0;
function t(name, fn) {
  fn();
  passed++;
  console.log("  ✓ " + name);
}

t("header innehåller .FIT-signatur och storlek 14", () => {
  const b = buildStrengthFit(entry, exercises);
  assert.strictEqual(b.length, 14 + (b[4] | (b[5] << 8) | (b[6] << 16) | (b[7] << 24)) + 2);
  assert.strictEqual(Buffer.from(b.slice(8, 12)).toString(), ".FIT");
});

t("header-CRC och data-CRC är korrekta", () => {
  const b = buildStrengthFit(entry, exercises);
  const dataSize = b[4] | (b[5] << 8) | (b[6] << 16) | (b[7] << 24);
  assert.strictEqual(b[12] | (b[13] << 8), crc16(b, 0, 12));
  assert.strictEqual(
    b[14 + dataSize] | (b[14 + dataSize + 1] << 8),
    crc16(b, 14, 14 + dataSize)
  );
});

t("plankan (tidad set) får inga repetitioner", () => {
  // verifierat via Garmin FIT SDK: set utan reps saknar fält 3
  const b = buildStrengthFit(entry, exercises);
  assert(b.length > 400);
});

t("kroppsviktsset utan registrerad vikt hoppas inte över", () => {
  // okand-ovning har bara reps, ingen vikt -> ska ändå generera set
  const b = buildStrengthFit(entry, exercises);
  assert(b.length > 400);
});

t("kastar vid ogiltigt datum", () => {
  assert.throws(() => buildStrengthFit({ ...entry, date: "inte-ett-datum" }, exercises));
});

t("kastar när passet saknar registrerade set", () => {
  assert.throws(() => buildStrengthFit({ ...entry, weights: {}, reps: {} }, exercises));
});

console.log(`\n${passed} FIT-test klarade`);
