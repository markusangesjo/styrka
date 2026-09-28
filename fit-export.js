// fit-export.js — genererar Garmin FIT-filer av avslutade Styrka-pass.
// Minimal FIT-encoder (protocol 1.x) + styrketränings-meddelanden (Set, ExerciseTitle-löses
// via Garmins inbyggda kategorier). Fungerar både i webbläsaren och i Node (tester).

(function (root) {
  "use strict";

  // ── binära hjälpare ─────────────────────────────────────────────────────────

  // CRC16 enligt Garmins FIT-SDK (nibbel-varianter, init 0)
  const CRC_TABLE = [
    0x0000, 0xcc01, 0xd801, 0x1400, 0xf001, 0x3c00, 0x2800, 0xe401,
    0xa001, 0x6c00, 0x7800, 0xb401, 0x5000, 0x9c01, 0x8801, 0x4400
  ];

  function crcUpdate(value, crc) {
    let temp = CRC_TABLE[crc & 0xf];
    crc = (crc >> 4) & 0x0fff;
    crc ^= temp ^ CRC_TABLE[value & 0xf];
    temp = CRC_TABLE[crc & 0xf];
    crc = (crc >> 4) & 0x0fff;
    crc ^= temp ^ CRC_TABLE[(value >> 4) & 0xf];
    return crc;
  }

  function crc16(bytes, start, end) {
    let crc = 0;
    for (let i = start; i < end; i++) crc = crcUpdate(bytes[i], crc);
    return crc & 0xffff;
  }

  const U8 = { id: 0x02, size: 1 };
  const U16 = { id: 0x84, size: 2 };
  const U32 = { id: 0x86, size: 4 };
  const U32Z = { id: 0x8c, size: 4 };
  const ENUM = { id: 0x00, size: 1 };
  const STR = { id: 0x07, size: 1 };

  class ByteBuf {
    constructor() { this.bytes = []; }
    u8(v) { this.bytes.push(v & 0xff); }
    u16(v) { this.bytes.push(v & 0xff, (v >> 8) & 0xff); }
    u32(v) { this.bytes.push(v & 0xff, (v >> 8) & 0xff, (v >> 16) & 0xff, (v >> 24) & 0xff); }
    str(s, maxLen) {
      const enc = unescape(encodeURIComponent(s || ""));
      for (let i = 0; i < maxLen; i++) this.bytes.push(i < enc.length ? enc.charCodeAt(i) : 0);
    }
  }

  // ── meddelanden ─────────────────────────────────────────────────────────────

  const MESG = { fileId: 0, session: 18, lap: 19, event: 21, activity: 34, set: 225 };

  class FitWriter {
    constructor() {
      this.out = new ByteBuf();
      this.msgIdx = new Map(); // lokal meddelandetyp -> definitionssignatur
      this.localType = 0;
      this.dataSize = 0;
    }

    // fields: [{ num, type, size? }]
    define(localType, mesgNum, fields) {
      const body = new ByteBuf();
      body.u8(0); // reserved
      body.u8(0); // architecture: little-endian
      body.u16(mesgNum);
      body.u8(fields.length);
      fields.forEach((f) => {
        body.u8(f.num);
        body.u8(f.size != null ? f.size : f.type.size);
        body.u8(f.type.id);
      });
      const header = 0x40 | localType;
      this._emit(header, body);
      this.msgIdx.set(localType, { mesgNum, fields });
      return localType;
    }

    // values: redan skalade heltal (eller string). Fält saknas -> skicka null och hoppa
    // över hela datameddelandet om inget värde finns.
    data(localType, values) {
      const def = this.msgIdx.get(localType);
      if (!def) throw new Error("definition saknas för lokal typ " + localType);
      const body = new ByteBuf();
      def.fields.forEach((f, i) => {
        const v = values[i];
        if (f.type === STR) body.str(v, f.size != null ? f.size : 8);
        else if (f.type.size === 1) body.u8(v == null ? 0 : v);
        else if (f.type.size === 2) body.u16(v == null ? 0 : v);
        else body.u32(v == null ? 0 : v);
      });
      this._emit(localType, body);
    }

    auto(spec, values) {
      const fields = spec.fields;
      // Leta upp (eller skapa) definition med samma fältlista och skriv datameddelande.
      for (let t = 0; t < 16; t++) {
        const def = this.msgIdx.get(t);
        if (def && sig(def.fields) === sig(fields)) {
          this.data(t, values);
          return t;
        }
      }
      if (this.localType > 15) throw new Error("slut på lokala meddelandetyper");
      const t = this.localType++;
      this.define(t, MESG[spec.__mesg], fields);
      this.data(t, values);
      return t;
    }

    _emit(header, body) {
      this.out.u8(header);
      const arr = body.bytes;
      for (let i = 0; i < arr.length; i++) this.out.bytes.push(arr[i]);
      this.dataSize += 1 + arr.length;
    }

    finish() {
      const header = new ByteBuf();
      header.u8(14);            // header-storlek
      header.u8(0x10);          // protocol version 1.0
      header.u16(116);          // profile version 1.16
      header.u32(this.dataSize);
      header.str(".FIT", 4);
      const raw = header.bytes;
      const crc = crc16(raw, 0, 12);
      raw.push(crc & 0xff, (crc >> 8) & 0xff);
      const all = raw.concat(this.out.bytes);
      const dataCrc = crc16(all, 14, all.length);
      all.push(dataCrc & 0xff, (dataCrc >> 8) & 0xff);
      return new Uint8Array(all);
    }
  }

  function sig(fields) {
    return fields.map((f) => f.num + ":" + (f.size != null ? f.size : f.type.size) + ":" + f.type.id).join(",");
  }

  // ── enum-värden (Garmin FIT-profil) ─────────────────────────────────────────

  const FIT_EPOCH_OFFSET = 631065600; // sekunder mellan 1970-01-01 och 1989-12-31

  const SPORT = { training: 10 };
  const SUB_SPORT = { strength_training: 20 };
  const EVENT = { timer: 0, lap: 9, session: 8, activity: 26 };
  const EVENT_TYPE = { start: 0, stop: 1, stopAll: 4 };
  const ACTIVITY_TYPE = { manual: 0 };
  const SET_TYPE = { rest: 0, active: 1 };
  const WEIGHT_UNIT = { kilogram: 1 };

  // Garmin exercise_category + subtype för Styrkas bibliotek (id -> [kategori, subtype])
  const GARMIN_EXERCISES = {
    "bankpress": [0, 1],            // bench_press / barbell_bench_press
    "axelpress-sittande": [24, 17], // shoulder_press / seated_dumbbell_shoulder_press
    "lutande-hantelpress": [0, 9],  // bench_press / incline_dumbbell_bench_press
    "sidolyft-axlar": [14, 34],     // lateral_raise / dumbbell_lateral_raise
    "triceps-pushdown": [30, 39],   // triceps_extension / triceps_pressdown
    "plankan": [19, 43],            // plank / plank
    "latsdrag": [21, 13],           // pull_up / lat_pulldown
    "sittande-rodd": [23, 18],      // row / seated_cable_row
    "rumansk-marklyft": [8, 23],    // deadlift / romanian_deadlift
    "face-pull": [23, 5],           // row / face_pull
    "bicepscurl": [7, 46],          // curl / dumbbell_biceps_curl
    "sidoplanka": [19, 66],         // plank / side_plank
    "knaboj-eller-benpress": [28, 0], // squat / leg_press
    "utfallssteg": [17, 32],        // lunge / lunge
    "marklyft-teknik": [8, 0],      // deadlift / barbell_deadlift
    "bencurl": [15, 0],             // leg_curl / leg_curl
    "tahavningar": [1, 18],         // calf_raise / standing_calf_raise
    "situps-crunches": [6, 83]      // crunch / crunch
  };

  // ── pass -> FIT ─────────────────────────────────────────────────────────────

  function toFitTime(ms) {
    return Math.round(ms / 1000) - FIT_EPOCH_OFFSET;
  }

  // entry: { dayId, dayName, date, time, weights: {key:v}, reps: {key:v} }
  // dayExercises: biblioteksobjekt för passet ([{ id, name, sets, reps, rest, muscle }])
  function buildStrengthFit(entry, dayExercises) {
    if (!entry || !entry.date) throw new Error("log-post saknar datum");

    // lokalt datum+klockslag på användarens enhet -> UTC-tid
    const startTime = new Date(entry.date + "T" + (entry.time || "12:00"));
    if (isNaN(startTime.getTime())) throw new Error("ogiltigt datum i loggpost: " + entry.date + " " + entry.time);

    // Plocka ut avklarade set: nycklar med vikt eller reps
    const exercises = [];
    let totalReps = 0;
    (dayExercises || []).forEach((ex, exIdx) => {
      const cat = GARMIN_EXERCISES[ex.id] || [65534, 0]; // 65534 = unknown
      const sets = [];
      for (let s = 0; s < ex.sets; s++) {
        const key = entry.dayId + ":" + exIdx + ":" + s;
        const w = entry.weights ? entry.weights[key] : undefined;
        const r = entry.reps ? entry.reps[key] : undefined;
        const hasW = w !== undefined && w !== "" && Number(w) > 0;
        const hasR = r !== undefined && r !== "" && Number(r) > 0;
        if (!hasW && !hasR) continue;
        const repsNum = Number(r) || 0;
        const isTimed = /sek|sida|\bs\b|min/i.test(String(ex.reps || ""));
        sets.push({
          weight: hasW ? Number(w) : null,
          reps: !isTimed && repsNum > 0 ? repsNum : null,
          seconds: isTimed && repsNum > 0 ? repsNum : null,
          category: cat[0],
          subtype: cat[1],
          exerciseName: ex.name
        });
        totalReps += repsNum;
      }
      if (sets.length) exercises.push({ name: ex.name, rest: Number(ex.rest) || 60, sets });
    });

    if (!exercises.length) throw new Error("passet saknar registrerade set");

    // Uppskattad tidslinje: aktivt set 45 s (eller reps för tidade), vila = ex.rest
    const SET_SECONDS = 45;
    let cursor = startTime.getTime();
    const lapSpans = []; // { start, end, exIndex }
    const timeline = []; // { kind:'set'|'rest', ... }
    exercises.forEach((ex, ei) => {
      const lapStart = cursor;
      ex.sets.forEach((s, si) => {
        const dur = (s.seconds ? s.seconds : SET_SECONDS) * 1000;
        timeline.push({ kind: "set", start: cursor, dur, set: s });
        cursor += dur;
        if (si < ex.sets.length - 1) {
          const restDur = ex.rest * 1000;
          timeline.push({ kind: "rest", start: cursor, dur: restDur });
          cursor += restDur;
        }
      });
      lapSpans.push({ start: lapStart, end: cursor });
    });
    const endTime = cursor;
    const elapsedMs = endTime - startTime.getTime();

    const w = new FitWriter();

    // FileId
    w.auto(
      { __mesg: "fileId", fields: [
        { num: 0, type: ENUM },   // type = activity
        { num: 1, type: U16 },    // manufacturer = 255 (development)
        { num: 2, type: U16 },    // product
        { num: 3, type: U32Z },   // serial_number
        { num: 4, type: U32 }     // time_created
      ] },
      [4, 255, 0, 1, toFitTime(endTime)]
    );

    // Event: start
    w.auto(
      { __mesg: "event", fields: [
        { num: 253, type: U32 },
        { num: 0, type: ENUM },
        { num: 1, type: ENUM }
      ] },
      [toFitTime(startTime.getTime()), EVENT.timer, EVENT_TYPE.start]
    );

    // Lap per övning
    lapSpans.forEach((span) => {
      w.auto(
        { __mesg: "lap", fields: [
          { num: 253, type: U32 },        // timestamp
          { num: 0, type: ENUM },         // event = lap
          { num: 1, type: ENUM },         // event_type = stop
          { num: 2, type: U32 },          // start_time
          { num: 7, type: U32 },          // total_elapsed_time (ms)
          { num: 8, type: U32 },          // total_timer_time (ms)
          { num: 11, type: U16 },         // total_calories (uppskattning)
          { num: 24, type: ENUM },        // lap_trigger = manual
          { num: 25, type: ENUM },        // sport
          { num: 39, type: ENUM }         // sub_sport
        ] },
        [
          toFitTime(span.end), EVENT.lap, EVENT_TYPE.stop,
          toFitTime(span.start),
          span.end - span.start,
          span.end - span.start,
          Math.max(1, Math.round(((span.end - span.start) / 60000) * 6)),
          0, SPORT.training, SUB_SPORT.strength_training
        ]
      );
    });

    // Set (+ vilopauser)
    let setIdx = 0;
    timeline.forEach((t) => {
      if (t.kind === "rest") {
        w.auto(
          { __mesg: "set", fields: [
            { num: 254, type: U32 },  // timestamp
            { num: 0, type: U32 },    // duration (ms)
            { num: 5, type: ENUM },   // set_type = rest
            { num: 6, type: U32 }     // start_time
          ] },
          [toFitTime(t.start + t.dur), t.dur, SET_TYPE.rest, toFitTime(t.start)]
        );
        return;
      }
      const s = t.set;
      const fields = [
        { num: 254, type: U32 },  // timestamp
        { num: 0, type: U32 },    // duration (ms)
        { num: 3, type: U16 },    // repetitions
        { num: 4, type: U16 },    // weight (kg * 16)
        { num: 5, type: ENUM },   // set_type = active
        { num: 6, type: U32 },    // start_time
        { num: 7, type: U16 },    // exercise_category
        { num: 8, type: U16 },    // category_subtype
        { num: 9, type: U16 },    // weight_display_unit = kg
        { num: 10, type: U16 }    // message_index
      ];
      const values = [
        toFitTime(t.start + t.dur),
        t.dur,
        s.reps,
        s.weight != null ? Math.round(s.weight * 16) : null,
        SET_TYPE.active,
        toFitTime(t.start),
        s.category,
        s.subtype,
        WEIGHT_UNIT.kilogram,
        setIdx++
      ];
      // Hoppa över repetitions-fältet helt för tidade set (plankan m.fl.)
      if (s.seconds != null) {
        const idx = fields.findIndex((f) => f.num === 3);
        fields.splice(idx, 1);
        values.splice(idx, 1);
      }
      // Hoppa över viktfältet för kroppsviktsövningar
      if (s.weight == null) {
        const idx = fields.findIndex((f) => f.num === 4);
        fields.splice(idx, 1);
        values.splice(idx, 1);
      }
      w.auto({ __mesg: "set", fields }, values);
    });

    // Event: stop_all
    w.auto(
      { __mesg: "event", fields: [
        { num: 253, type: U32 },
        { num: 0, type: ENUM },
        { num: 1, type: ENUM }
      ] },
      [toFitTime(endTime), EVENT.timer, EVENT_TYPE.stopAll]
    );

    // Session
    w.auto(
      { __mesg: "session", fields: [
        { num: 254, type: U16 },   // message_index (uint16, index 0)
        { num: 253, type: U32 },   // timestamp
        { num: 0, type: ENUM },    // event = session
        { num: 1, type: ENUM },    // event_type = stop
        { num: 2, type: U32 },     // start_time
        { num: 7, type: U32 },     // total_elapsed_time (ms)
        { num: 8, type: U32 },     // total_timer_time (ms)
        { num: 5, type: ENUM },    // sport = training
        { num: 6, type: ENUM },    // sub_sport = strength_training
        { num: 11, type: U16 },    // total_calories
        { num: 25, type: U16 },    // first_lap_index
        { num: 26, type: U16 }     // num_laps
      ] },
      [
        0, toFitTime(endTime), EVENT.session, EVENT_TYPE.stop,
        toFitTime(startTime.getTime()), elapsedMs, elapsedMs,
        SPORT.training, SUB_SPORT.strength_training,
        Math.max(1, Math.round((elapsedMs / 60000) * 6)), 0, lapSpans.length
      ]
    );

    // Activity
    w.auto(
      { __mesg: "activity", fields: [
        { num: 253, type: U32 },   // timestamp
        { num: 0, type: U32 },     // total_timer_time (ms)
        { num: 1, type: U16 },     // num_sessions
        { num: 2, type: ENUM },    // type = manual
        { num: 3, type: ENUM },    // event = activity
        { num: 4, type: ENUM }     // event_type = stop
      ] },
      [toFitTime(endTime), elapsedMs, 1, ACTIVITY_TYPE.manual, EVENT.activity, EVENT_TYPE.stop]
    );

    return w.finish();
  }

  const api = { buildStrengthFit, toFitTime, crc16, GARMIN_EXERCISES };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.StyrkaFit = api;
})(typeof self !== "undefined" ? self : this);
