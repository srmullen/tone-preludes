import Tone from "tone";
import paper from "paper";
import dat from "../dat.gui.min";
import {flowRight, range} from "lodash";
import {mod} from "../utils";
import {scale, pitch} from "palestrina.js/src/palestrina";
import Grid, {scaleMapping} from "./Grid";
import * as instruments from "./instruments";

paper.setup(document.getElementById("root-canvas"));
window.paper = paper;

const params = {
    tempo: 120,
    run: () => {
        running = !running;
        if (running) {
            grids.map(({loop}) => loop.start());
        } else {
            grids.map(({grid, loop}) => {
                loop.stop();
                grid.clearHighlights();
            });
        }
    },
    save: () => {
        localStorage.setItem("grids", JSON.stringify(grids.map(data => serialize(data))));
        console.log("Grid saved successfully");
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

let grids = gridData.map(data => {
    const grid = new Grid(data.grid);
    const loop = createLoop(grid, data.loop);
    grid.draw();
    return {grid, loop};
});

const gridGUI = new dat.GUI();
const loopGUI = createGUI(params);
grids.map(createGridFolder.bind(null, gridGUI));

function createGridFolder (gui, {grid, loop}, i) {
    const folder = gui.addFolder(grid.title);
    const instrument = folder.add(grid, "instrument", Object.keys(instruments));
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
    folder.add(loop, "interval", ["64n", "32n", "16n", "8n", "4n", "2n"]);
    folder.add(loop, "playbackRate", 0, 2);
    folder.add(loop, "humanize");
    const fns = {
        remove () {
            grid.group.clear();
            loop.dispose();
            grids = [...grids.slice(0, i), ...grids.slice(i + 1)];
        }
    }
    folder.add(fns, "remove");
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

function createLoop (grid, opts={}) {
    let col = 0;
    const loop = new Tone.Loop();
    if (opts.interval) loop.interval = opts.interval;
    if (opts.playbackRate) loop.playbackRate = opts.playbackRate;
    if (opts.humanize) loop.humanize = opts.humanize;
    loop.callback = (time) => {
        grid.unhighlightColumn(mod(col-1, grid.width));
        grid.columns[col].map(node => {
            if (node.active) {
                instruments[grid.instrument].triggerAttackRelease(grid.getHz(intervals[node.value]), loop.interval, time);
            }
        });
        grid.highlightColumn(col);
        col = mod(col+1, grid.width);
    }
    return loop;
}

function serialize ({grid, loop}) {
    return {
        grid: grid.serialize(),
        loop: {
            interval: loop.interval,
            playbackRate: loop.playbackRate,
            humanize: loop.humanize
        }
    };
}

Tone.Transport.bpm.value = params.tempo;
Tone.Transport.start();
