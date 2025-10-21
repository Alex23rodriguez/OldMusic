let notes = new Set()
let root = Math.floor(Math.random()*12)

// let modes = [' oct', '', 'm', '7', 'maj7', 'sus2', 'sus4']
let modes = ['', 'm', '7', 'maj7', 'sus2', 'sus4']
let mode = 0;
// let maxModes = modes.length-2;
let maxModes = 2;

let score = -1
let mistakes = 0

let w = window.innerWidth-25
let h = window.innerHeight-25

function setup(){
    createCanvas(w, h);
    newChord();
    WebMidi.enable(function(err){
        if(err){
            console.log('Loading failed!');
            text('Loading failed...', 100, 50)
        }else{
            console.log('Loading Succeeded!');
            text('Loading succeeded!!', 100, 50)
            inputSoftware = WebMidi.inputs[0];
            if(inputSoftware){
                inputSoftware.addListener('noteon', "all", addNote);
                inputSoftware.addListener('noteoff', "all", removeNote);
            }else{
                text("No input detected!! :(", 100, 100)
            }
        }
    })
}

function newChord(){
    // root = noteName(Math.floor(Math.random()*12))
    root = (root + Math.floor(Math.random()*11))%12
    // root = 'C'
    // mode = 5
    mode = Math.floor(Math.random()*maxModes);
    score+=1
    drawScreen();
}

function drawScreen(){
    background(255)
    textSize(128)
    textAlign(CENTER)
    text(noteName(root)+(modes[mode]), w/2, h/2)
    textAlign(LEFT)
    textSize(16)
    let n = Array.from(notes, x=>noteName(x%12));
    text(n, w/2, h*0.75)

    text(`Score: ${score}`, w-100, 50)
    text(`Errors: ${mistakes}`, w-100, 80)
}

function addNote(e){
    notes.add(e.note.number);
    if(isChord2(notes, root, mode)){
        newChord()
    }
    // console.log('on')
    drawScreen()
}

function removeNote(e){
    notes.delete(e.note.number)
    if(isChord2(notes, root, mode)){
        newChord()
    }
    // console.log('off', e.note.name, e.note.number, e.note.octave)
    drawScreen()
}

function isChord2(notes, rt, mod){
    let n = sort(Array.from(notes))
    let chordlen = 3;
    let s = getRelSeparation(n)

    if(n.length != chordlen){
        // console.log('too small')
        return false
    }
    // else if(n.length == chordlen){
    mistakes += 1
    // }

    let min_note = 65
    if(n[0]<min_note || n[n.length-1]>min_note+11){
        // console.log('bad placement')
        return false
    }

    if(String(s) in chords){
        let c = chords[String(s)]
        // console.log(c, mod, rt)
        if(modes[mod] == c[0] && rt == relNoteNum(n[c[1]])){
            mistakes -= 1
            return true
        }
    }
    // console.log('bad root?')
    return false
}

function isChord(notes, rt, mod){
    let n = sort(Array.from(notes))
    let chordlen = 5;
    let s = getRelSeparation(n)

    switch(modes[mod]){
        case ' oct':
            ans = ['0'].includes(String(s))
            chordlen = 2
            break;
        case '':
            ans = ['0,0,4,3', '0,4,3,5', '0,7,5,4'].includes(String(s))
            break;
        case 'm':
            ans = ['0,0,3,4', '0,3,4,5', '0,7,5,3'].includes(String(s))
            break;
        case '7':
            ans = ['0,0,4,3,3', '0,4,3,3,2', '0,7,3,2,4', '0,10,2,4,3'].includes(String(s))
            chordlen = 6;
            break;
        case 'maj7':
            ans = ['0,0,4,3,4', '0,4,3,4,1', '0,7,4,1,4', '0,11,1,4,3'].includes(String(s))
            chordlen = 6;
            break;
        case 'sus2':
            ans = ['0,0,2,5', '0,2,5,5', '0,7,5,2'].includes(String(s))
            break;
        case 'sus4':
            ans = ['0,0,5,2', '0,5,2,5', '0,7,5,5'].includes(String(s))
            break;
    }

    if(rt!=relNoteNum(n[0])){
        if(n.length==chordlen){
            mistakes+=1;
            drawScreen();
        }
        return false;
    }
    
    if(ans){
        return true
    }
    if(n.length==chordlen){
        mistakes+=1
        drawScreen()
    }
    return false
}

function getRelSeparation(arr){
    let sep = []
    for(let i=0;i<arr.length-1;i++){
        sep.push((arr[i+1]-arr[i]+12)%12)
    }
    return sep
}

function noteName(n){
    return ['C','Db','D','Eb','E','F','F#','G','Ab','A','Bb','B'][n%12]
}

function relNoteNum(n){
    // return ['C','Db','D','Eb','E','F','F#','G','Ab','A','Bb','B'].indexOf(noteName(n))
    return n%12;
}