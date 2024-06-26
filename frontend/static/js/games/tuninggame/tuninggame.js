import Pitch from './pitch.js'

const refPitchBtn = document.getElementById("ref-pitch");
const tunePitchBtn = document.getElementById("tune-pitch");

const tuneupBtn = document.getElementById("tune-up");
const tunedownBtn = document.getElementById("tune-down");
const tuneSlide = document.getElementById("tune-slider");
const checkPitchBtn = document.getElementById("check");

const refPitch = new Pitch(refPitchBtn, false);
const tunePitch = new Pitch(tunePitchBtn);

var startingDetune;

InitGame();

function InitGame() {
    AddListeners();

    refPitch.StopPitch();
    tunePitch.StopPitch();
    tuneSlide.valueAsNumber = 0;

    let randFreq = Math.floor(Math.random() * 1000);
    let note = Tone.Frequency(randFreq).toNote();
    let randTune = Math.floor(Math.random() * 100) - 50;

    refPitch.SetNote(note);
    tunePitch.SetNote(note);
    tunePitch.SetDetune(randTune);
    startingDetune = randTune;
}

function AddListeners() {
    tuneSlide.oninput = () => {
        let slideValue = tuneSlide.valueAsNumber;

        tunePitch.SetDetune(startingDetune + (slideValue * 5))
    } 

    tuneupBtn.onclick = () => {
        ChangePitch(1);
    }
    tunedownBtn.onclick = () => {
        ChangePitch(-1);
    }
    checkPitchBtn.onclick = () => {
        CheckPitch();
    }

}
function ChangePitch(num) {
    tunePitch.Detune(num * 5);
    tuneSlide.valueAsNumber += num; 
}

function CheckPitch() {
    if (tunePitch.InTune()) {
        alert("Correct");
        InitGame();
    }
}
