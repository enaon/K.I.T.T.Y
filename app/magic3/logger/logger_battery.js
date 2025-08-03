// === Αρχικοποίηση Δεδομένων ===
var dbg = 0;
var stats = {
  battery: {
    dailyLevels: [], // Καταγραφή ημερήσιων επιπέδων (μόνο κατά την εκφόρτιση) - πίνακας τιμών
    currentSession: { // Στατιστικά τρέχουσας εκφόρτισης
      startDate: null, // Ημερομηνία έναρξης (ISO format)
      startLevel: null, // Επίπεδο έναρξης (%)
      lastLevel: null, // Τελευταία μέτρηση (%)
      lastUpdate: null, // Timestamp τελευταίας ενημέρωσης (ISO)
      dischargeRate: null, // Μέση ημερήσια μείωση (%/ημέρα)
      cleanCycles: 0 // Αριθμός κύκλων εκφόρτισης (από ew.apps.kitty.state.def.is.total)
    },
    history: [] // Ιστορικό κύκλων (max 5 entries)
  }
};

// === Βοηθητικές Συναρτήσεις ===
function loadStats() {
  try {
    var saved = require("Storage").readJSON("ew_logger_battery.json");
    if (saved) stats = saved;
  }
  catch (e) {
    if (dbg || ew.dbg) if (dbg || ew.dbg) console.log("battery logger dbg: No saved stats, starting fresh");
  }
}

function saveStats() {
  var year = Date().getFullYear().toString();
  if (year === "1970") {
      ew.notify.alert("error", { body: "DATE IS 1970", title: "LOGGER ERROR" }, 1, 1);
      return;
  }
  require("Storage").write("ew_logger_battery.json", stats);
}

// === Βασικές Συναρτήσεις ===
function logBatteryLevel() {
  var now = new Date();
  var today = now.toLocalISOString().split('T')[0]; // "YYYY-MM-DD"
  var level = ew.is.batS;
  var year = now.getFullYear().toString();

  if (year === "1970") {
      ew.notify.alert("error", { body: "DATE IS 1970", title: "LOGGER ERROR" }, 1, 1);
      return;
  }

  // Ανίχνευση φόρτισης
  if (!stats.battery.currentSession.lastLevel ||
    level > stats.battery.currentSession.lastLevel + 15) {
    if (dbg || ew.dbg) console.log("battery logger dbg: Charging detected - starting new session");
    finalizeBatterySession();
    startNewBatterySession(level, now);
    //return;
  }

  // Αν δεν υπάρχει τελευταία ενημέρωση, ξεκινάμε νέα καταγραφή
  if (!stats.battery.currentSession.lastUpdate) {
    stats.battery.currentSession.lastLevel = level;
    stats.battery.currentSession.lastUpdate = now.toLocalISOString();
    stats.battery.dailyLevels.push(level);
    //return;
  }
  
  // calculate clean cycles
  let cleanCycles = 0;
  try {
    const currentTotal = ew.apps.kitty.state.def.is.total;
    cleanCycles = currentTotal - stats.battery.currentSession.baseCycles;
    stats.battery.currentSession.cleanCycles = cleanCycles;
  }
  catch (e) {
    if (dbg || ew.dbg) console.log("battery logger dbg: Error calculating session cycles:", e);
  }

  // Εξαγωγή της τελευταίας ημερομηνίας καταγραφής (μόνο ημέρα)
  var lastUpdateDate = new Date(stats.battery.currentSession.lastUpdate).toLocalISOString().split('T')[0];

  // Αν είναι νέα μέρα, προσθέτουμε την τιμή (ανεξάρτητα από την ποσότητα)
  if (today !== lastUpdateDate) {
    if (dbg || ew.dbg) console.log("battery logger dbg: New day - logging battery level:", level, "%");
    stats.battery.dailyLevels.push(level);
    stats.battery.currentSession.lastLevel = level;
    stats.battery.currentSession.lastUpdate = now.toLocalISOString();
    
  }
  // Αν είναι ίδια μέρα, απλώς ενημερώνουμε την τελευταία τιμή
  else {
    stats.battery.currentSession.lastLevel = level;
    stats.battery.currentSession.lastUpdate = now.toLocalISOString();
  }
  updateDischargeRate();
}

function startNewBatterySession(startLevel, startDate) {
  // Αρχικοποίησε με το τρέχον total (αν υπάρχει)
  let baseCycles = 0;
  try {
    baseCycles = ew.apps.kitty.state.def.is.total;
  }
  catch (e) {
    if (dbg || ew.dbg) console.log("battery logger dbg: Error reading base cycles:", e);
  }

  stats.battery.currentSession = {
    startDate: startDate.toLocalISOString().split('T')[0],
    startLevel: startLevel,
    lastLevel: startLevel,
    lastUpdate: startDate.toLocalISOString(),
    dischargeRate: null,
    baseCycles: baseCycles,
    cleanCycles: 0
  };
  stats.battery.dailyLevels = [];
}

function finalizeBatterySession() {
  const cs = stats.battery.currentSession;
  if (!cs.startDate || !cs.lastLevel) return;

  const days = ((new Date(cs.lastUpdate) - new Date(cs.startDate)) / (1000 * 60 * 60 * 24)).toFixed(0);
  const percentLost = cs.startLevel - cs.lastLevel;

  if (days >= 1 && percentLost >= 5) {
    
    stats.battery.history.unshift({
      startDate: cs.startDate,
      endDate: new Date(cs.lastUpdate).toLocalISOString().split('T')[0],
      daysLasted: days,
      percentLost: percentLost.toFixed(0),
      avgDailyLoss: (percentLost / days).toFixed(1),
      cleanCycles: cs.cleanCycles  
    });

    if (stats.battery.history.length > 5) stats.battery.history.pop();
  }
}

function updateDischargeRate() {
  //if (dbg || ew.dbg) console.log("battery logger dbg: updateDischargeRate");
  const levels = stats.battery.dailyLevels;
  const currentLevel = stats.battery.currentSession.lastLevel || 100;
  const history = stats.battery.history;

  try {
    //  Βασικές παράμετροι μπαταρίας
    const batteryCapacity = ew.def.battCap || 12000; // mAh (default)
    const isScaleActive = ew.apps.kitty.state.def.is.scale || 0;
    const standbyCurrent = isScaleActive ? 2.2 : 0.8; // mA
    if (dbg || ew.dbg) console.log("battery logger dbg: standby current:", standbyCurrent);

    // ️ Θερμοκρασιακή προσαρμογή
    const tempC = E.getTemperature();
    let tempFactor = 1.0;
    if (tempC < 10) tempFactor = 0.7;      // -30% σε κρύο
    else if (tempC > 35) tempFactor = 0.95; // -5% σε ζέστη
    const effectiveCapacity = batteryCapacity * tempFactor;
    if (dbg || ew.dbg) console.log("battery logger dbg: effectiveCapacity:", effectiveCapacity);

    //  Υπολογισμός κύκλων καθαρισμού (τελευταία καταχώρηση ιστορικού)
    let cyclesPerDay = history.length > 0 ? 
      (history[0].cleanCycles / history[0].daysLasted) : 2;
    //if (dbg || ew.dbg) console.log("battery logger dbg: cyclesPerDay:", cyclesPerDay);
    const mAhPerCycle = calculateMahPerCycle();

    const cyclesConsumption = cyclesPerDay * mAhPerCycle;
    if (dbg || ew.dbg) console.log("battery logger dbg: cyclesConsumption:", cyclesConsumption);
    
    //  Θεωρητική ημερήσια κατανάλωση
    let totalDailyConsumption = (standbyCurrent * 24) + cyclesConsumption;
    if (tempC > 35) totalDailyConsumption += (effectiveCapacity * 0.01 / 30); // +1% self-discharge ανά μήνα  σε ζέστη
    if (dbg || ew.dbg) console.log("battery logger dbg: totalDailyConsumption:", totalDailyConsumption);
    
    //  Θεωρητικός ρυθμός εκφόρτισης (%/ημέρα)
    const theoreticalRate = 100 / (effectiveCapacity / totalDailyConsumption);
    if (dbg || ew.dbg) console.log("battery logger dbg: theoreticalRate:", theoreticalRate);

    //  Συνδυασμός με πραγματικά δεδομένα (αν υπάρχουν)
    if (levels.length >= 2) {
      const totalDrop = levels[0] - levels[levels.length - 1];
      const daysPassed = levels.length - 1;
      const realDischargeRate = totalDrop / daysPassed;
      if (realDischargeRate < 0)  realDischargeRate = 0.1; // Μικρή θετική τιμή

      // Αυτόματος υπολογισμός βαρών (περισσότερο βάρος στα πραγματικά δεδομένα όταν υπάρχουν πολλά)
      const dataWeight = Math.min(0.8, (levels.length - 1) / 7); // Μέγιστο 80% βάρος
      const combinedRate = (realDischargeRate * dataWeight) + (theoreticalRate * (1 - dataWeight));
      
      if (dbg || ew.dbg) console.log(`battery logger dbg: real discharge rate: ${realDischargeRate.toFixed(2)}%/day | Weight: ${dataWeight.toFixed(2)}`);
      stats.battery.currentSession.dischargeRate = combinedRate;
      if (dbg || ew.dbg) console.log("battery logger dbg: combinedRate:", combinedRate);

    } else {
      // Αν δεν υπάρχουν αρκετά δεδομένα, χρησιμοποιούμε μόνο τη θεωρητική εκτίμηση
      stats.battery.currentSession.dischargeRate = theoreticalRate;
      if (dbg || ew.dbg) console.log("battery logger dbg: theoreticalRate:", theoreticalRate);
    }

  } catch (e) {
    if (dbg || ew.dbg) console.log("battery logger dbg: Error:", e);
    // Fallback σε απλό υπολογισμό αν αποτύχει η λογική
    if (levels.length >= 2) {
      const totalDrop = levels[0] - levels[levels.length - 1];
      stats.battery.currentSession.dischargeRate = totalDrop / (levels.length - 1);
      if (stats.battery.currentSession.dischargeRate < 0)  stats.battery.currentSession.dischargeRate = 0.1; // Μικρή θετική τιμή

    }
  }
}

function calculateMahPerCycle() {
  const isScaleActive = ew.apps.kitty.state.def.is.scale || 0;
  const isScreenOn = ew.def.scrn || 0;
  const isAutoLightOn = ew.apps.kitty.state.def.auto.light || 0;

  if (isScaleActive && isAutoLightOn && isScreenOn ) {
    return 40;  
  } else if (isScaleActive && isAutoLightOn ) {
    return 35;
  } else if (isScaleActive && isScreenOn ) {
    return 30;
  //} else if (isScaleActive) {
  //  return 25;
  } else {
    return 25; // Προεπιλογή αν τίποτα δεν είναι ενεργό
  }
}
// === Συναρτήσεις Ανάγνωσης ===
function getBatteryStats() {
  const cs = stats.battery.currentSession;
  let statsObj = {
    currentLevel: cs.lastLevel,
    lastUpdate: cs.lastUpdate,
    status: "discharging",
    currentSession: {
      startDate: cs.startDate,
      startLevel: cs.startLevel,
      daysElapsed: getDaysSince(cs.startDate),
      dischargeRate: cs.dischargeRate,
      cleanCycles: cs.cleanCycles,
      predictedDaysLeft: cs.dischargeRate ? (cs.lastLevel / cs.dischargeRate).toFixed(0) : "Calculating..."
    },
    history: stats.battery.history.length > 0 ? stats.battery.history : "No history yet",
    dailyLevels: stats.battery.dailyLevels.length > 0 ?
      stats.battery.dailyLevels : "No daily data yet"
  };

  return statsObj;
}

function printStats() {
  if (dbg || ew.dbg) console.log(stats);
}

function getDaysSince(dateStr) {
  if (!dateStr) return 0;
  return ((new Date() - new Date(dateStr)) / (1000 * 60 * 60 * 24)).toFixed(0);
}

// === Αρχικοποίηση & Εξαγωγή ===

function initBatteryLogger() {
  loadStats();
  if (!stats.battery) {
    stats.battery = { dailyLevels: [], currentSession: {}, history: [] };
    saveStats();
  }

}

exports = {
  init: initBatteryLogger,
  log: logBatteryLevel,
  getStats: getBatteryStats,
  saveStats: saveStats,
  printStats: printStats, //for dbg
  _reset: function() { stats.battery = { dailyLevels: [], currentSession: {}, history: [] }; }, //  testing 
  get dbg() { return dbg; },
  set dbg(value) { dbg = value ? 1 : 0; }
};


// === Έναρξη ===
initBatteryLogger();
