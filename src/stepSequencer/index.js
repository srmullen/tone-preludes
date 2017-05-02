import Tone from "tone";
import paper from "paper";
import dat from "../dat.gui.min";
import {flowRight, range} from "lodash";
import {mod} from "../utils";
import {scale, pitch} from "palestrina.js/src/palestrina";
import Grid, {scaleMapping} from "./Grid";

paper.setup(document.getElementById("root-canvas"));
window.paper = paper;

const params = {
    tempo: 120,
    run: () => {
        running = !running;
        if (running) {
            loops.map(loop => loop.start());
        } else {
            loops.map(loop => loop.stop());
            grids.map(grid => grid.clearHighlights());
        }
    }
};

const intervals = range(16).reverse();
const ROWS = intervals.length;
const COLS = 16;

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

const grids = [
    new Grid({columns: COLS, rows: ROWS, size: 20, title: "Grid 1", position: [10, 10]}),
    new Grid({columns: COLS, rows: ROWS, size: 20, title: "Grid 2", position: [500, 10]})
];
grids.map(grid => grid.draw());

const loops = [createLoop(grids[0]), createLoop(grids[1])];
const gridGUI = new dat.GUI();
const loopGUI = createGUI(params);
createLoopFolder(loopGUI, loops[0], "Loop 1");
createLoopFolder(loopGUI, loops[1], "Loop 2");
createGridFolder(gridGUI, grids[0]);
createGridFolder(gridGUI, grids[1]);

function createGridFolder (gui, grid) {
    const folder = gui.addFolder(grid.title);
    const cols = folder.add(grid, "numCols");
    cols.onChange(v => {
        grid.draw();
    });
    const rows = folder.add(grid, "numRows");
    rows.onChange(v => {
        grid.draw();
    });
    const size = folder.add(grid, "size");
    size.onChange(v => {
        grid.draw();
    });
    const margin = folder.add(grid, "margin");
    margin.onChange(v => {
        grid.draw();
    });
    const rootController = folder.add(grid, "root", ["C", "D", "E", "F", "G", "A", "B"]);
    rootController.onChange(v => {
        grid.getHz = scaleMapping(v, grid.mode);
    });
    const modeController = folder.add(grid, "mode",
        ["major", "minor", "ionian", "dorian", "phrygian", "lydian", "mixolydian", "aeolian", "locrian", "chromatic"]);
    modeController.onChange(v => {
        grid.getHz = scaleMapping(grid.root, v);
    });
    const color = folder.addColor(grid, "color");
    color.onChange(v => {
        grid.draw();
    });
}

function createGUI (params) {
    const gui = new dat.GUI();
    const tempoController = gui.add(params, "tempo", 20, 240);
    tempoController.onChange(v => Tone.Transport.bpm.value = v);

    gui.add(params, "run");
    return gui;
}

function createLoopFolder (gui, loop, title="Loop") {
    const folder = gui.addFolder(title);
    folder.add(loop, "interval", ["64n", "32n", "16n", "8n", "4n", "2n"]);
    folder.add(loop, "playbackRate", 0, 2);
    folder.add(loop, "humanize");
}

function createLoop (grid) {
    let col = 0;
    const loop = new Tone.Loop();
    loop.callback = (time) => {
        grid.unhighlightColumn(mod(col-1, grid.numCols));
        grid.columns[col].map(node => {
            if (node.active) {
                piano.triggerAttackRelease(grid.getHz(intervals[node.value]), loop.interval, time);
            }
        });
        grid.highlightColumn(col);
        col = mod(col+1, grid.numCols);
    }
    return loop;
}

Tone.Transport.bpm.value = params.tempo;
Tone.Transport.start();
