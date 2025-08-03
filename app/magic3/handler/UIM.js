// ================== CORE UI MANAGER ==================
global.UIM = (() => {
  // Προ-ορισμένα Layouts
  const LAYOUTS = {
    header: { x:0, y:0, w:240, h:40, type:'row', slots:2 },
    main:   { x:0, y:40, w:240, h:160 },
    bar:    { x:0, y:200, w:240, h:80, type:'row', slots:3 },
    full:   { x:0, y:0, w:240, h:280 }
  };

  // Cache
  const components = [];
  const notifications = [];
  let theme = {
    primary: 0x31AD,    // Μπλε
    secondary: 0x07E0,  // Πράσινο
    accent: 0xF800,     // Κόκκινο
    text: 0xFFFF,       // Άσπρο
    bg: 0x0000,         // Μαύρο
    notify: 0x001F      // Σκούρο μπλε
  };

  // ================ PRIVATE ΣΥΝΑΡΤΗΣΕΙΣ ================
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
    g.setColor(b.bgColor || theme.primary)
     .fillRect(b.x, b.y, b.x + b.w, b.y + b.h)
     .setColor(b.textColor || theme.text)
     .setFont(b.font || "6x8:2")
     .setFontAlign(0, 0) // Διορθωμένο εδώ
     .drawString(b.text, b.x + b.w/2, b.y + b.h/2)
     .setFontAlign(-1, -1);
  };

  const drawTxt = t => {
    g.setColor(t.color || theme.text)
     .setFont(t.font || "6x8")
     .setFontAlign(-1, -1) // Διορθωμένο εδώ
     .drawString(t.text, t.x, t.y);
  };

  const drawGraph = gr => {
    // Συγχρονη λύση για Math.max
    let max = 0;
    for (let i = 0; i < gr.data.length; i++) {
      if (gr.data[i] > max) max = gr.data[i];
    }
    
    if (max <= 0) return;
    
    const step = gr.w / gr.data.length;
    const col = gr.color || theme.secondary;
    const h = gr.h;
    const yBase = gr.y + h;
    
    for (let i = 0; i < gr.data.length; i++) {
      const barH = (gr.data[i] / max) * h;
      g.setColor(col)
       .fillRect(
         gr.x + i * step + 1,
         yBase - barH,
         gr.x + (i + 1) * step - 1,
         yBase
       );
    }
  };

  const drawNotify = n => {
    console.log("draw notify n:",n),
    g.setColor(theme.notify)
     .fillRect(n.x, n.y, n.x + n.w, n.y + n.h)
     .setColor(theme.text)
     .setFont("6x8:2")
     .setFontAlign(-1, -1) // Διορθωμένο εδώ
     .drawString(n.title, n.x + 5, n.y + 5)
     .drawString(n.message, n.x + 5, n.y + 25);
  };

  const isInside = (c, x, y) => {
    return x >= c.x && x <= (c.x + c.w) && 
           y >= c.y && y <= (c.y + c.h);
  };

  const drawComponent = c => {
    if (!c || !c._dirty) return;
    
    switch(c.type) {
      case 'btn': drawBtn(c); break;
      case 'txt': drawTxt(c); break;
      case 'graph': drawGraph(c); break;
      case 'notify': drawNotify(c); break;
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
  };

  // ================ PUBLIC API ================
  return {
    //tets
    getLayout: getLayout,
    components: components,
    notifications:notifications,
    //
    
    init: customTheme => {
      if (customTheme) {
        for (const key in customTheme) {
          theme[key] = customTheme[key];
        }
      }
      g.clear();
      g.flip();
    },

    add: (type, region, slot, opts) => {
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
    },

    remove: removeComponent,

    notify: (region, title, message, duration = 3) => {
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
        original
      });
      
      notifications.push(notifId);
      
      // Ορισμός timeout
      setTimeout(() => {
        clearNotification(notifId);
      }, duration * 1000);
      
      return notifId;
    },

    handleTouch: (x, y) => {
      // Έλεγχος ειδοποιήσεων πρώτα
      for (let i = notifications.length - 1; i >= 0; i--) {
        const id = notifications[i];
        const c = components[id];
        if (c && isInside(c, x, y)) {
          if (c.onTap) c.onTap();
          clearNotification(id);
          return true;
        }
      }
      
      // Έλεγχος κανονικών components
      for (let i = components.length - 1; i >= 0; i--) {
        const c = components[i];
        if (c && c.onTap && isInside(c, x, y)) {
          c.onTap();
          return true;
        }
      }
      
      return false;
    }
  };
})();

// ================== ΠΑΡΑΔΕΙΓΜΑ ΧΡΗΣΗΣ ==================
const startApp = () => {
  // 1. Αρχικοποίηση
  UIM.init({ 
    primary: 0xF800,  // Κόκκινο
    bg: 0x0000        // Μαύρο
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
  const graph = UIM.add('graph', 'main', 0, {
    data: [10, 20, 15, 30, 25, 40],
    color: 0x07E0  // Πράσινο
  });
  
  // 4. Πληροφορίες
  UIM.add('txt', 'main', 0, {
    text: "Last: 32g",
    x: 10, y: 170,
    color: 0xFFFF,  // Άσπρο
    font: "6x8:1"
  });
  
  // 5. Ειδοποίηση μετά από 2 δευτερόλεπτα
  setTimeout(() => {
    UIM.notify('bar', "INFO", "Data updated!", 3);
  }, 2000);
};

// Εκκίνηση
//startApp();
