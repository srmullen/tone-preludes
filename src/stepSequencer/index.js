import Tone from "tone";
import paper from "paper";
import dat from "../dat.gui.min";
import {flowRight, range} from "lodash";
import {mod} from "../utils";
import {scale, pitch} from "palestrina.js/src/palestrina";
import Grid from "./Grid";

paper.setup(document.getElementById("root-canvas"));
window.scale = scale;
window.pitch = pitch;

const guiParams = {
    quantization: "16n",
    tempo: 120,
    root: "C",
    mode: "major",
    run: () => {
        running = !running;
        if (running) {
            loop.start();
        } else {
            loop.stop();
            grid.clearHighlights(grid);
        }
    }
};

const intervals = range(16).reverse();
const ROWS = intervals.length;
const COLS = 16;
let getHz = scaleMapping(guiParams.root, guiParams.mode);

let running = false;

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

const grid = new Grid({columns: COLS, rows: ROWS, size: 20});
grid.draw();
grid.group.translate(10, 10);

let loop = createLoop(grid);
createGUI();
createGridGUI(grid);

function createGridGUI (grid) {
    const gui = new dat.GUI();
    const cols = gui.add(grid, "numCols");
    cols.onChange(v => {
        grid.draw();
        grid.group.translate(10, 10);
    });
    const rows = gui.add(grid, "numRows");
    rows.onChange(v => {
        grid.draw();
        grid.group.translate(10, 10);
    });
    const size = gui.add(grid, "size");
    size.onChange(v => {
        grid.draw();
        grid.group.translate(10, 10);
    });
    const margin = gui.add(grid, "margin");
    margin.onChange(v => {
        grid.draw();
        grid.group.translate(10, 10);
    });
}

function createGUI (params) {
    const gui = new dat.GUI();
    const tempoController = gui.add(guiParams, "tempo", 20, 240);
    tempoController.onChange(v => Tone.Transport.bpm.value = v);
    const quantizationController = gui.add(guiParams, "quantization", ["64n", "32n", "16n", "8n", "4n", "2n"]);
    quantizationController.onChange(v => {
        // remove old loop
        loop.cancel().dispose();
        grid.clearGridHighlights();
        // create new loop
        loop = createLoop(grid);
        if (running) {
            loop.start();
        }
    });
    const rootController = gui.add(guiParams, "root", ["C", "D", "E", "F", "G", "A", "B"]);
    rootController.onChange(v => {
        getHz = scaleMapping(v, guiParams.mode);
    });
    const modeController = gui.add(guiParams, "mode",
        ["major", "minor", "ionian", "dorian", "phrygian", "lydian", "mixolydian", "aeolian", "locrian", "chromatic"]);
    modeController.onChange(v => {
        getHz = scaleMapping(guiParams.root, v);
    });
    gui.add(guiParams, "run");
}

function createSequence () {
    return new Tone.Sequence((time, col) => {
        grid.unhighlightColumn(mod(col-1, COLS));
        grid.columns[col].map(node => {
            if (node.active) {
                piano.triggerAttackRelease(getHz(intervals[node.value]), guiParams.quantization, time);
            }
        });
        grid.highlightColumn(col);
    }, range(COLS), guiParams.quantization);
}

function createLoop (grid) {
    let col = 0;
    return new Tone.Loop((time) => {
        grid.unhighlightColumn(mod(col-1, grid.numCols));
        grid.columns[col].map(node => {
            if (node.active) {
                piano.triggerAttackRelease(getHz(intervals[node.value]), guiParams.quantization, time);
            }
        });
        grid.highlightColumn(col);
        col = mod(col+1, grid.numCols);
    }, guiParams.quantization);
}

Tone.Transport.bpm.value = guiParams.tempo;
Tone.Transport.start();

function scaleMapping (root, mode) {
    if (mode === "chromatic") {
        return flowRight(pitch.midiToHz, scale.lower, scale[root]);
    } else {
        return flowRight(pitch.midiToHz, scale.lower, scale[root], scale[mode]);
    }
}
