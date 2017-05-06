import Tone from "tone";
import paper from "paper";
import dat from "../dat.gui.min";
import {flowRight, range} from "lodash";
import {mod} from "../utils";
import {scale, pitch} from "palestrina.js/src/palestrina";
import Grid, {scaleMapping} from "./Grid";
import {piano, bass} from "./instruments";

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
    },
    save: () => {
        localStorage.setItem("grids", JSON.stringify(grids.map(grid => grid.serialize())));
    },
    addGrid: () => {
        const grid = new Grid({title: `${grids.length}`, position: [200, 200]});
        const loop = createLoop(grid);
        grid.draw();
        createGridFolder(gridGUI, grid);
        createLoopFolder(loopGUI, loop, loops.length);
        grids.push(grid);
        loops.push(loop);
    }
};

const gridData = localStorage.grids ? JSON.parse(localStorage.grids) : [];

const intervals = range(16).reverse();
const ROWS = intervals.length;
const COLS = 16;

let running = false;

const grids = gridData.map(grid => new Grid(grid));
grids.map(grid => grid.draw());

const loops = grids.map(createLoop);
const gridGUI = new dat.GUI();
const loopGUI = createGUI(params);
loops.map(createLoopFolder.bind(null, loopGUI));
grids.map(createGridFolder.bind(null, gridGUI));

function createGridFolder (gui, grid) {
    const folder = gui.addFolder(grid.title);
    const cols = folder.add(grid, "width");
    cols.onChange(v => {
        grid.draw();
    });
    const rows = folder.add(grid, "height");
    rows.onChange(v => {
        grid.draw();
    });
    const positionX = folder.add(grid.position, 0);
    positionX.name("X Position");
    positionX.onChange(v => {
        grid.draw();
    });
    const positionY = folder.add(grid.position, 1);
    positionY.name("Y Position");
    positionY.onChange(v => {
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
    gui.add(params, "save");
    gui.add(params, "addGrid");
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
        grid.unhighlightColumn(mod(col-1, grid.width));
        grid.columns[col].map(node => {
            if (node.active) {
                piano.triggerAttackRelease(grid.getHz(intervals[node.value]), loop.interval, time);
            }
        });
        grid.highlightColumn(col);
        col = mod(col+1, grid.width);
    }
    return loop;
}

Tone.Transport.bpm.value = params.tempo;
Tone.Transport.start();
