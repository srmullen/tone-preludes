import {last} from 'lodash';
import Tone from 'tone';

function durString (value=4, dots) {
    if (!dots) return `${value}n`;
    if (dots === 1) return `${value}n + ${value * 2}n`;
    if (dots === 2) return `${value}n + ${value * 2}n + ${value * 4}n`;
}

export function voiceToToneEvents (voice) {
    return voice.reduce((acc, event, i) => {
		const previousEvent = last(acc);
		const time = previousEvent ? previousEvent.time.clone().add(previousEvent.dur) : Tone.Time(0);
		const {value, pitchClass, octave, dots} = event.props;
        if (event.type === 'note') {
            acc.push({type: event.type, time, pitchClass, octave, dur: `${durString(value, dots)}`});
        } else if (event.type === 'rest') {
            acc.push({type: event.type, time, dur: `${durString(value, dots)}`});
        } else if (type === 'chord') {
            throw new Error('Converting chords to events not implemented.');
        }
		return acc;
	}, []);
}
