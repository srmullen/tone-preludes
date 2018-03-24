import Tone from 'tone';
import P5 from 'p5';
import teoria from 'teoria';
import {last} from 'lodash';
import bth from '../bth-tag';
import {voiceToToneEvents} from '../utils';
import {reciprocal} from '../utils/math';

window.teoria = teoria;

const state = {
    rh: null,
    lh: null
};

const synth = new Tone.PolySynth(2, Tone.AMSynth).toMaster();

const music = bth`
    [rh (part=rh a4 b4 c5 d5 | e5 f5  g5 a5)]
    [lh (part=lh c5 b4 a4 g4 | f4 eb4 d4 c4)]
`;

// FIXME: Need to handle slurs.
const rh = voiceToToneEvents(music.voices.rh);
const lh = voiceToToneEvents(music.voices.lh);

// HSB values
const colors = {
    unison:  {P: [0, 100, 100], d: [10, 100, 100], A: [20, 100, 100]},
    second:  {m: [30, 100, 100], M: [40, 100, 100], d: [50, 100, 100], A: [60, 100, 100]},
    third:   {m: [70, 100, 100], M: [8, 100, 100], d: [90, 100, 100], A: [100, 100, 100]},
    fourth:  {P: [110, 100, 100], d: [120, 100, 100], A: [130, 100, 100], AA: [140, 100, 100]},
    fifth:   {P: [150, 100, 100], d: [160, 100, 100], A: [170, 100, 100]},
    sixth:   {m: [180, 100, 100], M: [190, 100, 100], d: [200, 100, 100], A: [210, 100, 100]},
    seventh: {m: [220, 100, 100], M: [230, 100, 100], d: [240, 100, 100], A: [250, 100, 100]},
    octave:  {P: [260, 100, 100], d: [270, 100, 100], A: [280, 100, 100]}
};

function intervalColor (n1, n2) {
    const interval = teoria.interval(teoria.note(n1), teoria.note(n2)).simple();
    const name = interval.name();
    const quality = interval.quality();
    return colors[name][quality];
}

const p5 = new P5((p5) => {
    p5.setup = () => {
        const canvas = p5.createCanvas(p5.windowWidth, p5.windowHeight);
        canvas.parent('root');
        p5.colorMode(p5.HSB);
        p5.background(0, 0, 0);
        p5.noStroke();
        p5.noLoop();
    }

    p5.draw = () => {
        // const color = (state.rh && state.lh) ? intervalColor(state.rh, state.lh) : [0, 0, 0];
        drawVoice(music.voices.rh);
    }

    function drawVoice (voice) {
        const duration = getVoiceDuration(voice);
        const noteWidth = p5.width / voice.length;
        for (let i = 0; i < voice.length; i++) {
            p5.fill([p5.random(360), 100, 70]);
            p5.rect(i * noteWidth, 0, p5.width/voice.length, p5.height);
        }
    }

    function drawIntervals (intervals) {

    }
});

window.p5 = p5;

// Gets the duration of voice using bth props.
function getVoiceDuration (voice) {
    const event = last(voice);
    const dur = event.props.value ? reciprocal(event.props.value) : 0.25;
    return event.props.time + dur;
}

// Gets the duration of events using Tone.Time
// This is affected by Transport.bpm, unlike getVoiceDuration.
function getEventsDuration (events) {
    const event = last(events);
    const duration = event.time.clone().add(event.dur);
    return duration.toSeconds();
}

function playEvent (time, event) {
    if (event.type === 'note') {
        const pitch = event.pitchClass + (event.octave || 4);
        synth.triggerAttackRelease(pitch, event.dur, time);
        Tone.Draw.schedule(() => {
            state[event.part] = pitch;
        }, time);
    }
}

const leader = new Tone.Part(playEvent, rh);
const follower = new Tone.Part(playEvent, lh);

leader.start(0);
follower.start(0);

// TODO: Create visualization of canon intervals.

export function start () {
    p5.loop();
    Tone.Transport.start();
}

export function stop () {
    p5.noLoop();
    Tone.Transport.stop();
}
