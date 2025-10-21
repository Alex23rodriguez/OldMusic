var s1;
var s2;

var ans = '';
var notes = [];
var next = 190;
var score = 0;
var streak = 0;
var best = 0;

var sounds = [];
var imgs = [];

function preload() {
  /*var cMajor = [
    16,
    18,
    20,
    21,
    23,
    25,
    27,
    28,
    30,
    32,
    33,
    35,
    37,
    39,
    40,
    42,
    44,
    45,
    47,
    49,
    51,
    52,
    54,
    56,
    57,
    59,
    61,
    63,
    64
  ];
  
  //print(cMajor.length);
  soundFormats('wav');
  for (var i = 0; i < 29; i++) {
    sounds[i] = loadSound('http://127.0.0.1:8887/' + str(cMajor[28 - i]));
  }
  */
  //imgs[0] = loadImage('http://127.0.0.1:8887/treble.png');
  //imgs[1] = loadImage('http://127.0.0.1:8887/bass.png');
  //imgs[0] = createImg('http://127.0.0.1:8887/treble.png');
  //imgs[1] = createImg('http://127.0.0.1:8887/bass.png');
}

function setup() {
  s1 = createSlider(50, 500, 200, 5);
  s2 = createSlider(0.5, 3, 1, 0.1);

  s1.position(650, 10);
  s2.position(900, 10);

  createCanvas(windowWidth, windowHeight);
}

function draw() {
  text('Tempo', 150, 10);

  var tempo = s1.value();
  var speed = s2.value();

  strokeWeight(2);
  background(255);

  textSize(16);
  text('Tempo', 580, 23);
  text('Speed', 830, 23);
  text(ans, 70, 700);

  //image(imgs[0], -100, 79, 360, 360);
  //image(imgs[1], 10, 450, 142, 160);

  for (var i = 0; i < 5; i++) {
    line(0, 150 + i * 50, width, 150 + i * 50);
  }

  for (var i = 6; i < 11; i++) {
    line(0, 150 + i * 50, width, 150 + i * 50);
  }

  line(160, 150, 160, 650);

  if (notes.length > 0 && notes[0].xx <= 160) {
    //print(notes[0].ans)
    ans = ansToNote(notes[0].ans);
    notes = notes.slice(1);
    if (best < streak) {
      best = streak;
    }
    streak = 0;
  }

  for (var i = 0; i < notes.length; i++) {
    if (
      notes[i].n == 14 ||
      notes[i].n == 2 ||
      notes[i].n == 26 ||
      notes[i].n == 0 ||
      notes[i].n == 28
    ) {
      //lines for notes outside of grid
      line(notes[i].xx - 40, notes[i].n * 25 + 50, notes[i].xx + 40, notes[i].n * 25 + 50);
    }
    if (notes[i].n == 0 || notes[i].n == 1) {
      line(notes[i].xx - 40, 100, notes[i].xx + 40, 100);
    }
    if (notes[i].n == 28 || notes[i].n == 27) {
      line(notes[i].xx - 40, 26 * 25 + 50, notes[i].xx + 40, 26 * 25 + 50);
    }

    if (i == 0) {
      fill(random(255), random(255), random(255));
    } else {
      fill(0);
    }

    strokeWeight(4);

    if ((notes[i].n <= 14 && notes[i].n >= 9) || notes[i].n >= 20) {
      line(notes[i].xx + 25, notes[i].yy, notes[i].xx + 25, notes[i].yy - 174);
    } else {
      line(notes[i].xx - 25, notes[i].yy, notes[i].xx - 25, notes[i].yy + 174);
    }
    ellipse(notes[i].xx, notes[i].yy, 50, 42);

    strokeWeight(2);

    notes[i].xx -= speed;
  }

  next++;
  if (next >= tempo) {
    next = 0;
    notes.push(new note(floor(random(29))));
  }
  fill(0);
  textSize(30);

  text('Score:', 10, 25);
  text(score, 110, 25);
  text('Streak:', 200, 25);
  text(streak, 300, 25);
  text('Best:', 390, 25);
  text(best, 490, 25);
}

function keyPressed() {
  if (keyCode == 32) {
    notes.push(new note(floor(random(29))));
  } else if (keyCode == notes[0].ans) {
    ans = '';

    //sounds[notes[0].n].play();

    //print(notes[0].n);

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

function note(n) {
  this.n = n;
  this.xx = width;
  this.yy = 50 + n * 25;

  this.ans = getAns(n);
}

function getAns(n) {
  return [67, 66, 65, 71, 70, 69, 68][n % 7]; // c, b, a, g, f, e, d
}

function ansToNote(n) {
  return ['La', 'Si', 'Do', 'Re', 'Mi', 'Fa', 'Sol'][n - 65];
}
