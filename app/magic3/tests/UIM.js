// ================== CORE UI MANAGER ==================
global.UIM = (() => {
  // Προ-ορισμένα Layouts
  const LAYOUTS = {
    header: { x: 0, y: 0, w: 240, h: 40, txtSize: 16 },
    header2R: { x: 0, y: 0, w: 240, h: 40, type: 'row', slots: 2 },
    main: { x: 0, y: 40, w: 240, h: 160 },
    main3R1: { x: 0, y: 28, w: 243, h: 77, type: 'row', slots: 3  },
    main3R2: { x: 0, y: 107, w: 243, h: 77, type: 'row', slots: 3  },
    bar: { x: 0, y: 200, w: 240, h: 80, txtSize: 20 },
    bar2R: { x: 0, y: 200, w: 240, h: 80, type: 'row', slots: 2 },
    bar3R: { x: 0, y: 200, w: 240, h: 80, type: 'row', slots: 3 },
    full: { x: 0, y: 0, w: 240, h: 280 }
  };

  // Cache
  var components = [];
  const notifications = [];

  const themes = {
    default: {
      primary: 4, // Μπλε
      secondary: 1, // γκρί
      accent: 7, // kitrino
      text: 15, // Άσπρο
      bg: 0, // Μαύρο
      notify: 15, // Ασπρο
      notifyText: 0, // Μαυρο
    },
    dark: {
      primary: 11,
      secondary: 1,
      accent: 7,
      text: 15,
      bg: 0,
      notify: 7,
      notifyText: 0
    },
    highContrast: {
      primary: 15, // Λευκό
      secondary: 0, // Μαύρο
      accent: 7, // Κίτρινο
      text: 0, // Μαύρο
      bg: 15, // Λευκό
      notify: 13, // Κόκκινο
      notifyText: 15
    }
  };


  let theme = themes.default;

  // ================ PRIVATE ΣΥΝΑΡΤΗΣΕΙΣ ================
  const setTheme = (newTheme) => {
    // Ενημέρωση του theme
    for (const key in newTheme) {
      theme[key] = newTheme[key];
    }

    // Ανανέωση όλων των components
    components.forEach(comp => {
      if (comp) {
        comp._dirty = true; // Επανασχεδίασε
        UIM.drawComponent(comp);
      }
    });

    //g.flip();
  };


  const getLayout = (region, slot) => {
    const l = LAYOUTS[region] || LAYOUTS.main;
    if (l.type === 'row') {
      const slotW = l.w / l.slots;
      return {
        x: l.x + (slot * slotW),
        y: l.y,
        w: slotW,
        h: l.h
      };
    }
    return l;
  };

  const drawBtn = b => {
      g.setColor(b.bgColor || theme.primary);
      const padd=6;
      if (b.round) g.fillRect( {x:b.x, y:b.y, x2:b.x + b.w-padd, y2:b.y + b.h-padd, r: 10});
      else g.fillRect( b.x, b.y, b.x + b.w-padd, b.y + b.h-padd);
      //.fillRect( b.x, b.y, b.x + b.w, b.y + b.h)
      g.setColor(b.textColor || theme.text)
      .setFont(b.font || "Vector", b.fontSize || 25)
      .setFontAlign(0, 0) // Διορθωμένο εδώ
      .drawString(b.text, b.x + b.w / 2, b.y + b.h / 2)
      .setFontAlign(-1, -1);
      
      
  //        if (b.round) g.fillRect( {x:b.x, y:b.y, x2:b.x + b.w, y2:b.y + b.h, r: 10})
  //  else if (b.round) g.fillRect( b.x, b.y, b.x + b.w, b.y + b.h)
  };

  const drawTxt = t => {
    g.setColor(t.color || theme.text)
      .setFont(t.font || "6x8")
      .setFontAlign(-1, -1) // Διορθωμένο εδώ
      .drawString(t.text, t.x, t.y);
  };


  const drawGraph = gr => {
    let max = 0;
    for (let i = 0; i < gr.data.length; i++) {
      if (gr.data[i] > max) max = gr.data[i];
    }

    if (max <= 0) return;

    const step = gr.w / gr.data.length;
    const defaultCol = gr.color || theme.secondary;
    const isSelected = gr.selectedIndex || 0;
    const highlightCol = gr.highlightColor || theme.accent; // Χρώμα για highlight
    const h = gr.h;
    const yBase = gr.y + h;

    g.setColor(theme.bg) //εκκαθάριση
      .fillRect(gr.x, gr.y, gr.x + gr.w, gr.y + gr.h);

    for (let i = 0; i < gr.data.length; i++) {
      const barH = (gr.data[i] / max) * h;
      const isSelected = (gr.selectedIndex === i); // Έλεγχος αν είναι επιλεγμένο

      g.setColor(isSelected ? highlightCol : defaultCol) // Αλλαγή χρώματος
        .fillRect(
          gr.x + i * step + 1,
          yBase - barH,
          gr.x + (i + 1) * step - 1,
          yBase
        );
    }

    if ("selectedIndex" in gr)
      return {
        index1: gr.selectedIndex, // Default πρώτο στοιχείο
        value1: gr.data[gr.selectedIndex || "no_data"]
      };

    return "out of draw graph";

  };

  const drawNotify = n => {
    //console.log("draw notify n:", n);
    g.setColor(n.bgColor || theme.notify)
      .fillRect({ x: n.x, y: n.y, x2: n.x + n.w, y2: n.y + n.h, r: 10 })
      .setColor(n.textColor || theme.notifyText)
      .setFont(n.font || "LECO1976Regular22", n.fontSize || 1)
      .setFontAlign(0, 0)
      .drawString(n.title.toUpperCase(), n.x + n.w / 2, n.message ? n.h / 2 + n.y + -5 - g.getFontHeight() / 2 : n.y + n.h / 2)
      .drawString(n.message.toUpperCase(), n.x + n.w / 2, n.h / 2 + n.y + 5 + g.getFontHeight() / 2)
      .setFontAlign(-1, -1);

    // Προσθήκη κουμπιών δράσης αν υπάρχουν
    if (n.actions && n.actions.length > 0) {
      const btnWidth = n.w / (n.actions.length + 1);
      n.actions.forEach((action, index) => {
        const btnX = n.x + (index * btnWidth);
        g.setColor(action.bgColor || theme.accent)
          .fillRect(btnX, n.y + n.h - 30, btnX + btnWidth - 5, n.y + n.h - 10)
          .setColor(action.textColor || theme.text)
          .setFont(n.font || "Vector", n.fontSize || 20)
          .setFontAlign(0, 0)
          .drawString(action.text, btnX + btnWidth / 2 - 2.5, n.y + n.h - 20)
          .setFontAlign(-1, -1);
      });
    }
  };
  const drawSlider = s => {
    // Default padding (0 αν δεν οριστεί)
    const padX = s.padding.x; // Αν το padding είναι number, ισχύει για και τις δύο κατευθύνσεις
    const padY = s.padding.y;

    // Υπολογισμός inner area
    const innerX = s.x + (s.w * padX / 2);
    const innerY = s.y + (s.h * padY / 2);
    const innerW = s.w * (1 - padX);
    const innerH = s.h * (1 - padY);

    // Clear μόνο το inner area (βελτιστοποίηση)
    //g.setColor(theme.bg).fillRect(innerX, innerY, innerX + innerW, innerY + innerH);
    // Clear area
    //g.setColor(theme.bg).fillRect(s.x, s.y, s.x + s.w, s.y + s.h);

    const min = s.min || 0;
    const max = s.max || 100;
    const value = Math.min(Math.max(s.value || 0, min), max);
    const barCount = max - min + 1; // 1 bar per step (0-20 = 21 bars)
    const barWidth = Math.max(2, s.w / barCount); // Minimum 2px width

    if ( s.mode === 'fast')
      g.setColor(s.fillColor || theme.primary)
        .fillRect({ x: innerX, y: innerY, x2: innerX + innerW, y2: innerY + innerH, r: 15 });
        //.flip();

    else if (s.mode === 'graph') {
      // Υπολογισμός padding (default 0 αν δεν οριστεί)
      const padX = (s.padding.x);
      const padY = (s.padding.y);

      // Υπολογισμός inner area
      const innerX = s.x + (s.w * padX / 2);
      const innerY = s.y + (s.h * padY / 2);
      const innerW = s.w * (1 - padX);
      const innerH = s.h * (1 - padY);
      const barCount = max - min + 1;
      const barWidth = Math.max(2, innerW / barCount); // Minimum 2px

      // ===== 1. ΠΡΩΤΟ DRAW =====
      if (!s._drawn) {
        g.setColor(theme.bg).fillRect(innerX, innerY, innerX + innerW, innerY + innerH);

        // Ζωγράφισε ΟΛΕΣ τις μπάρες με scaling και padding
        for (let i = 0; i < barCount; i++) {
          const barValue = min + i;
          const isActive = (barValue <= value);
          const barHeight = (barValue / max) * innerH; // Scaling με padding!
          const barX = innerX + (i * barWidth);
          const barY = innerY + innerH - barHeight;

          g.setColor(isActive ? s.activeColor : s.inactiveColor)
            .fillRect(barX + 1, barY, barX + barWidth - 1, innerY + innerH);
        }

        s._lastValue = value;
        s._drawn = true;
        return;
      }

      // ===== 2. UPDATE =====
      const lastValue = s._lastValue || min;

      // Α) ΑΝΑΝΕΩΣΗ ΠΑΛΙΑΣ ΜΠΑΡΑΣ (αν μειώθηκε η τιμή)
      if (value < lastValue) {
        const oldBarIdx = lastValue - min;
        const oldBarHeight = (lastValue / max) * innerH;
        const oldBarX = innerX + (oldBarIdx * barWidth);
        const oldBarY = innerY + innerH - oldBarHeight;

        g.setColor(s.inactiveColor)
          .fillRect(oldBarX + 1, oldBarY, oldBarX + barWidth - 1, innerY + innerH);
      }

      // Β) ΑΝΑΝΕΩΣΗ ΝΕΑΣ ΜΠΑΡΑΣ
      const newBarIdx = value - min;
      const newBarHeight = (value / max) * innerH;
      const newBarX = innerX + (newBarIdx * barWidth);
      const newBarY = innerY + innerH - newBarHeight;

      g.setColor(s.activeColor)
        .fillRect(newBarX + 1, newBarY, newBarX + barWidth - 1, innerY + innerH);

      s._lastValue = value;
    }

    else {
      // Fill mode με padding
      const ratio = (s.value - s.min) / (s.max - s.min);
      const fillWidth = innerW * ratio;
      //console.log("x,y,x1,y1:", innerX + fillWidth, innerY, innerX + innerW, innerY + innerH)
      g.setColor(s.bgColor || theme.secondary)
        .fillRect({ x: innerX + fillWidth, y: innerY, x2: innerX + innerW, y2: innerY + innerH, r: 15 });
        //.flip();
      g.setColor(s.fillColor || theme.primary)
        .fillRect({ x: innerX, y: innerY, x2: innerX + fillWidth, y2: innerY + innerH, r: 15 });
        //.flip();
    }

  };


  const isInside = (c, x, y) => {
    return x >= c.x && x <= (c.x + c.w) &&
      y >= c.y && y <= (c.y + c.h);
  };

  /*const isInside = (c, x, y) => {
    const padX = c.padding.x;
    const padY = c.padding.y;

    const ix = c.x + (c.w * padX / 2);
    const iy = c.y + (c.h * padY / 2);
    const iw = c.w * (1 - padX);
    const ih = c.h * (1 - padY);

    return x >= ix && x <= (ix + iw) &&
      y >= iy && y <= (iy + ih);
  };
*/
  const drawComponent = c => {
    if (!c || !c._dirty) return;

    switch (c.type) {
      case 'btn':
        drawBtn(c);
        break;
      case 'txt':
        drawTxt(c);
        break;
      case 'graph':
        drawGraph(c);
        break;
      case 'notify':
        drawNotify(c);
        break;
      case 'slider':
        drawSlider(c);
        break;
    }

    c._dirty = false;
    g.flip();
  };

  const removeComponent = id => {
    const c = components[id];
    if (!c) return;

    g.setColor(theme.bg)
      .fillRect(c.x, c.y, c.x + c.w, c.y + c.h);
    delete components[id];
    //components[id] = null;
  };

  const clearNotification = id => {
    const notif = components[id];
    if (!notif || notif.type !== 'notify') return;

    removeComponent(id);

    if (notif.original) {
      for (let i = 0; i < notif.original.length; i++) {
        const comp = notif.original[i];
        if (comp) components[comp.id] = comp;
      }
    }
    ///g.flip();
    if (ew.face[0].bar) ew.face[0].bar();
  };

  const notify = (region, title, message, options) => {
    // Handle cases where options might be a number (duration) or string (message)
    if (typeof options === 'number') {
      options = { duration: options };
    }
    else if (typeof options === 'string' || options instanceof String) {
      options = {
        duration: 3,
        message: options
      };
      region = title;
      title = message;
      message = options.message;
    }

    // Default values - replace destructuring with traditional assignment
    options = options || {};
    var duration = options.duration !== undefined ? options.duration : 3;
    var actions = options.actions || [];
    var onAction = options.onAction || function() {};
    var onTap = options.onTap || null;

    // Ακύρωση προηγούμενων ειδοποιήσεων
    for (let i = 0; i < notifications.length; i++) {
      const id = notifications[i];
      const n = components[id];
      if (n && n.region === region) {
        clearNotification(id);
      }
    }

    // Αποθήκευση τρέχοντος περιεχομένου
    const original = [];
    for (let i = 0; i < components.length; i++) {
      if (components[i] && components[i].region === region) {
        original.push(components[i]);
        removeComponent(i);
      }
    }

    // Προσθήκη νέας ειδοποίησης
    const notifId = UIM.add('notify', region, 0, {
      title,
      message,
      original,
      duration,
      actions,
      onAction,
      onTap
    });

    notifications.push(notifId);

    // Ορισμός timeout
    if (duration > 0) {
      components[notifId].timer = setTimeout(() => {
        clearNotification(notifId);

      }, duration * 1000);
    }

    return notifId;
  };


  // ================ PUBLIC API ================
  
  
  
  return {

    //tests
    getLayout: getLayout,
    components: (i) => { if (i === "reset") components = [];
      else if (i === "clear") components.length = 0; return components; },
    notifications: notifications,
    theme: () => { return theme; },
    setTheme: setTheme,
    reset: () => { components = []; return components },

    //
    init: customTheme => {

      TC.removeAllListeners("tc5");
      TC.removeAllListeners("bar");
      TC.on('tc5', UIM.handleTouch);
      TC.on('bar', UIM.handleSlide);

      if (customTheme) {
        for (const key in customTheme) {
          theme[key] = customTheme[key];
        }
      }
      components = [];
      g.clear();
      //g.flip();
    },

    add: (type, region, slot, opts) => {

      const exists = components.find(c => c.type === type && c.region === region && c.slot === slot);
      
      if (exists) {
        console.log("enty is allread added, discarding add",exists);
        UIM.update(exists.id, exists);
        return;
      }
      else if (type === 'slider') {
        // Ενεργοποίηση touch mode για bar
        global.ew.temp.bar = 1;

        // Ορισμός TC.val με τις τιμές του slider
        global.TC.val = {
          cur: opts.value || opts.min || 0,
          dn: opts.min || 0,
          up: opts.max || 100,
          tmp: 0
        };
      }
      //
      const layout = getLayout(region, slot);
      const id = components.length;

      const comp = {
        id,
        type,
        region,
        slot,
        x: layout.x,
        y: layout.y,
        w: layout.w,
        h: layout.h,
        _dirty: true
      };

      if (opts) {
        for (const key in opts) {
          comp[key] = opts[key];
        }
      }

      components.push(comp);
      drawComponent(comp);
      return id;
    },

    update: (id, changes) => {
      const c = components[id];
      if (!c) return;

      for (const key in changes) {
        c[key] = changes[key];
      }

      c._dirty = true;

      drawComponent(c);
      if (c.type == "graph" && "selectedIndex" in c) {
        console.log("return1 update", c, c.selectedIndex);

        return {
          index2: c.selectedIndex || 0,
          value2: c.data[c.selectedIndex || 0]
        };
      }

    },

    remove: removeComponent,

    getGraphValue: (id, index) => {
      const gr = components[id];
      if (!gr || gr.type !== 'graph') return null;

      if (index !== undefined) gr.selectedIndex = index; // Ενημέρωση επιλεγμένου index
      gr._dirty = true; // Επανασχεδίαση

      return {
        index: gr.selectedIndex || 0, // Default πρώτο στοιχείο
        value: gr.data[gr.selectedIndex || 0]
      };
    },

    notify: (region, title, message, options = {}) => {
      return notify(region, title, message, options);
    },

    handleTouch: (x, y, l) => {
      // 1. Check for active bar mode
      if (ew.temp.bar === 1) {

        const slider = components.find(c => c.type === 'slider' && c.region === 'bar');

        // Αν υπάρχει slider και το tap ΕΙΝΑΙ εκτός μπάρας
        if (slider && !isInside(slider, x, y)) {
          // Απενεργοποίηση bar mode
          global.ew.temp.bar = 0;
          UIM.remove(slider.id);
          //g.flip();
          return true; // Block further processing
        }

        // Αν το tap είναι ΜΕΣΑ στη μπάρα, αγνόησέ το (θα το χειριστεί ο νέος handler)
        if (slider && isInside(slider, x, y)) {
          return true;
        }
      }

      // Έλεγχος ειδοποιήσεων πρώτα
      for (let i = notifications.length - 1; i >= 0; i--) {
        const id = notifications[i];
        const n = components[id];
        if (n && isInside(n, x, y)) {
          // Έλεγχος για πάτημα κουμπιού δράσης
          if (n.actions && n.actions.length > 0) {
            const btnWidth = n.w / (n.actions.length + 1);
            for (let j = 0; j < n.actions.length; j++) {
              const btnX = n.x + (j * btnWidth);
              if (x >= btnX && x <= btnX + btnWidth - 5 &&
                y >= n.y + n.h - 30 && y <= n.y + n.h - 10) {
                n.onAction(n.actions[j].actionId);
                return true;
              }
            }
          }

          if (n.onTap) n.onTap();
          clearNotification(id);
          return true;
        }
      }

      //graph
      for (let i = 0; i < components.length; i++) {
        const c = components[i];
        if (c && c.type === 'graph' && isInside(c, x, y)) {

          const step = c.w / c.data.length;
          const clickedIndex = Math.floor((x - c.x) / step);
          UIM.update(c.id, { selectedIndex: clickedIndex });
          return true;
        }
        else if (c && c.onTap && isInside(c, x, y)) {
          console.log("tap1");
          c.onTap();
          return true;
        }

        //  }

        // Έλεγχος κανονικών components
        // for (let i = components.length - 1; i >= 0; i--) {
        else if (c && c.onTap && isInside(c, x, y)) {
          console.log("tap2");
          c.onTap();
          return true;
        }
        //   }
        // for (let i = components.length - 1; i >= 0; i--) {
        else if (c && c.type === 'slider' && isInside(c, x, y)) {
          //global.ew.temp.bar = 1;
          UIM.remove(c.id);

          return true;
        }
      }
      return false;
    },
    handleSlide: (a, b) => {
      if (!global.ew.temp.bar) return false;
      // Register bar handler

      const slider = components.find(c => c.type === 'slider' && c.region === 'bar');
      if (!slider) return;

      let newValue;

      // Λειτουργία slide mode (με βάση το b)
      if (slider.TC === "slide") {
        // Χάρτευση του b (από TC.val.dn έως TC.val.up) σε slider.min-slider.max
        newValue = Math.round(
          slider.min + (b - global.TC.val.dn) * (slider.max - slider.min) / (global.TC.val.up - global.TC.val.dn)
        );
      }
      // Λειτουργία βηματική (με βάση το a)
      else {
        const step = slider.step || 1;
        newValue = slider.value + (a * step);
      }

      // Εφαρμογή ορίων
      newValue = Math.min(Math.max(newValue, slider.min), slider.max);

      UIM.update(slider.id, { value: newValue });
      if (slider.onTap) slider.onTap({ "value": newValue });
      if (slider.onChange) slider.onChange(newValue);
    }

  };
})();

// ================== ΠΑΡΑΔΕΙΓΜΑ ΧΡΗΣΗΣ ==================
const startApp = () => {
  // 1. Αρχικοποίηση
  UIM.init({
    primary: 0xF800, // Κόκκινο
    bg: 0x0000 // Μαύρο
  });

  // 2. Κουμπιά header
  const btnWeight = UIM.add('btn', 'header', 0, {
    text: "WEIGHT",
    onTap: () => {
      UIM.update(btnWeight, { bgColor: 0xF800 });
      UIM.update(btnTime, { bgColor: 0x0000 });
      print("Weight pressed");
    }
  });

  const btnTime = UIM.add('btn', 'header', 1, {
    text: "TIME",
    onTap: () => {
      UIM.update(btnWeight, { bgColor: 0x0000 });
      UIM.update(btnTime, { bgColor: 0xF800 });
      print("Time pressed");
    }
  });

  // 3. Γράφημα
  const graph = UIM.add('graph', 'bar', 0, {
    data: [10, 20, 15, 30, 25, 40],
    color: 4 // mple
  });

  // 4. Πληροφορίες
  UIM.add('txt', 'main', 0, {
    text: "Last: 32g",
    x: 10,
    y: 170,
    color: 0xFFFF, // Άσπρο
    font: "6x8:1"
  });

  // 5. Ειδοποίηση μετά από 2 δευτερόλεπτα
  setTimeout(() => {
    UIM.notify('bar', "INFO", "Data updated!", 3);
  }, 2000);
};

// Εκκίνηση
//startApp();
//TC.on('tc5', UIM.handleTouch);

/*

// 1. Παλιά μορφή (συνεχίζει να λειτουργεί)
UIM.notify('header', "Καλώς ήρθατε", "Η εφαρμογή είναι έτοιμη", 2);

// 2. Νέα μορφή με actions
UIM.notify('bar', "REALY", "delete?", {
  duration: 0, // Μόνιμη ειδοποίηση
  actions: [
    {
      text: "delete",
      bgColor: 7, // Κόκκινο
      actionId: "delete"
    },
    {
      text: "cancel",
      bgColor: 1, // Γκρι
      actionId: "cancel"
    }
  ],
  onAction: (actionId) => {
    if (actionId === "delete") {
      print("delete confirmd");
      // Κώδικας διαγραφής...
    }
    UIM.clearNotifications('bar');
  }
});

// 3. Ειδοποίηση με onTap
UIM.notify('bar', "Ενημέρωση", "Νέα δεδομένα διαθέσιμα", {
  duration: 3,
  onTap: () => {
    print("Ειδοποίηση πατήθηκε");
    ew.face.go('data_view');
  }
});


// 1. Δημιουργία γραφήματος


TC.removeAllListeners("tc5")
TC.on('tc5', UIM.handleTouch);

graphId = UIM.add('graph', 'bar', 0, {
  data: [10, 20, 15, 30, 25, 40],
  color: 4, 
  highlightColor: 7, 
  selectedIndex:2
});

//remome 
UIM.remove(graphId);

// update
UIM.update(graphId, { selectedIndex:5 });


// 2. Επιστροφή τιμής (default: πρώτο στοιχείο)

initialValue = UIM.getGraphValue(graphId);
print(`value: ${initialValue.value}`); // 10

// 3. Επιλογή 3ης στήλης (index 2) και λήψη τιμής

selectedValue = UIM.getGraphValue(graphId, 2); // Highlight και επιστροφή
print(`value: ${selectedValue.value}`); // 15




TC.removeAllListeners("tc5")
	TC.on('tc5', UIM.handleTouch);
  
barSlider = UIM.add('slider', 'bar', 1, {
  min: 0,
  max: 20,
  value: 10,
  mode: 'graph',
  step: 1,         // Βήμα 5
  onChange: (val) => {
    print(`Graph slider: ${val}`);
  }
});

fillSlider = UIM.add('slider', 'bar', 0, {
  min: 0,
  max: 100,
  value: 30,
  mode: 'fill',
  fillColor: 4, // Μπλε
  bgColor: 1,   // Γκρι
  onChange: (val) => {
    print(`New value: ${val}`);
  }
});

TC.removeAllListeners("tc5")
TC.removeAllListeners("bar")

	TC.on('tc5', UIM.handleTouch);
  	TC.on('bar', UIM.handleTouch);

ew.temp.bar=1 
slider = UIM.add('slider', 'bar', 0, {
  min: 1,
  max: 7,
  value: 5,
  mode: 'graph',
  activeColor: 4,    // Μπλε (ενεργές μπάρες)
  inactiveColor: 1,   // Γκρι (ανενεργές)
    onChange: (val) => {
    print(`New value: ${val}`);
  }
});

// Update με βελτιστοποιημένο redraw
UIM.update(slider, { value: 15 });  // Ανανέωση μόνο της νέας μπάρας
UIM.update(slider, { value: 12 });  // Ανανέωση νέας + παλιάς μπάρας


TC.removeAllListeners("tc5");
TC.removeAllListeners("bar");
TC.on('tc5', UIM.handleTouch);

UIM.init();




UIM.add('slider', 'bar', 0, {
  min: 0,
  max:25,
  value: 2,
  step: 1,
  mode: 'fill',
  //padding: 0.1, // 10% κενό γύρω
  padding: { x: 0.15, y: 0.40 },
  TC: "slide", // Ενεργοποίηση slide mode
  activeColor: 4,    // Μπλε (ενεργές μπάρες)
  inactiveColor: 2,   // Γκρι (ανενεργές)
  bgColor:1
});

*/
