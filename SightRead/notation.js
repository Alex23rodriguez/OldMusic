// Staff layout
const LINE_SPACING = 50;
const LINES_PER_STAFF = 5;
const STAFF_TOP_Y = 150;
const STAFF_HEIGHT = (LINES_PER_STAFF - 1) * LINE_SPACING;
const GAP_BETWEEN_STAVES = 200;
const CLEF_X = 15;

// Clef images
var imgTreble;
var imgBass;

function preload() {
  imgTreble = loadImage("assets/treble.png");
  imgBass = loadImage("assets/bass.png");
}

// Note layout
const NOTE_HEAD_WIDTH = 50;
const NOTE_HEAD_HEIGHT = 42;
const NOTE_HEAD_HALF = NOTE_HEAD_WIDTH / 2;
const STEM_LENGTH = 174;
const LEDGER_LINE_HALF = 40;

// Diatonic (letter) index of each chromatic position within an octave
const CHROMATIC_TO_DIATONIC = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6];

// Semitone offset of each diatonic letter from C
const DIATONIC_TO_SEMITONE = [0, 2, 4, 5, 7, 9, 11];

// Display name for each chromatic index (using # for sharps)
const CHROMATIC_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Sound file name for each chromatic index (using 's' for sharps)
const SOUND_NAMES = ['C', 'Cs', 'D', 'Ds', 'E', 'F', 'Fs', 'G', 'Gs', 'A', 'As', 'B'];

// MIDI reference points: bottom line (n=0) note for each staff
// Treble: bottom line = E4 (MIDI 64)
// Bass: bottom line = G2 (MIDI 43)
const TREBLE_REF_MIDI = 64;
const BASS_REF_MIDI = 43;

// Diatonic absolute position of a MIDI note (letter index + 7 * octave)
function diatonicAbsolute(midi) {
  return CHROMATIC_TO_DIATONIC[midi % 12] + 7 * (Math.floor(midi / 12) - 1);
}

// Convert MIDI to staff-relative diatonic position (n = 0 = bottom line)
function midiToStaffN(midi, staff) {
  var ref = staff === 0 ? TREBLE_REF_MIDI : BASS_REF_MIDI;
  return diatonicAbsolute(midi) - diatonicAbsolute(ref);
}

// Get the diatonic letter index (0=C, 1=D, ..., 6=B) from a MIDI note
function midiToLetterIndex(midi) {
  return CHROMATIC_TO_DIATONIC[midi % 12];
}

// Get the octave number from a MIDI note
function midiToOctave(midi) {
  return Math.floor(midi / 12) - 1;
}

// Note: midi = MIDI key number, staff = 0 (treble) or 1 (bass)
class Note {
  constructor(midi, staff) {
    this.midi = midi;
    this.staff = staff;
    this.n = midiToStaffN(midi, staff);
    this.xx = width;
    this.yy = staffTopY(staff) + ((LINES_PER_STAFF - 1) * 2 - this.n) * (LINE_SPACING / 2);
    this.ans = getAns(midi);
  }
}

function staffTopY(staff) {
  return staff === 0
    ? STAFF_TOP_Y
    : STAFF_TOP_Y + STAFF_HEIGHT + GAP_BETWEEN_STAVES;
}

function drawTrebleStaff() {
  var h = STAFF_HEIGHT * 1.65;
  var w = imgTreble.width / imgTreble.height * h;
  image(imgTreble, CLEF_X, STAFF_TOP_Y - (LINE_SPACING + 2), w, h);
  for (var i = 0; i < LINES_PER_STAFF; i++) {
    line(0, STAFF_TOP_Y + i * LINE_SPACING, width, STAFF_TOP_Y + i * LINE_SPACING);
  }
}

function drawBassClefStaff() {
  var topY = staffTopY(1);
  var h = STAFF_HEIGHT * 0.8;
  var w = imgBass.width / imgBass.height * h;
  image(imgBass, CLEF_X, topY, w, h);
  for (var i = 0; i < LINES_PER_STAFF; i++) {
    line(0, topY + i * LINE_SPACING, width, topY + i * LINE_SPACING);
  }
}

function drawNote(note, is_first) {
  // Draw ledger lines for notes below the staff
  if (note.n < 0) {
    var count = floor(-note.n / 2);
    for (var k = 1; k <= count; k++) {
      var lp = -2 * k;
      var ledgerY = staffTopY(note.staff) + ((LINES_PER_STAFF - 1) * 2 - lp) * (LINE_SPACING / 2);
      line(note.xx - LEDGER_LINE_HALF, ledgerY, note.xx + LEDGER_LINE_HALF, ledgerY);
    }
  }
  // Draw ledger lines for notes above the staff
  if (note.n > 8) {
    var count = floor((note.n - 8) / 2);
    for (var k = 1; k <= count; k++) {
      var lp = 8 + 2 * k;
      var ledgerY = staffTopY(note.staff) + ((LINES_PER_STAFF - 1) * 2 - lp) * (LINE_SPACING / 2);
      line(note.xx - LEDGER_LINE_HALF, ledgerY, note.xx + LEDGER_LINE_HALF, ledgerY);
    }
  }

  // The first note is highlighted; rest are black
  if (is_first) {
    fill(random(255), random(255), random(255));
  } else {
    fill(0);
  }

  strokeWeight(4);

  // Draw note stems: up for notes below middle of staff, down for above
  if (note.n < 4) {
    line(note.xx + NOTE_HEAD_HALF, note.yy, note.xx + NOTE_HEAD_HALF, note.yy - STEM_LENGTH);
  } else {
    line(note.xx - NOTE_HEAD_HALF, note.yy, note.xx - NOTE_HEAD_HALF, note.yy + STEM_LENGTH);
  }
  // Draw the note head as an ellipse
  ellipse(note.xx, note.yy, NOTE_HEAD_WIDTH, NOTE_HEAD_HEIGHT);

  strokeWeight(2);
}

// Map a MIDI note to the keyCode of the correct keyboard letter
// KeyCodes: A=65, B=66, C=67, D=68, E=69, F=70, G=71
function getAns(midi) {
  return [67, 68, 69, 70, 71, 65, 66][midiToLetterIndex(midi)];
}

// Convert a keyCode to the solfege label displayed on screen
function ansToNote(n) {
  return ["La", "Si", "Do", "Re", "Mi", "Fa", "Sol"][n - 65];
}

// Convert a MIDI note to a chromatic pitch name string like "C4", "C#4", "Bb4"
function getNoteName(midi) {
  var octave = midiToOctave(midi);
  return CHROMATIC_NAMES[midi % 12] + octave;
}

// Get the sound file name for a MIDI note (uses 's' for sharps: "Cs4", "Fs3")
function getSoundName(midi) {
  var octave = midiToOctave(midi);
  return SOUND_NAMES[midi % 12] + octave;
}

// Map a note name, octave, staff, and key signature to (MIDI, staff-relative n, accidental)
// note: "C", "C#", "Db", "D", ..., "B"
// octave: scientific pitch notation (C4 = middle C)
// staff: 0 = treble, 1 = bass
// key: number of sharps (positive) or flats (negative), 0 = C major
// Returns: {midi: MIDI key number, n: staff-relative position, acc: "" | "sharp" | "flat" | "natural"}
function noteToN(note, octave, staff, key) {
  var letterMap = { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 };
  var sharpOrder = [3, 0, 4, 1, 5, 2, 6]; // F, C, G, D, A, E, B
  var flatOrder = [6, 2, 5, 1, 4, 0, 3];  // B, E, A, D, G, C, F

  var letter = note[0];
  var acc = note.length > 1 ? note.slice(1) : "";
  var li = letterMap[letter];

  // Compute MIDI from letter, octave, and accidental
  var accidentalOffset = acc === "#" ? 1 : acc === "b" ? -1 : 0;
  var midi = (octave + 1) * 12 + DIATONIC_TO_SEMITONE[li] + accidentalOffset;

  // Compute staff-relative n from the natural letter position
  var n;
  if (staff === 0) {
    // Treble: bottom line (n=0) = E4
    n = (octave - 4) * 7 + (li - 2);
  } else {
    // Bass: bottom line (n=0) = G2
    n = (octave - 2) * 7 + (li - 4);
  }

  // Determine if the accidental is implied by the key signature
  var resultAcc = "";
  if (key > 0) {
    var sig = sharpOrder.slice(0, key);
    if (acc === "#") {
      if (!sig.includes(li)) resultAcc = "sharp";
    } else if (acc === "b") {
      resultAcc = "flat";
    } else if (sig.includes(li)) {
      resultAcc = "natural";
    }
  } else if (key < 0) {
    var sig = flatOrder.slice(0, -key);
    if (acc === "b") {
      if (!sig.includes(li)) resultAcc = "flat";
    } else if (acc === "#") {
      resultAcc = "sharp";
    } else if (sig.includes(li)) {
      resultAcc = "natural";
    }
  } else {
    if (acc === "#") resultAcc = "sharp";
    else if (acc === "b") resultAcc = "flat";
  }

  return { midi: midi, n: n, acc: resultAcc };
}
