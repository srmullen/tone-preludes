import paper from "paper";

function Grid (columns, rows) {
    this.numCols = columns;
    this.numRows = rows;
};

Grid.prototype.draw = function ({size=50, margin=2}) {
    const group = new paper.Group();
    const columns = [];
    for (let i = 0; i < this.numCols; i++) {
        const column = [];
        for (let j = 0; j < this.numRows; j++) {
            const node = {
                active: false,
                value: j
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
            group.addChild(square);
            node.square = square;
            column[j] = node;
        }
        columns[i] = column;
    }
    this.group = group;
    this.columns = columns;
}

Grid.prototype.clearHighlights = function (grid) {
    this.columns.forEach(column => column.forEach(unhighlight));
}

Grid.prototype.highlightColumn = function (i) {
    this.columns[i].map(highlight);
}

Grid.prototype.unhighlightColumn = function (i) {
    this.columns[i].map(unhighlight);
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

export default Grid;
