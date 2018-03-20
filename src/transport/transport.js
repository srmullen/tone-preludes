import React from "react";
import Tone from "tone";
import {piano, bass} from "./instruments";

window.Tone = Tone;

const p1Music = voice([
    ["a4", "16n"],
    ["b4", "16n"],
    ["c5", "16n"],
    ["d5", "16n"]
]);

const pianoPart = new Tone.Part((time, {pitch, duration, velocity}) => {
    piano.triggerAttackRelease(pitch, duration, time, velocity);
}, p1Music).start(0);

pianoPart.loop = true;
pianoPart.loopStart = "0:0:0";
pianoPart.loopEnd = "0:2:0";

const bassPulse = voice([
    ["a1", "8n"],
    ["a3", "8n"],
    ["a2", "8n"],
    ["a3", "8n"],
    ["a2", "8n"],
    ["a4", "8n"],
]);

const bassPart = new Tone.Part((time, {pitch, duration, velocity}) => {
    bass.triggerAttackRelease(pitch, duration, time, velocity);
}, bassPulse).start(0);

bassPart.loop = true;
bassPart.loopStart = "0:0:0";
bassPart.loopEnd = "0:6:0";

Tone.Transport.timeSignature = [6, 4];
window.start = function () {
    Tone.Transport.start();
};

window.stop = function () {
    Tone.Transport.stop();
}

function note (pitch, duration="4n", time, velocity=0.5) {
    return {pitch, duration, time, velocity};
}

function voice (notes) {
    let time = new Tone.Time("0:0:0");
    return notes.reduce((acc, [pitch, duration]) => {
        const noteObj = note(pitch, duration, time.toBarsBeatsSixteenths());
        time.add(noteObj.duration);
        return acc.concat([noteObj]);
    }, []);
}
