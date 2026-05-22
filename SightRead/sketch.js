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

var sounds = [];
var imgs = [];

// UI constants
const ANSWER_BAR_X = 160;
const KEY_SPACE = 32;

function setup() {
  s1 = createSlider(50, 500, 200, 5);
  s2 = createSlider(0.5, 3, 1, 0.1);

  s1.position(650, 10);
  s2.position(900, 10);

  createCanvas(windowWidth, windowHeight);
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
    notes.push(new Note(floor(random(NOTE_RANGE)) + NOTE_MIN, floor(random(2))));
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
    notes.push(new Note(floor(random(NOTE_RANGE)) + NOTE_MIN, floor(random(2))));
  } else if (notes.length > 0 && keyCode == notes[0].ans) {
    ans = "";

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
