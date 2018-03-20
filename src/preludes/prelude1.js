import Tone from 'tone';

Tone.Master.volume.value = -10;

const compressor = new Tone.Compressor();
compressor.connect(Tone.Master);
const OUT = compressor;

const reverb = new Tone.Freeverb({
	wet: 0.5,
	roomSize: 0.9,
	dampening: 3000
}).connect(OUT);
window.reverb = reverb;

const pSynth = new Tone.PolySynth(6, Tone.Synth).connect(reverb);
pSynth.set({
	"name": "Synth",
	"volume": -20,
	"portamento": 0.060222980401155424,
	"detune": 0,
	"envelope": {
		"attack": 2,
		"decay": 0,
		"sustain": 1,
		"release": 2
	},
	"oscillator": {
		"type": "sine"
	}
});

const kick = new Tone.MembraneSynth({
	"name": "MembraneSynth",
	"volume": -0.6695083342629715,
	"pitchDecay": 0.0623418641375888,
	"octaves": 7.593218276966667,
	"oscillator": {
		"type": "triangle"
	},
	"envelope": {
		"attack": 0.001,
		"decay": 0.4,
		"sustain": 0.001,
		"release": 1.4,
		"attackCurve": "bounce"
	}
}).connect(OUT);

const hat = new Tone.NoiseSynth({
	"name": "NoiseSynth",
	"volume": -10,
	"noise": {
		"type": "white"
	},
	"envelope": {
		"attack": 0.005,
		"decay": 0.057339174036220575,
		"sustain": 0
	}
}).toMaster();

const wash = new Tone.NoiseSynth({
	volume: -10,
	noise: {
		type: 'pink'
	},
	envelope: {
		attack: '1n + 4n',
		decay: 0,
		sustain: 0
	}
}).connect(OUT);

const subbass = new Tone.Synth({
	"volume": -5,
	"detune": 0,
	"envelope": {
		"attack": 0.01,
		"decay": 0,
		"sustain": 1,
		"release": 0.5
	},
	"oscillator": {
		"type": "sine"
	}
}).connect(OUT);

window.pSynth = pSynth;

const cSpread = ['c2', 'g2', 'e3', 'b3', 'f#4', 'd5'];
const cCluster = ['e3', 'f#3', 'g3', 'b3', 'd4', 'a4'];
const fSpread = ['f2', 'c3', 'a3', 'e4', 'b4', 'g5'];
const fCluster = ['a3', 'b3', 'c4', 'e4', 'g4', 'd5'];

// const chords = [['0:0:0', {p: ['e3','b3', 'd4', 'c5'], d: '1n'}], ['1:0:0', {p: ['f3','c3', 'c4', 'a5'], d: '2n'}],
// ['2:0:0', {p: ['b2', 'a3', 'c#4', 'd5'], d: '1n'}]]
const chords = [
    ['0:0:0', {p: cSpread, d: '1n + 2n'}], ['2:0:0', {p: cCluster, d: '1n + 2n'}],
    ['4:0:0', {p: fSpread, d: '1n + 2n'}], ['6:0:0', {p: fCluster, d: '1n + 2n'}]
];

const hatp1 = ['0:0:0', '0:2:0', '0:3:0'];
const hatp2 = ['0:0:0', '0:2:0', '0:3:0', '0:3:1', '0:3:2', '0:3:2.5', '0:3:3', '0:3:3.5'].map(t => {
	return Tone.Time('1m').add(t);
});

const waves = [0, '8m'];

Tone.Transport.bpm.value = 80;

function part1 () {
	const loops = 4;
	// Chords
    const chordPart = part((time, note) => {
        pSynth.triggerAttackRelease(note.p, note.d, time);
    }, chords, {loop: loops, loopEnd: '8m'});
    // chordPart.loop = loops;
    // chordPart.loopEnd = '8m';

    // Kicks
    const kickPart = part((time) => {
        kick.triggerAttackRelease('c2');
    }, ['0:0:2'], {loop: loops * 8});
    // kickPart.loop = loops * 8;

	// Wash
	const washPart = part(time => {
		wash.triggerAttackRelease('2m')
	}, ['1:0:0', '4:0:0'], {loop: loops, loopEnd: '5m'});
	// washPart.loop = loops;
	// washPart.loopEnd = '5m';

	const hatPart = part(time => {
		hat.triggerAttackRelease('16n', time);
	}, [...hatp1, ...hatp2], {loop: loops * 4, loopEnd: '2m'});
	// hatPart.loopEnd = '2m';
	// hatPart.loop = loops * 4;
	// hatPart.mute = false;

	// Need to set loops before starting part.
	chordPart.start(waves[0]);
	kickPart.start(waves[1]);
	washPart.start(waves[1]);
	hatPart.start(waves[1]);
}

function part2 () {
	const kicks = new Tone.Part(time => {

	});
}

/*
 *
 */
function duration (part) {
	if (part.loop > 1) {
		return Tone.Time(part.loopEnd).sub(part.loopStart).mult(part.loop);
	} else if (part.loop === 1) {
		return Tone.Time(part.loopEnd).sub(part.loopStart).mult(2);
	} else {
		return Tone.Time(part.loopEnd).sub(part.loopStart);
	}
}

let kickPart = window.kickPart = part((time) => {
	kick.triggerAttackRelease('c2');
}, ['0:0:0', '0:0:3', '0:1:0', '0:2:0', '0:2:3', '0:3:0'], {loopStart: 0, loopEnd: '1m'});

let hatPart = window.hatPart = part(time => {
	hat.triggerAttackRelease('16n', time);
}, [...hatp1, ...hatp2], {loop: 1, loopEnd: '1m'});

function part (fn, events, options) {
	const p = new Tone.Part(fn, events);
	p.loopStart = options.loopStart || 0;
	p.loopEnd = options.loopEnd || p.loopEnd;
	p.loop = options.loop;
	return p;
}

// Parts must be stopped before they can be started again at a different time.

function then (...parts) {
	// Make sure none of the parts are running.
	parts.each(part => {
		if (part.state === 'started') {
			throw new Error('Part already started');
		}
	});

	// Tone.Transport.start();
	// Tone.Transport.stop(new Tone.Time('2m'));
}

window.then = then;

export function play () {
    part1();

    Tone.Transport.start();
}

export function stop () {
    Tone.Transport.stop();
}

window.start = () => Tone.Transport.start();
window.stop = () => Tone.Transport.stop();
