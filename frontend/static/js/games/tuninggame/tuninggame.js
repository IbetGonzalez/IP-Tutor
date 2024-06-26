import Pitch from './pitch.js'

const refPitchBtn = document.getElementById("ref-pitch");
const tunePitchBtn = document.getElementById("tune-pitch");

const tuneupBtn = document.getElementById("tune-up");
const tunedownBtn = document.getElementById("tune-down");
const tuneSlide = document.getElementById("tune-slider");
const checkPitchBtn = document.getElementById("check");

const refPitch = new Pitch(refPitchBtn, false, undefined, fillBtn);
const tunePitch = new Pitch(tunePitchBtn);


var startingDetune;

InitGame();

function InitGame() {
    AddListeners();

    refPitch.StopPitch();
    tunePitch.StopPitch();
    tuneSlide.valueAsNumber = 0;
    refPitchBtn.classList.remove("fill");

    let randFreq = Math.floor(Math.random() * 900) + 100;
    let note = Tone.Frequency(randFreq).toNote();
    let randTune = Math.floor(Math.random() * 100) - 50;

    refPitch.SetNote(note);
    tunePitch.SetNote(note);
    tunePitch.SetDetune(randTune);
    startingDetune = randTune;
}
function fillBtn(btn) {
    btn.classList.toggle("fill");
}

function AddListeners() {
    tuneSlide.oninput = () => {
        let slideValue = tuneSlide.valueAsNumber;

        tunePitch.SetDetune(startingDetune + (slideValue * 5))
    } 

    tuneupBtn.onclick = () => {
        // TODO:  MAKE MAX
        ChangePitch(1);
    }
    tunedownBtn.onclick = () => {
        // TODO:  MAKE MIN 
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
