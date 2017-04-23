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
};

const metalParams = {
    frequency: 200,
    envelope: {
        attack:0.001,
        decay:1.4,
        release:0.2,
    },
    harmonicity: 5.1,
    modulationIndex: 32,
    resonance: 4000,
    octaves: 1.5
};

const kick = new MembraneSynth(kickParams).toMaster();
const snare = new NoiseSynth(snareParams).toMaster();
const metal = new MetalSynth(metalParams).toMaster();

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
// createSnareGUI();

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

    const membraneFolder = gui.addFolder("Membrane");
    createMembraneGUI(membraneFolder);
    const noiseFolder = gui.addFolder("Noise");
    createNoiseGUI(noiseFolder);
    const metalFolder = gui.addFolder("Metal");
    createMetalGUI(metalFolder);
}

function createMembraneGUI (gui) {
    const pitchDecay = gui.add(kickParams, "pitchDecay", 0, 1);
    pitchDecay.onChange(v => {
        kick.pitchDecay = v;
    });
    const octaves = gui.add(kickParams, "octaves", 0, 15);
    octaves.onChange(v => {
        kick.octaves = v;
    });
    const oscillatorType = gui.add(kickParams.oscillator, "type", ["sine", "square", "triangle", "sawtooth"]);
    oscillatorType.onChange(v => {
        kick.oscillator.type = v;
    });
    const attack = gui.add(kickParams.envelope, "attack", 0, 1);
    attack.onChange(v => {
        kick.envelope.attack = v;
    });
    const decay = gui.add(kickParams.envelope, "decay", 0, 1);
    decay.onChange(v => {
        kick.envelope.decay = v;
    });
    const sustain = gui.add(kickParams.envelope, "sustain", 0, 1);
    sustain.onChange(v => {
        kick.envelope.sustain = v;
    });
    const release = gui.add(kickParams.envelope, "release", 0 , 5);
    release.onChange(v => {
        kick.envelope.release = v;
    });
}

function createNoiseGUI (gui) {
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

function createMetalGUI (gui) {
    const frequency = gui.add(metalParams, "frequency", 10, 1000);
    frequency.onChange(v => {
        metal.frequency.value = v;
    });
    const attack = gui.add(metalParams.envelope, "attack", 0, 1);
    attack.onChange(v => {
        metal.envelope.attack = v;
    });
    const decay = gui.add(metalParams.envelope, "decay", 0, 5);
    decay.onChange(v => {
        metal.envelope.decay = v;
    });
    const release = gui.add(metalParams.envelope, "release", 0 , 5);
    release.onChange(v => {
        metal.envelope.release = v;
    });
    // harmonicity: 5.1,
    const harmonicity = gui.add(metalParams, "harmonicity", 0, 10);
    harmonicity.onChange(v => {
        metal.harmonicity = v;
    });
    // modulationIndex: 32,
    const modulationIndex = gui.add(metalParams, "modulationIndex", 0, 100);
    modulationIndex.onChange(v => {
        metal.modulationIndex = v;
    });
    // resonance: 4000,
    const resonance = gui.add(metalParams, "resonance", 0, 10000);
    resonance.onChange(v => {
        metal.resonance = v;
    });
    // octaves: 1.5
    const octaves = gui.add(metalParams, "octaves", 0, 5);
    octaves.onChange(v => {
        metal.octaves = v;
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
        fillColor: "#0f0"
    });
    snareSquare.onClick = function () {
        snare.triggerAttackRelease();
    }
    const metalSquare = new paper.Path.Rectangle({
        from: [300, 100],
        to: [400, 200],
        fillColor: "#00f"
    })

    metalSquare.onClick = function () {
        metal.triggerAttackRelease();
    }
}
