import Pitch from './pitch.js'

const refPitchBtn = document.getElementById("ref-pitch");
const tunePitchBtn = document.getElementById("tune-pitch");

const tuneupBtn = document.getElementById("tune-up");
const tunedownBtn = document.getElementById("tune-down");
const tuneSlide = document.getElementById("tune-slider");
const checkPitchBtn = document.getElementById("check");
const indicatorP = document.getElementById("cents-changed");

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
    indicatorP.innerText = tuneSlide.valueAsNumber * 5;

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
    const MAX = Number(tuneSlide.max);
    const MIN = Number(tuneSlide.min);

    tuneSlide.oninput = () => {
        let slideValue = tuneSlide.valueAsNumber;
        tunePitch.SetDetune(startingDetune + (slideValue * 5))
        indicatorP.innerText = slideValue * 5;
    } 

    tuneupBtn.onclick = () => {
        let slideValue = tuneSlide.valueAsNumber;
        if (slideValue < MAX) {
            ChangePitch(1);
        }
    }
    tunedownBtn.onclick = () => {
        let slideValue = tuneSlide.valueAsNumber;
        if (slideValue > MIN) {
            ChangePitch(-1);
        }
    }
    checkPitchBtn.onclick = () => {
        CheckPitch();
    }

}
function ChangePitch(num) {
    tunePitch.Detune(num * 5);
    tuneSlide.valueAsNumber += num; 
    indicatorP.innerText = tunePitch.detune - startingDetune;
}

function CheckPitch() {
    if (tunePitch.InTune()) {
        alert("Correct");
        InitGame();
    }
}
