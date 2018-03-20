import Tone from 'tone';
import compile from 'boethius-lang/src/main';
import {voiceToToneEvents} from '../utils';

function bth ([program]) {
    return compile(program);
}

const music = bth`
; just the melody
~melA = (r/8 g c5/8 (tuplet=3/2 b4/8 c5/8 a4/8 r/8 a4/8 e4/8) |
g4/1 | (value=8 octave=4 r f g (slur f f) eb c (slur eb | eb/2))
(value=8 r c bb3 (slur c | c/1 | )) g a/8 (slur b/8 b/2) r/8 a4/4. b4 c5/8
(slur d5/8 | d5/2) r/8 c5/8 g4/8 (slur bb4/8 | bb4/2.) a4
c5/2 r/8 bb4/8 f4/8 (slur ab4/8 | ab4/2.) g4 | bb4/2 r/8 ab4/16 bb4/16 ab4/8 db4/8 |
eb5/2 r/8 db5/16 eb5/16 db5/8 ab4/8 (slur gb5/1 gb5/1)
)

[mel (part=pluck tempo=100 ~melA)]
`;

const synth = new Tone.Synth().toMaster();

// FIXME: Need to handle slurs.
const events = voiceToToneEvents(music.voices.mel);

const part = new Tone.Part((time, event) => {
    if (event.type === 'note') {
        const pitch = event.pitchClass + (event.octave || 4);
        synth.triggerAttackRelease(pitch, event.dur, time);
    }
}, events);
part.start(0);

// Tone.Transport.start();

console.log(events);
