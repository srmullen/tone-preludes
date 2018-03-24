import paper from 'paper';
import Tone from "tone";

const kick = new Tone.MembraneSynth({
    envelope: {
        sustain: 0,
        attack: 0.02,
        decay: 0.8
    },
    octaves: 10
}).toMaster();

const snare = new Tone.NoiseSynth({
    volume: -5,
    envelope: {
        attack: 0.001,
        decay: 0.2,
        sustain: 0
    },
    filterEnvelope: {
        attack: 0.001,
        decay: 0.1,
        sustain: 0
    }
}).toMaster();

const piano = new Tone.PolySynth({
    volume: -8,
    oscillator: {
        partials: [1, 2, 1],
    },
    portamento: 0.5
}).toMaster();

const bass = new Tone.MonoSynth({
    volume: -10,
    envelope: {
        attack: 0.1,
        decay: 0.3,
        release: 2
    },
    filterEnvelope: {
        attack: 1,
        decay: 0.01,
        sustain: 0.5,
        baseFrequency: 200,
        ocataves: 2.6
    }
}).toMaster();

const kickPart = new Tone.Loop((time) => {
    kick.triggerAttackRelease("C2", "8n", time);
}).start(0);

const snarePart = new Tone.Loop((time) => {
    snare.triggerAttack(time);
}, "2n").start("4n");

const cChord = ["c4", "e4", "g4", "b4"];
const dChord = ["d4", "f4", "a4", "c5"];
const gChord = ["b3", "d4", "e4", "a4"];

const pianoPart = new Tone.Part((time, chord) => {
    piano.triggerAttackRelease(chord, "8n", time);
}, [["0:0:2", cChord], ["0:1", cChord], ["0:1:3", dChord], ["0:2:2", cChord], ["0:3", cChord], ["0:3:2", gChord]]).start("2m");

pianoPart.loop = true;
pianoPart.loopEnd = "1m";
pianoPart.humanize = true;
pianoPart.loopStart = 0;
pianoPart.playbackRate = 1;
pianoPart.probability = 1;
pianoPart.mute = false;

const bassPart = new Tone.Sequence((time, note) => {
    bass.triggerAttackRelease(note, "16n", time);
}, ["c2", ["c3", ["c3", "d2"]], "e2", ["d2", "a1"]]).start(0);

bassPart.probability = 0.9;

Tone.Transport.bpm.value = 90;

window.kick = kick;
window.snare = snare;
window.piano = piano;
window.bass = bass;

function start () {
    Tone.Transport.start("+0.1");
}

function stop () {
    Tone.Transport.stop();
}

window.start = start;
window.stop = stop;
