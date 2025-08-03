// ==================== Αρχικοποίηση Δεδομένων ====================
//logger=require("logger")
//logger.logUsage(); clean|event,{sec:0,gr:0}
//logger.getStats();"year|month|day|activity
//logger.saveStats();
var stats = {
  // Παλιά δεδομένα καθαρισμών
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
  battery: {
    dailyLevels: {}, // { "2023-12-15": 85, "2023-12-16": 72, ... }
    predictions: {
      lastPredictedDuration: null, // σε ώρες
      lastCheck: null // timestamp
    }
  }
  /*activity: {
    last24h: [],       // Τελευταία 24ώρα events
    allTimeStats: {    // Στατιστικά όλων των events
      total: 0,
      avgDuration: 0,
      avgWeight: 0,
      lastEntry: null
    }
  }*/
};

// ==================== Βοηθητικές Συναρτήσεις ====================
function loadStats() {
  try {
    var saved = require("Storage").readJSON("cat_stats.json");
    if (saved) {
      stats = saved;
      console.log("Stats loaded");
    }
  }
  catch (e) {
    console.log("No saved stats, starting fresh");
  }
}

function saveStats() {
  require("Storage").write("cat_stats.json", stats);
  console.log("Stats saved");
}

function cleanupOldEvents() {
  var now = Math.floor(Date.now() / 1000);
  var cutoff = now - 86400; // 24 ώρες πριν
  stats.activity = stats.activity.filter(e => e.time >= cutoff);
}


function logUsage(type, data) {
  var now = new Date();
  var hour = now.getHours();

  // Μετατροπή 0 → 24 για μεσάνυχτα
  var displayHour = hour === 0 ? 24 : hour;

  // ... υπόλοιπη λογική ...
  if (!stats.dayHours[day]) stats.dayHours[day] = {};
  stats.dayHours[day][displayHour] = (stats.dayHours[day][displayHour] || 0) + 1;
}



// ==================== Βασικές Συναρτήσεις ====================
function logUsage(type, data) {
  var now = new Date();
  var hour = now.getHours();
  // Μετατροπή 0 → 24 για μεσάνυχτα
  //var displayHour = hour === 0 ? 24 : hour;

  // 1. Καταγραφή καθαρισμού
  if (type === "clean") {
    var year = now.getFullYear().toString();
    var month = now.getMonth() + 1;
    var day = now.getDate();
    var hour = now.getHours();

    // Ενημέρωση παλιών stats
    if (!stats.years[year]) stats.years[year] = {};
    stats.years[year][month] = (stats.years[year][month] || 0) + 1;

    if (!stats.months[month]) stats.months[month] = {};
    stats.months[month][day] = (stats.months[month][day] || 0) + 1;

    if (!stats.dayHours[day]) {
      var keys = Object.keys(stats.dayHours);
      if (keys.length >= 15) delete stats.dayHours[keys[0]];
      stats.dayHours[day] = {};
    }
    //stats.dayHours[day][displayHour] = (stats.dayHours[day][displayHour] || 0) + 1; //midnight is 24
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
}

function logBatteryLevel() {
  var now = new Date();
  var dateStr = now.toISOString().split('T')[0]; // "2023-12-15"
  //var level = E.getBattery();  // Τρέχουσα μπαταρία (%)
  var level = ew.is.batS;
  stats.battery.dailyLevels[dateStr] = level;
  updateBatteryPredictions();
  //saveStats();
}

function updateBatteryPredictions() {
  var levels = Object.values(stats.battery.dailyLevels);
  if (levels.length < 2) return; // Χρειάζονται τουλάχιστον 2 σημεία

  // Υπολογισμός μέσης ημερήσιας πτώσης (%/ημέρα)
  var totalDrop = 0;
  for (var i = 1; i < levels.length; i++) {
    totalDrop += levels[i - 1] - levels[i];
  }
  var avgDailyDrop = totalDrop / (levels.length - 1);

  // Πρόβλεψη υπολειπόμενης διάρκειας (ημέρες)
  var currentLevel = ew.is.batS;
  var predictedDaysLeft = (currentLevel / avgDailyDrop).toFixed(1);
  stats.battery.predictions = {
    lastPredictedDuration: predictedDaysLeft * 24, // σε ώρες
    lastCheck: Math.floor(Date.now() / 1000)
  };
}

function getStats(level, specific, operation) {
  switch (level) {
    // ==================== YEAR ====================
    case "year":
      if (operation === "total" || specific === "total") { // Διορθωμένος έλεγχος
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
      if (specific) {
        return stats.dayHours[specific] || {}; // <-- Απευθείας τα δεδομένα χωρίς {ημέρα: ...}
        //const result = {};
        //result[specific] = stats.dayHours[specific] || {};
        //return result;
      }
      return stats.dayHours[new Date().getDate()] || {}; // <-- Ίδια λογική

      //const defaultDay = new Date().getDate();
      //const defaultResult = {};
      //defaultResult[defaultDay] = stats.dayHours[defaultDay] || {};
      //return defaultResult;

      // ==================== ACTIVITY ====================
    case "activity":
      return //{
      stats.activity
      //last24h: stats.activity.last24h,
      //stats: stats.allTimeStats
      //};

    case "battery":
      if (specific === "prediction") {
        return stats.battery.predictions;
      }
      return stats.battery.dailyLevels;

    default:
      return stats;
  }
}

// ==================== Αυτόματη Αποθήκευση ====================
function setupDailySave() {
  setInterval(function() {
    var now = new Date();
    if (now.getHours() === 12 && now.getMinutes() === 5) {
      cleanupOldEvents();
      saveStats();
    }
  }, 60000);
}

function dailySave() {
  setTimeout(() => {
    if (!g.isOn && ew.pin.CHRG.read()) {
      logBatteryLevel();
      cleanupOldEvents();
      saveStats();
    }
    else
      dailySave();
  }, 60000);
}

function setupBatteryLogger() {
  // Καταγραφή κάθε βράδυ στις 23:59
  setInterval(function() {
    var now = new Date();
    if (now.getHours() === 23 && now.getMinutes() === 59) {
      logBatteryLevel();
    }
  }, 60000); // Έλεγχος κάθε λεπτό
}

// ==================== Εκκίνηση Συστήματος ====================
function onInit() {
  loadStats();
  // Διασφάλιση ύπαρξης βασικών αντικειμένων
  if (!stats.battery) stats.battery = { dailyLevels: {}, predictions: {} };
  if (!stats.years) stats.years = {};
  if (!stats.months) stats.months = {};
  if (!stats.dayHours) stats.dayHours = {};
  if (!stats.activity) {
    stats.activity = {
      last24h: [],
      allTimeStats: { total: 0, avgDuration: 0, avgWeight: 0, lastEntry: null }
    };
  }
  //setupDailySave();
  //setupBatteryLogger();
}

// ==================== Εξαγωγή Συναρτήσεων ====================
exports = {
  logUsage: logUsage,
  getStats: getStats,
  saveStats: saveStats,
  logBatteryLevel: logBatteryLevel,
  dailySave: dailySave,
  getActivity: function() { return stats.activity; }
};

// ==================== Αυτόματη Αποθήκευση ====================
cron.on('hour', (x) => { if (x == 0) logger.dailySave() });

// ==================== Αρχικοποίηση ====================
onInit();