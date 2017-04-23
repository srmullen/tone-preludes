import Tone from "tone";
import paper from "paper";
import dat from "../dat.gui.min";
import {mod, range} from "../utils";

paper.setup(document.getElementById("root-canvas"));

const scale = ["c3", "d3", "e3", "f3", "g3", "a3", "b3"].reverse();
const ROWS = scale.length;
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

const guiParams = {
    quantization: "16n",
    tempo: 120,
    run: () => {
        running = !running;
        if (running) {
            loop.start();
        } else {
            loop.stop();
            clearGridHighlights(grid);
        }
    }
};
const gui = new dat.GUI();
const tempoController = gui.add(guiParams, "tempo", 20, 240);
tempoController.onChange(v => Tone.Transport.bpm.value = v);
const quantizationController = gui.add(guiParams, "quantization", ["64n", "32n", "16n", "8n", "4n", "2n"]);
quantizationController.onChange(v => {
    // remove old loop
    loop.cancel().dispose();
    clearGridHighlights(grid);
    // create new loop
    loop = createLoop();
    if (running) {
        loop.start();
    }
});
gui.add(guiParams, "run");

function drawGrid (columns, rows, {size=50, margin=2}) {
    const gridGroup = new paper.Group();
    const grid = [];
    for (let i = 0; i < columns; i++) {
        const column = [];
        for (let j = 0; j < rows; j++) {
            const node = {
                active: false,
                value: scale[j]
            };
            const from = [i * (size + margin), j * (size + margin)];
            const square = new paper.Path.Rectangle({
                from,
                to: [from[0] + size, from[1] + size],
                fillColor: "#f00"
            });
            square.onClick = function () {
                node.active = !node.active;
                square.fillColor = node.active ? "#0f0" : "#f00";
            }
            gridGroup.addChild(square);
            node.square = square;
            column[j] = node;
        }
        grid[i] = column;
    }
    gridGroup.translate(10, 10);
    return grid;
}

const grid = drawGrid(COLS, ROWS, {size: 50, margin: 2});

let loop = createLoop();

function createLoop () {
    return new Tone.Sequence((time, col) => {
        // unhighlight last column
        grid[mod(col-1, COLS)].map(unhighlight);
        // Highlight playing column
        grid[col].map(node => {
            if (node.active) {
                piano.triggerAttackRelease(node.value, guiParams.quantization, time);
            }
            highlight(node);
        });
    }, range(COLS), guiParams.quantization);
}

function clearGridHighlights (grid) {
    grid.forEach(column => column.forEach(unhighlight));
}

function unhighlight (node) {
    if (node.active) {
        node.square.fillColor = "#0f0";
    } else {
        node.square.fillColor = "#f00";
    }
}

function highlight (node) {
    if (node.active) {
        node.square.fillColor = "#f0f";
    } else {
        node.square.fillColor = "#00f";
    }
}

Tone.Transport.bpm.value = guiParams.tempo;
Tone.Transport.start();
