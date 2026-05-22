// MIDI range constants (per staff)
const TREBLE_MIDI_MIN = 57; // A3
const TREBLE_MIDI_MAX = 84; // C6
const BASS_MIDI_MIN = 36;  // C2
const BASS_MIDI_MAX = 64;  // E4

// Sliders
var s1;
var s2;

// Game state
var ans = "";
var notes = [];
var next = 190;
var score = 0;
var streak = 0;
var best = 0;

var soundCache = {};
var imgs = [];

// UI constants
const ANSWER_BAR_X = 160;
const KEY_SPACE = 32;

// Lazy-load and play a piano sample for a given MIDI note
function playPianoNote(midi) {
  var name = getSoundName(midi);
  if (!soundCache[name]) {
    soundCache[name] = loadSound('assets/piano/' + name + '.mp3', function() {
      soundCache[name].play();
    });
  } else {
    soundCache[name].play();
  }
}

function setup() {
  s1 = createSlider(50, 500, 200, 5);
  s2 = createSlider(0.5, 3, 1, 0.1);

  s1.position(650, 10);
  s2.position(900, 10);

  createCanvas(windowWidth, windowHeight);
}

function randomMidiInStaff(staff) {
  var min = staff === 0 ? TREBLE_MIDI_MIN : BASS_MIDI_MIN;
  var max = staff === 0 ? TREBLE_MIDI_MAX : BASS_MIDI_MAX;
  return floor(random(min, max + 1));
}

function draw() {
  text("Tempo", 150, 10);

  var tempo = s1.value();
  var speed = s2.value();

  strokeWeight(2);
  background(255);

  textSize(16);
  text("Tempo", 580, 23);
  text("Speed", 830, 23);
  text(ans, 70, 700);

  drawTrebleStaff();
  drawBassClefStaff();
  line(ANSWER_BAR_X, STAFF_TOP_Y, ANSWER_BAR_X, staffTopY(1) + (LINES_PER_STAFF - 1) * LINE_SPACING);

  if (notes.length > 0 && notes[0].xx <= ANSWER_BAR_X) {
    ans = ansToNote(notes[0].ans);
    notes = notes.slice(1);
    if (best < streak) {
      best = streak;
    }
    streak = 0;
  }

  for (var i = 0; i < notes.length; i++) {
    drawNote(notes[i], i == 0);
    notes[i].xx -= speed;
  }

  next++;
  if (next >= tempo) {
    next = 0;
    var staff = floor(random(2));
    notes.push(new Note(randomMidiInStaff(staff), staff));
  }
  fill(0);
  textSize(30);

  text("Score:", 10, 25);
  text(score, 110, 25);
  text("Streak:", 200, 25);
  text(streak, 300, 25);
  text("Best:", 390, 25);
  text(best, 490, 25);
}

function keyPressed() {
  if (keyCode == KEY_SPACE) {
    var staff = floor(random(2));
    notes.push(new Note(randomMidiInStaff(staff), staff));
  } else if (notes.length > 0 && keyCode == notes[0].ans) {
    ans = "";
    playPianoNote(notes[0].midi);

    notes = notes.slice(1);
    score++;
    streak++;
  } else {
    if (best < streak) {
      best = streak;
    }
    streak = 0;
  }
}
