import paper from "paper";
import {flowRight} from "lodash";
import {scale, pitch} from "palestrina.js/src/palestrina";

function Grid ({columns=16, rows=8, size=50, margin=2, title="", position=[0, 0], root="C", mode="major", color="#f00"}) {
    this.numCols = columns;
    this.numRows = rows;
    this.size = size;
    this.margin = margin;
    this.columns = [];
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
    for (let i = 0; i < this.numCols; i++) {
        const column = this.columns[i] ? this.columns[i].slice(0, this.numRows) : [];
        for (let j = 0; j < this.numRows; j++) {
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
            }
            group.addChild(square);
            node.square = square;
            column[j] = node;
        }
        this.columns[i] = column;
    }
    this.group = group;
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

export default Grid;
