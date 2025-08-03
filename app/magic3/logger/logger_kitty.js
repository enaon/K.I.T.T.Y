// ==================== Αρχικοποίηση Δεδομένων ====================
//logger=require("logger")
//logger.logUsage(); clean|event,{sec:0,gr:0}
//logger.getStats();"year|month|day|activity
//logger.saveStats();
var dbg = 0;
var stats = {
  // Παλιά δεδομένα καθαρισμών
  allTime: {},
  years: {},
  months: {},
  dayHours: {},

  // Νέα δεδομένα activity
  activity: [], // Τελευταία 24ώρα events
  allTimeStats: { // Στατιστικά όλων των events
    total: 0,
    avgDuration: 0,
    avgWeight: 0,
    lastEntry: null
  },

  /*activity: {
    last24h: [],       // Τελευταία 24ώρα events
    allTimeStats: {    // Στατιστικά όλων των events
      total: 0,
      avgDuration: 0,
      avgWeight: 0,
      lastEntry: null
    },
  }*/

  wasteContainer: {
    lastLevel: null, // Τελευταία καταγεγραμμένη πληρότητα (%)
    monthlyEmptying: {} // { "2023": { "1": 3, "2": 5 }, "2024": {...} }
  }
};

// ==================== Βοηθητικές Συναρτήσεις ====================
function loadStats() {
  try {
    var saved = require("Storage").readJSON("ew_logger_kitty.json");
    if (saved) {
      stats = saved;
      if (dbg || ew.dbg) console.log("kitty logger dbg: Stats loaded");
    }
  }
  catch (e) {
    if (dbg || ew.dbg) console.log("kitty logger dbg: No saved stats, starting fresh");
  }
}

function saveStats(i) {
  var year = Date().getFullYear().toString();
  if (year === "1970") {
      ew.notify.alert("error", { body: "DATE IS 1970", title: "LOGGER ERROR" }, 1, 1);
      return;
  }

  cleanupOldEvents(i||"");
  require("Storage").write("ew_logger_kitty.json", stats);
  if (dbg || ew.dbg) console.log("kitty logger dbg: Stats saved");
}

function cleanupOldEvents(i) {
  var now = Math.floor(Date.now() / 1000);
  var cutoff = now - 86400; // 24 ώρες πριν
  stats.activity = stats.activity.filter(e => e.time >= cutoff);
  
  // ---- delete day/month keys if exists ----
  var day = Date().getDate();
  if (dbg || ew.dbg) console.log(`kitty logger dbg: cleanup function: ${i}`);
  if (i === "day") {
    if (stats.dayHours[day]) {
      if (dbg || ew.dbg) console.log(`kitty logger dbg: day ${day} exists, removing key`);
      delete stats.dayHours[day];
    }
    if (day === 1) {
      var month = Date().getMonth();
      if (stats.months[month + 1]) {
        if (dbg || ew.dbg) console.log(`kitty logger dbg: month  ${month+1} exists, removing key`);
        delete stats.months[month + 1];
      }

    }
  }

}

function printStats() {
  console.log(stats);
}
// ==================== Βασικές Συναρτήσεις ====================
function logUsage(type, data) {
  var now = new Date();
  var hour = now.getHours();
  var year = now.getFullYear().toString();
  var month = now.getMonth() + 1;
  
  if (year === "1970") {
      ew.notify.alert("error", { body: "DATE IS 1970", title: "LOGGER ERROR" }, 1, 1);
      return;
  }

  // 1. Καταγραφή καθαρισμού
  if (type === "clean") {
    var day = now.getDate();
    var hour = now.getHours();

    // Ενημέρωση παλιών stats
    if (!stats.years[year]) stats.years[year] = {};
    stats.years[year][month] = (stats.years[year][month] || 0) + 1;

    if (!stats.months[month]) stats.months[month] = {};
    stats.months[month][day] = (stats.months[month][day] || 0) + 1;

    if (!stats.dayHours[day]) {
      var keys = Object.keys(stats.dayHours);
      if (keys.length >= 30) delete stats.dayHours[keys[0]];
      stats.dayHours[day] = {};
    }
    stats.dayHours[day][hour] = (stats.dayHours[day][hour] || 0) + 1;
  }

  // 2. Καταγραφή event εισόδου
  else if (type === "event") {
    var event = {
      sec: data.sec || 0,
      gr: data.gr || 0,
      time: data.time || Math.floor(Date.now() / 1000)
    };

    // Προσθήκη στα last24h
    //stats.activity.last24h.push(event);
    //stats.activity.last24h.unshift(event);
    stats.activity.unshift(event);

    // Ενημέρωση allTimeStats
    var total = stats.allTimeStats.total;
    stats.allTimeStats.total++;
    stats.allTimeStats.avgDuration =
      ((stats.allTimeStats.avgDuration * total) + event.sec) / (total + 1);
    stats.allTimeStats.avgWeight =
      ((stats.allTimeStats.avgWeight * total) + event.gr) / (total + 1);
    stats.allTimeStats.lastEntry = event.time;

    cleanupOldEvents();
  }

  // 3. Καταγραφή αδειασματος συρταριού απορριμμάτων
  else if (type === "waste") {

    // Έλεγχος για άδειασμα (από 25%+ σε <10%)
    if (stats.wasteContainer.lastLevel !== null &&
      stats.wasteContainer.lastLevel >= 25 &&
      data < 10) {

      // Αρχικοποίησε το έτος αν δεν υπάρχει
      if (!stats.wasteContainer.monthlyEmptying[year]) {
        stats.wasteContainer.monthlyEmptying[year] = {};
      }

      // Αύξησε τον μετρητή για τον τρέχοντα μήνα
      stats.wasteContainer.monthlyEmptying[year][month] =
        (stats.wasteContainer.monthlyEmptying[year][month] || 0) + 1;

      if (dbg || ew.dbg) console.log(`waste record: ${month}/${year}`);
    }

    // Αποθήκευσε το τρέχον επίπεδο για επόμενη σύγκριση
    stats.wasteContainer.lastLevel = data;

    //saveStats();
  }
}

function getStats(level, specific, operation) {
  switch (level) {
    // ==================== ALL TIME (with TOTAL support) ====================
    case "allTime":
      const allTime = {};
      let totalSum = 0; // Αρχικοποίηση συνολικού αθροίσματος

      // Υπολογισμός αθροίσματος ανά έτος
      for (const year in stats.years) {
        const months = stats.years[year];
        const sum = Object.values(months).reduce((total, current) => total + current, 0);
        allTime[year] = sum;
        totalSum += sum; // Προσθήκη στο συνολικό άθροισμα
      }

      // Επιστροφή ανάλογα με τις παραμέτρους
      if (operation === "total" || specific === "total") {
        return totalSum; // Επιστρέφει μόνο το total
      }
      return allTime; // Επιστρέφει όλα τα έτη με τα αθροίσματά τους

      // ==================== YEAR ====================
    case "year":
      if (operation === "total" || specific === "total") {
        const year = (operation === "total") ? (specific || new Date().getFullYear().toString()) :
          new Date().getFullYear().toString();
        const yearlyData = stats.years[year] || {};
        return Object.values(yearlyData).reduce((sum, count) => sum + count, 0);
      }
      if (specific) return stats.years[specific.toString()] || {};
      return stats.years[new Date().getFullYear().toString()] || {};

      // ==================== MONTH ====================
    case "month":
      if (operation === "total" || specific === "total") {
        const month = (operation === "total") ? (specific || new Date().getMonth() + 1) :
          new Date().getMonth() + 1;
        const monthlyData = stats.months[month] || {};
        return Object.values(monthlyData).reduce((sum, count) => sum + count, 0);
      }
      if (specific) return stats.months[specific] || {};
      return stats.months[new Date().getMonth() + 1] || {};

      // ==================== DAY ====================
    case "day":
      if (operation === "total" || specific === "total") {
        const day = (operation === "total") ? (specific || new Date().getDate()) :
          new Date().getDate();
        const dailyData = stats.dayHours[day] || {};
        return Object.values(dailyData).reduce((sum, count) => sum + count, 0);
      }
      if (specific) return stats.dayHours[specific] || {};
      return stats.dayHours[new Date().getDate()] || {};

      // ==================== ACTIVITY ====================
    case "activity":
      return stats.activity;

      // ==================== WASTE ====================
    case "waste":
      if (specific === "year") {
        return stats.wasteContainer.monthlyEmptying;
      }
      else if (specific) {
        return stats.wasteContainer.monthlyEmptying[specific] || {};
      }
      const currentYear = new Date().getFullYear().toString();
      return stats.wasteContainer.monthlyEmptying[currentYear] || {};

    default:
      return stats;
  }
}

/*
getStatsOptimized = function(level) {
  const data = getStats(level);
  const json = JSON.stringify(data);
  const MAX_CHUNK = 128; // 131 - 3 (για framing)
  
  // Framing με μοναδικούς delimiters
  let output = "\x01JSON\x02"; // ASCII control characters
  
  // Χωρισμός σε chunks
  for (let i = 0; i < json.length; i += MAX_CHUNK) {
    output += json.substr(i, MAX_CHUNK);
  }
  
  return output + "\x01END\x02";
};

*/

function getStatsJSON(level) {
  return JSON.stringify(getStats(level));
}

// ==================== Εκκίνηση Συστήματος ====================
function init() {
  loadStats();
  // Διασφάλιση ύπαρξης βασικών αντικειμένων
  if (!stats.years) stats.years = {};
  if (!stats.months) stats.months = {};
  if (!stats.dayHours) stats.dayHours = {};
  if (!stats.activity) stats.activity = [];
  /*{
    stats.activity = {
      last24h: [],
      allTimeStats: { total: 0, avgDuration: 0, avgWeight: 0, lastEntry: null }
    };
  }*/
  // Διασφάλιση ύπαρξης wasteContainer
  if (!stats.wasteContainer) {
    stats.wasteContainer = {
      lastLevel: null,
      monthlyEmptying: {}
    };
  }
  //setupDailySave();
}

// ==================== Εξαγωγή Συναρτήσεων ====================
exports = {
  printStats: printStats,
  logUsage: logUsage,
  getStats: getStats,
  saveStats: saveStats,
  getStatsJSON: getStatsJSON,
  get dbg() { return dbg; },
  set dbg(value) { dbg = value ? 1 : 0; }
  //getActivity: function() { return stats.activity; }
};


init();
