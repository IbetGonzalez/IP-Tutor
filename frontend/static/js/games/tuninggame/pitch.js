export default class Pitch {
    synth;
    note;
    playing = false;
    btn;
    detune = 0;

    constructor (elem, hold=true, hz=440) {
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
                this.StopPitch();
            };
            this.btn.ontouchend = () => {
                this.StopPitch();
            };
        } else {
            this.btn.onclick = () => {
                this.TogglePitch();
            };
        }
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

