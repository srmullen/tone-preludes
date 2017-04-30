import paper from "paper";

function Grid ({columns=16, rows=8, size=50, margin=2, title="", position=[0, 0]}) {
    this.numCols = columns;
    this.numRows = rows;
    this.size = size;
    this.margin = margin;
    this.columns = [];
    this.title = title;
    this.position = position;
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
            const square = new paper.Path.Rectangle({
                from,
                to: [from[0] + this.size, from[1] + this.size],
                fillColor: node.active ? "#0f0" : "#f00"
            });
            square.onClick = function () {
                node.active = !node.active;
                square.fillColor = node.active ? "#0f0" : "#f00";
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
