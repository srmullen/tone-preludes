import Tone from "tone";
import paper from "paper";
import dat from "./dat.gui.min";

const {MembraneSynth, MetalSynth, NoiseSynth, Event, Loop, Transport} = Tone;

const kickParams = {
    pitchDecay: 0.05,
    octaves: 10,
    oscillator: {
        type: "sine"
    },
    envelope: {
        attack: 0.001,
        decay: 0.4,
        sustain: 0.01,
        release: 1.4,
        attackCurve: "exponential"
    }
};

const snareParams = {
    noise: {
        type: "white"
    },
    envelope: {
        attack: 0.005,
        decay: 0.1,
        sustain: 0,
        release: 0
    }
}

const kick = new MembraneSynth(kickParams).toMaster();
const snare = new NoiseSynth(snareParams).toMaster();
const metalsynth = new MetalSynth().toMaster();

const kickEvent = new Event((time, pitch) => {
    kick.triggerAttackRelease(pitch, "8n", time);
}, "c2");
window.kickEvent = kickEvent;
const kickLoop = new Loop(time => {
    kick.triggerAttackRelease("c2", "8n", time);
}, "4n");
window.kickLoop = kickLoop;
Transport.start();

createDatGUI();
createSnareGUI();

function createDatGUI () {
    const params = {
        bpm: Transport.bpm.value,
        swing: 0,
        swingSubdivision: "8n",
        timeSignature: 4,
        loopStart: 0,
        loopEnd: "4m",
        PPQ: 120 // shouldn't be adjusted after creating other objects
    };
    const gui = new dat.GUI();
    const tempoController = gui.add(params, "bpm", 20, 240);
    tempoController.onChange(v => {
        Transport.bpm.value = v;
    });

    const kickFolder = gui.addFolder("Kick");
    const pitchDecay = kickFolder.add(kickParams, "pitchDecay", 0, 1);
    pitchDecay.onChange(v => {
        kick.pitchDecay = v;
    });
    const octaves = kickFolder.add(kickParams, "octaves", 0, 15);
    octaves.onChange(v => {
        kick.octaves = v;
    });
    const oscillatorType = kickFolder.add(kickParams.oscillator, "type", ["sine", "square", "triangle", "sawtooth"]);
    oscillatorType.onChange(v => {
        kick.oscillator.type = v;
    });
    const attack = kickFolder.add(kickParams.envelope, "attack", 0, 1);
    attack.onChange(v => {
        kick.envelope.attack = v;
    });
    const decay = kickFolder.add(kickParams.envelope, "decay", 0, 1);
    decay.onChange(v => {
        kick.envelope.decay = v;
    });
    const sustain = kickFolder.add(kickParams.envelope, "sustain", 0, 1);
    sustain.onChange(v => {
        kick.envelope.sustain = v;
    });
    const release = kickFolder.add(kickParams.envelope, "release", 0 , 5);
    release.onChange(v => {
        kick.envelope.release = v;
    });
}

function createSnareGUI () {
    const gui = new dat.GUI();
    const noiseType = gui.add(snareParams.noise, "type", ["white", "pink", "brown"]);
    noiseType.onChange(v => {
        snare.noise.type = v;
    });
    const attack = gui.add(snareParams.envelope, "attack", 0, 1);
    attack.onChange(v => {
        snare.envelope.attack = v;
    });
    const decay = gui.add(snareParams.envelope, "decay", 0, 5);
    decay.onChange(v => {
        snare.envelope.decay = v;
    });
    const sustain = gui.add(snareParams.envelope, "sustain", 0, 1);
    sustain.onChange(v => {
        snare.envelope.sustain = v;
    });
    const release = gui.add(snareParams.envelope, "release", 0 , 5);
    release.onChange(v => {
        snare.envelope.release = v;
    });
}

export function run () {
    const kickSquare = new paper.Path.Rectangle({
        from: [100, 100],
        to: [200, 200],
        fillColor: "#f00"
    });
    kickSquare.onClick = function (event) {
        kick.triggerAttackRelease("c1", "8n");
    };

    const snareSquare = new paper.Path.Rectangle({
        from: [200, 100],
        to: [300, 200],
        fillColor: "#0f0",
    });
    snareSquare.onClick = function () {
        snare.triggerAttackRelease();
    }
}
