// Staff layout
const LINE_SPACING = 50;
const LINES_PER_STAFF = 5;
const STAFF_TOP_Y = 150;
const STAFF_HEIGHT = (LINES_PER_STAFF - 1) * LINE_SPACING;
const GAP_BETWEEN_STAVES = 200;

// Note layout
const NOTE_SPACING = LINE_SPACING / 2;
const NOTE_MIN = -4;
const NOTE_MAX = 12;
const NOTE_RANGE = NOTE_MAX - NOTE_MIN + 1;
const TREBLE_BASE_INDEX = 12;
const BASS_BASE_INDEX = 24;
const NOTE_HEAD_WIDTH = 50;
const NOTE_HEAD_HEIGHT = 42;
const NOTE_HEAD_HALF = NOTE_HEAD_WIDTH / 2;
const STEM_LENGTH = 174;
const LEDGER_LINE_HALF = 40;

// Note: n = position within staff (0 = bottom line), staff = 0 (treble) or 1 (bass)
class Note {
  constructor(n, staff) {
    this.n = n;
    this.staff = staff;
    this.xx = width;
    this.yy = staffTopY(staff) + ((LINES_PER_STAFF - 1) * 2 - n) * NOTE_SPACING;

    var baseIndex = staff === 0 ? TREBLE_BASE_INDEX : BASS_BASE_INDEX;
    this.ans = getAns(baseIndex - n);
  }
}

function staffTopY(staff) {
  return staff === 0
    ? STAFF_TOP_Y
    : STAFF_TOP_Y + STAFF_HEIGHT + GAP_BETWEEN_STAVES;
}

function drawTrebleStaff() {
  for (var i = 0; i < LINES_PER_STAFF; i++) {
    line(0, STAFF_TOP_Y + i * LINE_SPACING, width, STAFF_TOP_Y + i * LINE_SPACING);
  }
}

function drawBassClefStaff() {
  var topY = staffTopY(1);
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
      var ledgerY = staffTopY(note.staff) + ((LINES_PER_STAFF - 1) * 2 - lp) * NOTE_SPACING;
      line(note.xx - LEDGER_LINE_HALF, ledgerY, note.xx + LEDGER_LINE_HALF, ledgerY);
    }
  }
  // Draw ledger lines for notes above the staff
  if (note.n > 8) {
    var count = floor((note.n - 8) / 2);
    for (var k = 1; k <= count; k++) {
      var lp = 8 + 2 * k;
      var ledgerY = staffTopY(note.staff) + ((LINES_PER_STAFF - 1) * 2 - lp) * NOTE_SPACING;
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

// Map a note index to the keyCode of the correct keyboard letter
function getAns(n) {
  return [67, 66, 65, 71, 70, 69, 68][n % 7];
}

// Convert a keyCode to the solfege label displayed on screen
function ansToNote(n) {
  return ["La", "Si", "Do", "Re", "Mi", "Fa", "Sol"][n - 65];
}

// Map a note name, octave, staff, and key signature to (staff-relative n, accidental)
// note: "C", "C#", "Db", "D", ..., "B"
// octave: scientific pitch notation (C4 = middle C)
// staff: 0 = treble, 1 = bass
// key: number of sharps (positive) or flats (negative), 0 = C major
// Returns: {n: staff-relative position, acc: "" | "sharp" | "flat" | "natural"}
function noteToN(note, octave, staff, key) {
  var letterMap = {C:0, D:1, E:2, F:3, G:4, A:5, B:6};
  var sharpOrder = [3, 0, 4, 1, 5, 2, 6]; // F, C, G, D, A, E, B
  var flatOrder = [6, 2, 5, 1, 4, 0, 3];  // B, E, A, D, G, C, F

  var letter = note[0];
  var acc = note.length > 1 ? note.slice(1) : "";
  var li = letterMap[letter];

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

  return {n: n, acc: resultAcc};
}
