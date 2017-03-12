import paper from "paper";
import {run} from "./prelude1";

if (process.env.NODE_ENV !== 'production') {
    require("../index.html");
}

paper.setup(document.getElementById("root-canvas"));

run();
