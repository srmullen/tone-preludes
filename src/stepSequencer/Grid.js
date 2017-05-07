import paper from "paper";
import {flowRight} from "lodash";
import {scale, pitch} from "palestrina.js/src/palestrina";

function keyRequired () {
    throw new Error("Key is required when creating Grid");
}

function Grid ({width=16, height=8, size=20, margin=2, title="", position=[0, 0], root="C", mode="major", color="#f00", instrument="piano", active=[]}) {
    this.instrument = instrument;
    this.width = width;
    this.height = height;
    this.size = size;
    this.margin = margin;
    this.columns = initColumns(width, height, active);
    this.title = title;
    this.position = position;
    this.root = root;
    this.mode = mode;
    this.color = color;
    this.getHz = scaleMapping(root, mode);
};

Grid.prototype.draw = function () {
    if (this.group) this.group.clear();
    const group = new paper.Group();
    for (let i = 0; i < this.width; i++) {
        const column = this.columns[i] ? this.columns[i].slice(0, this.height) : [];
        for (let j = 0; j < this.height; j++) {
            const node = {
                active: column[j] ? column[j].active : false,
                value: j
            };
            const from = [i * (this.size + this.margin), j * (this.size + this.margin)];
            const color = new paper.Color(this.color);
            const square = new paper.Path.Rectangle({
                from,
                to: [from[0] + this.size, from[1] + this.size],
                fillColor: node.active ? color.add("#0f0") : color
            });

            square.onClick = function () {
                node.active = !node.active;
                square.fillColor = node.active ? color.add("#0f0") : color;
            };
            square.onMouseEnter = _.bind(function () {
                console.log(frequencyToNote(this.getHz((this.height - 1) - j)));
            }, this);

            group.addChild(square);
            node.square = square;
            column[j] = node;
        }
        this.columns[i] = column;
    }
    this.group = group;
    this.group.onClick = function (e) {
        console.log(e);
    }
    this.group.translate(this.position);
}

Grid.prototype.clearHighlights = function (grid) {
    this.columns.forEach(column => column.forEach(unhighlight.bind(null, new paper.Color(this.color))));
}

Grid.prototype.highlightColumn = function (i) {
    this.columns[i].map(highlight);
}

Grid.prototype.unhighlightColumn = function (i) {
    this.columns[i].map(unhighlight.bind(null, new paper.Color(this.color)));
}

Grid.prototype.serialize = function () {
    return {
        width: this.width,
        height: this.height,
        size: this.size,
        margin: this.margin,
        title: this.title,
        position: this.position,
        root: this.root,
        mode: this.mode,
        color: this.color,
        active: getActive(this.columns)
    };
};

function getActive(columns) {
    const active = [];
    columns.forEach((col, i) => col.forEach((node, j) => {
        if (node.active) active.push([i, j]);
    }));
    return active;
}

Grid.prototype.toString = function () {
    return JSON.stringify(this.serialize());
};

function unhighlight (color, node) {
    if (node.active) {
        node.square.fillColor = color.add("#0f0");
    } else {
        node.square.fillColor = color;
    }
}

function highlight (node) {
    node.square.fillColor = node.square.fillColor.add("#00f");
}

export function scaleMapping (root, mode) {
    if (mode === "chromatic") {
        return flowRight(pitch.midiToHz, scale.lower, scale[root]);
    } else {
        return flowRight(pitch.midiToHz, scale.lower, scale[root], scale[mode]);
    }
}

function initColumns (width, height, active) {
    const columns = [];
    for (let i = 0; i < width; i++) {
        const column = [];
        for (let j = 0; j < height; j++) {
            const node = {
                active: false,
                value: j
            };
            column.push(node);
        }
        columns.push(column);
    }
    activateNodes(columns, active);
    return columns;
}

function activateNodes (columns, active) {
    active.forEach(([i, j]) => {
        if (columns[i] && columns[i][j]) {
            columns[i][j].active = true;
        }
    });
}

// From https://newt.phys.unsw.edu.au/music/note/
const frequencyToNote = function (input) {
	if(isNaN(input) || (input == 0))
		return "Can't convert freq";
	if((input < 27.5) || (input > 14080))
		return "Enter a frequency in the range 27.5Hz (A0) and 14080Hz (A9)";

	var A4 = 440.0;
	var A4_INDEX = 57;

	var notes = [
		"C0","C#0","D0","D#0","E0","F0","F#0","G0","G#0","A0","A#0","B0",
		"C1","C#1","D1","D#1","E1","F1","F#1","G1","G#1","A1","A#1","B1",
		"C2","C#2","D2","D#2","E2","F2","F#2","G2","G#2","A2","A#2","B2",
		"C3","C#3","D3","D#3","E3","F3","F#3","G3","G#3","A3","A#3","B3",
		"C4","C#4","D4","D#4","E4","F4","F#4","G4","G#4","A4","A#4","B4",
		"C5","C#5","D5","D#5","E5","F5","F#5","G5","G#5","A5","A#5","B5",
		"C6","C#6","D6","D#6","E6","F6","F#6","G6","G#6","A6","A#6","B6",
		"C7","C#7","D7","D#7","E7","F7","F#7","G7","G#7","A7","A#7","B7",
		"C8","C#8","D8","D#8","E8","F8","F#8","G8","G#8","A8","A#8","B8",
		"C9","C#9","D9","D#9","E9","F9","F#9","G9","G#9","A9","A#9","B9" ];

	var MINUS = 0;
	var PLUS = 1;

	var frequency;
	var r = Math.pow(2.0, 1.0/12.0);
	var cent = Math.pow(2.0, 1.0/1200.0);
	var r_index = 0;
	var cent_index = 0;
	var side;

	frequency = A4;

	if(input >= frequency) {
		while(input >= r*frequency) {
			frequency = r*frequency;
			r_index++;
		}
		while(input > cent*frequency) {
			frequency = cent*frequency;
			cent_index++;
		}
		if((cent*frequency - input) < (input - frequency))
			cent_index++;
		if(cent_index > 50) {
			r_index++;
			cent_index = 100 - cent_index;
			if(cent_index != 0)
				side = MINUS;
			else
				side = PLUS;
		}
		else
			side = PLUS;
	}

	else {
		while(input <= frequency/r) {
			frequency = frequency/r;
			r_index--;
		}
		while(input < frequency/cent) {
			frequency = frequency/cent;
			cent_index++;
		}
		if((input - frequency/cent) < (frequency - input))
			cent_index++;
		if(cent_index >= 50) {
			r_index--;
			cent_index = 100 - cent_index;
			side = PLUS;
		}
		else {
			if(cent_index != 0)
				side = MINUS;
			else
				side = PLUS;
		}
	}

	var result = notes[A4_INDEX + r_index];
	if(side == PLUS)
		result = result + " plus ";
	else
		result = result + " minus ";
	result = result + cent_index + " cents";
	return result;
}

export default Grid;
