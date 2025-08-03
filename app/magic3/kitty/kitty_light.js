
//***********************************
var kittImages = [
  require("heatshrink").decompress(atob("kEQggSPhnMABnAB6vT///ngPK4gOBAANMB5PfB4f9B5M/B4fzB5IODAAIPZF55PPN5/M4YOBnqvbB5LvPA==")), // kitt1
  require("heatshrink").decompress(atob("kEQggEBrnMABFVqAOMAAPFgEFBxYABqAeF4n/+dMBAnAB4s//4QBGAoPE4YOBAAM8GpPPB4f8B9I/PL55/BCAJ/F4sMT5vFV57PPaANVBxg=")), // kitt2
require("heatshrink").decompress(atob("kEQggVSgvMAA3FBwlcBw4ACqAPCBxXM4APG5s//89B4w9E7//AAPcIIsMB4YeBAAP8BAYPGBwQPQngPKH44PCJ4hfHSIZ/TB5avPZ54ANA==")), // kitt3
require("heatshrink").decompress(atob("kEQgglirnMAA3FBwgNHAAYPSgoHD5v///cA4dQB4MMA4ffB4P9A4fAB4wOBAAIPbF5RPPP76vQADoA==")), // kitt4
require("heatshrink").decompress(atob("kEQgg1yrnMAA3FBwkMBw4AB4AeH5s/+YgIBAfD///ngHDB4/PB4P8B5YfP5g/B7gPHNxBPGN56PPAFo=")), // kitt5
require("heatshrink").decompress(atob("kEQgg2zgvMAAlQB44OFAAIeNEBEMBQU//88AgPAB5P///8B5gfPAAgPGJ55vPR6AArA=")), // kitt6
  require("heatshrink").decompress(atob("kEQghC/AA3M5lQBxcMB4PFDxogMDwQAB4APZgoPDH5dcDxhQEWP4AGA=")), // kitt7
  require("heatshrink").decompress(atob("j0LghC/AH4Ak"))  // kitt8
]
var currentPos = 0, direction = 1, positions = [0,0,0,0,0,0,0,0];
var speed = 100, lastDirection = 1;

function updatePositions() {
  for (var i=0; i<8; i++) if (positions[i] > 0) positions[i]--;
  positions[currentPos] = 8;
  currentPos += direction;
  if (currentPos >= 7) direction = -1;
  if (currentPos <= 0) direction = 1;
  if (direction != lastDirection && (currentPos === 2 || currentPos === 5 )) {
      ew.sys.buzz.nav([100,200,100]);
      //buzzer.nav([100,200,100]);
      lastDirection = direction;
  }
}

function drawAnimation() {
g.setCol(0,0);
g.fillRect(1,0,240,40);
  for (var i=0; i<8; i++) {
    if (positions[i] > 0) g.drawImage(kittImages[8-positions[i]], (40+(i*20)), 20, { scale: 0.65 });
    //if (positions[i] > 0) g.drawImage(kittImages[8-positions[i]], 25+(i*15), 20);

  }
  g.flip();
}

function animate() {
  updatePositions();
  drawAnimation();
  setTimeout(animate, speed);
}
animate(); // Start!



var kittImages = [
  require("heatshrink").decompress(atob("j0LgnMAEXN7vdBxfdmfd7gWEDgvTn80Bxcz+czBwg6G6czBxfMBwM9BxZYBLJhoBDhYAJA==")), // kitt1
  require("heatshrink").decompress(atob("kUNgnMAH4AJ7vd7gQNocz7oQNmfznoQPEJ3TmZDO5ogOAFg=")), // kitt2
  require("heatshrink").decompress(atob("j0LgnMAGPN7vcBxfdmfdBxfTmc9BzQ7OHgJxkA==")), // kitt3
  require("heatshrink").decompress(atob("j0LgnMAFlcAond7gMK5nN7vdBxkznoOM6YdHCAgsBHZhXNADAA==")), // kitt4
  require("heatshrink").decompress(atob("j0LggRO4tVAAYHBAwlVrnFrnMAAIKEAwIaBBwIGCBwgWCBxYdOBQQOEEoQdGA4IOMHaYdYHYQA==")), // kitt5
  require("heatshrink").decompress(atob("j0LggRO4tVqtQBQwJBqsFBwQACBgUFBAnFAwgbFE4IdBBxwjEH4QOMAAxKIGYg7ONBQ7LDo9VA==")), // kitt6
  require("heatshrink").decompress(atob("j0LggROqAO/B34AFqoON")), // kitt7
  require("heatshrink").decompress(atob("j0LghC/AH4Ak"))  // kitt8
];
var currentPos = 0, direction = 1;
var positions = [0,0,0,0,0,0,0,0];
var speed = 150;

function updatePositions() {
  // Μείωση όλων των θέσεων
  for (var i=0; i<8; i++) if (positions[i] > 0) positions[i]--;
  
  // Ενημέρωση τρέχουσας θέσης
  positions[currentPos] = 8;
  
  // Κίνηση
  currentPos += direction;
  
  // Έλεγχος άκρων με συμμετρική λογική
  if (currentPos >= 7) {
    direction = -1;
    currentPos = 7; // Φροντίζουμε να μην ξεπεράσει το όριο
  }
  if (currentPos <= 0) {
    direction = 1;
    currentPos = 0; // Φροντίζουμε να μην ξεπεράσει το όριο
  }
}

function drawAnimation() {
  for (var i=0; i<8; i++) {
    if (positions[i] > 0) {
      g.drawImage(kittImages[8-positions[i]], i*30, 0, { scale: 0.8 });
    }
  }
  g.flip();
}

function animate() {
  updatePositions();
  drawAnimation();
  setTimeout(animate, speed);
}

animate();



//*********
img=require("heatshrink").decompress(atob("j0QggEBqtVgoCBAAQJCqEAgvMAAYODA4fArgOE4lEolMBAgAX7oJI7gED5oPHBogPCA4vNFxo0IBAokGA4M9KZndCwwPFEg4AbWYoAH4rWBBpXAgAA=="));
g.drawImage(img,50,50);
g.flip();



g.setCol(0,13)
g.fillRect(30,30,100,100)
g.flip();
