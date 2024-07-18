import Pitch from './pitch.js';
import * as Tone from 'tone';

const refPitchBtn = document.getElementById("ref-pitch");
const tunePitchBtn = document.getElementById("tune-pitch");

const tuneupBtn = document.getElementById("tune-up");
const tunedownBtn = document.getElementById("tune-down");

const refPitch = new Pitch(refPitchBtn, false);
const tunePitch = new Pitch(tunePitchBtn);


tuneupBtn.onclick = () => {
    tunePitch.Detune(5);
    CheckPitch();
}
tunedownBtn.onclick = () => {
    tunePitch.Detune(-5);
    CheckPitch();
}

function CheckPitch() {
    if (tunePitch.detune > -3 && tunePitch.detune < 3) {
        alert("Correct");
        InitGame();
    }
}
InitGame();

function InitGame() {
    refPitch.StopPitch();
    tunePitch.StopPitch();

    let randFreq = Math.floor(Math.random() * 1000);
    let note = Tone.Frequency(randFreq).toNote();
    let randTune = Math.floor(Math.random() * 100) - 50;

    refPitch.SetNote(note);
    tunePitch.SetNote(note);
    tunePitch.Detune(randTune);
}

