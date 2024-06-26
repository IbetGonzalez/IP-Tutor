export default class Pitch {
    synth;
    note;
    playing = false;
    btn;
    detune = 0;
    threshold = [-3,3];

    constructor (elem, hold=true, hz=440, callback=function(){}) {
        this.frequency = hz;
        this.btn = elem;

        this.InitPitch();
        if (hold) {
            this.btn.onpointerdown = () => {
                this.PlayPitch();
            };
            this.btn.ontouchstart = () => {
                this.PlayPitch();
            };

            this.btn.onpointerup = () => {
                callback(this.btn)
                this.StopPitch();
            };
            this.btn.ontouchend = () => {
                callback(this.btn)
                this.StopPitch();
            };
        } else {
            this.btn.onclick = () => {
                callback(this.btn)
                this.TogglePitch();
            };
        }
    }

    SetThreshold (range) {
        this.threshold = [range * -1, range]
    }
    InTune() {
        return this.detune > this.threshold[0] && this.detune < this.threshold[1];
    }

    SetDetune(cents) {
        this.detune = cents;

        this.synth.detune.value = this.detune;
    }

    Detune(cents) {
        this.detune += cents;

        this.synth.detune.value = this.detune;
    }

    TogglePitch() {
        if (this.playing) {
            this.StopPitch();
        } else {
            this.PlayPitch();
        }
    }

    SetNote(note) {
        this.note = note;
    }

    PlayPitch(note=this.note) {
        console.log(note);
        console.log("playing");
        this.synth.triggerAttack(note);
        this.playing = true;
    }

    StopPitch(){
        console.log("stopping");
        this.synth.triggerRelease();
        this.playing = false;
    }
    
    InitPitch() {
        this.synth = new Tone.Synth().toDestination();
    }
}

