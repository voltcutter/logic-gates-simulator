// import { setCameraPositionAndZoom, drawFrame } from "./camera.js";

var gameArea = document.getElementById("gameArea");
gameArea.innerHTML += `<canvas id="gameCanvas" width=${
    gameArea.offsetWidth - 5
} height=${gameArea.offsetHeight - 5}></canvas>`;
var gameCanvas = document.getElementById("gameCanvas");
var ctx = gameCanvas.getContext("2d");
var toolBar = document.getElementById("toolBar");
var blockBar = document.getElementById("blockBar");
var tools = ["pencil", "connector", "eraser", "pulse", "inspect"];
var selectedTool = "pencil";

var firstConnectionCoord = null;
var secondConnectionCoord = null;

for (let i = 0; i < tools.length; i++) {
    var newToolButton = document.createElement("button");
    newToolButton.id = tools[i] + "ToolButton";
    newToolButton.classList.add("toolButton");
    var newToolIcon = document.createElement("img");
    newToolIcon.src = tools[i] + ".png";
    newToolIcon.classList.add("prevent-select");
    newToolButton.appendChild(newToolIcon);
    toolBar.appendChild(newToolButton);
    newToolButton.addEventListener("click", function () {
        selectedTool = tools[i];
        for (let i = 0; i < tools.length; i++) {
            document
                .getElementById(tools[i] + "ToolButton")
                .classList.remove("selected");
            document
                .getElementById(selectedTool + "ToolButton")
                .classList.add("selected");
        }
    });
}

var blockTypes = [
    "and",
    "or",
    "xor",
    "nand",
    "nor",
    "xnor",
    "flipflop",
    "led",
    "alternator",
    "random",
    "sound",
    "tile",
];
var selectedBlockType = "tile";
for (let i = 0; i < blockTypes.length; i++) {
    var newBlockButton = document.createElement("button");
    newBlockButton.id = blockTypes[i] + "BlockButton";
    newBlockButton.classList.add("toolButton");
    var newBlockIcon = document.createElement("img");
    newBlockIcon.src = blockTypes[i] + ".png";
    newBlockIcon.classList.add("prevent-select");
    newBlockButton.appendChild(newBlockIcon);
    blockBar.appendChild(newBlockButton);
    newBlockButton.addEventListener("click", function () {
        selectedBlockType = blockTypes[i];
        for (let i = 0; i < blockTypes.length; i++) {
            document
                .getElementById(blockTypes[i] + "BlockButton")
                .classList.remove("selected");
            document
                .getElementById(selectedBlockType + "BlockButton")
                .classList.add("selected");
        }
    });
}

class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.cameraPosition = [0, 0];
        this.cameraZoom = 1;
    }
    getMousePos(event) {
        var rect = this.canvas.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
        };
    }
    worldToScreenPoint(coordinates) {
        var xCoord =
            this.canvas.width / 2 +
            (coordinates[0] - this.cameraPosition[0]) * this.cameraZoom;
        var yCoord =
            this.canvas.height / 2 +
            (-coordinates[1] - this.cameraPosition[1]) * this.cameraZoom;
        return [xCoord, yCoord];
    }
    screenToWorldPoint(screenCoordinates) {
        var xCoord =
            screenCoordinates[0] / this.cameraZoom + this.cameraPosition[0];
        var yCoord =
            -screenCoordinates[1] / this.cameraZoom - this.cameraPosition[1];
        return [xCoord, yCoord];
    }
    drawBlock(position, filename) {
        var image = new Image();
        image.src = filename;
        this.ctx.drawImage(
            image,
            position[0] - 25 * this.cameraZoom,
            position[1] - 25 * this.cameraZoom,
            50 * this.cameraZoom,
            50 * this.cameraZoom
        );
    }
    drawSelectionBox(position, color) {
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = color;
        this.ctx.strokeRect(
            position[0] - 25 * this.cameraZoom,
            position[1] - 25 * this.cameraZoom,
            50 * this.cameraZoom,
            50 * this.cameraZoom
        );
    }
    drawOnStateOverlay(position, color, opacity) {
        this.ctx.fillStyle = `rgba(${color}, ${opacity})`;
        this.ctx.fillRect(
            position[0] - 25 * this.cameraZoom,
            position[1] - 25 * this.cameraZoom,
            50 * this.cameraZoom,
            50 * this.cameraZoom
        );
    }
    drawFrame(blocks, connections, blockTypeList) {
        for (let coordinate in blocks) {
            var split = coordinate.split(",");
            var block = blocks[coordinate];
            var stringBlockType = blockTypeList[block.blockType];
            if (!(stringBlockType == "led")) {
                this.drawBlock(
                    this.worldToScreenPoint([
                        parseInt(split[0]) * 50,
                        parseInt(split[1]) * 50,
                    ]),
                    `${block.getThisBlockType(blockTypes)}.png`
                );
                if (block.state === true) {
                    this.drawOnStateOverlay(
                        this.worldToScreenPoint([
                            parseInt(split[0]) * 50,
                            parseInt(split[1]) * 50,
                        ]),
                        "255, 255, 255",
                        "0.5"
                    );
                }
            } else if (stringBlockType == "led") {
                if (block.state == false) {
                    this.drawOnStateOverlay(
                        this.worldToScreenPoint([
                            parseInt(split[0]) * 50,
                            parseInt(split[1]) * 50,
                        ]),
                        "0, 0, 0",
                        "1"
                    );
                }
                if (block.state == true) {
                    this.drawOnStateOverlay(
                        this.worldToScreenPoint([
                            parseInt(split[0]) * 50,
                            parseInt(split[1]) * 50,
                        ]),
                        "255, 255, 255",
                        "1"
                    );
                }
            }
        }
        for (let connection of connections) {
            this.canvas_arrow(
                this.ctx,
                this.worldToScreenPoint([
                    connection[0][0] * 50,
                    connection[0][1] * 50,
                ]),
                this.worldToScreenPoint([
                    connection[1][0] * 50,
                    connection[1][1] * 50,
                ]),
                10 * this.cameraZoom,
                2 * this.cameraZoom,
                "black"
            );
        }
    }
    canvas_arrow(context, from, to, headlen, lineThickness, color) {
        context.beginPath();
        context.strokeStyle = color;
        context.lineWidth = lineThickness;
        var fromx = from[0];
        var fromy = from[1];
        var tox = to[0];
        var toy = to[1];
        var dx = tox - fromx;
        var dy = toy - fromy;
        var angle = Math.atan2(dy, dx);
        context.moveTo(fromx, fromy);
        context.lineTo(tox, toy);
        context.lineTo(
            tox - headlen * Math.cos(angle - Math.PI / 6),
            toy - headlen * Math.sin(angle - Math.PI / 6)
        );
        context.moveTo(tox, toy);
        context.lineTo(
            tox - headlen * Math.cos(angle + Math.PI / 6),
            toy - headlen * Math.sin(angle + Math.PI / 6)
        );
        context.stroke();
    }
}

class Block {
    constructor(blockType, position, state, extraProperties, pulse) {
        this.blockType = blockType;
        this.position = position;
        this.state = state;
        this.extraProperties = extraProperties;
        this.pulse = pulse;
    }
    getThisBlockType(blockTypeList) {
        return blockTypeList[this.blockType];
    }
    tick(blockTypeList, statesOfInputs) {
        // this is where the behaviour of each type of block goes
        var stringBlockType = blockTypeList[this.blockType];
        if (stringBlockType == "alternator") {
            this.state = !this.state;
        }
        if (statesOfInputs.length == 0) {
            statesOfInputs = [false];
        }
        if (stringBlockType == "and") {
            this.state = statesOfInputs.every(Boolean);
        }
        if (stringBlockType == "or") {
            this.state = statesOfInputs.some(Boolean);
        }
        if (stringBlockType == "xor") {
            this.state =
                statesOfInputs.some(Boolean) && !statesOfInputs.every(Boolean);
        }
        if (stringBlockType == "nand") {
            this.state = !statesOfInputs.every(Boolean);
        }
        if (stringBlockType == "nor") {
            this.state = !statesOfInputs.some(Boolean);
        }
        if (stringBlockType == "xnor") {
            this.state = !(
                statesOfInputs.some(Boolean) && !statesOfInputs.every(Boolean)
            );
        }
        if (stringBlockType == "flipflop") {
            if (this.extraProperties["lastInput"] == null) {
                this.extraProperties = {
                    lastInput: false,
                };
            }
            if (
                this.extraProperties["lastInput"] == false &&
                statesOfInputs.some(Boolean)
            ) {
                this.state = !this.state;
            }
            this.extraProperties["lastInput"] = statesOfInputs.some(Boolean);
        }
        if (stringBlockType == "led") {
            this.state = statesOfInputs.some(Boolean);
        }
        if (stringBlockType == "random") {
            this.state = Math.random() < 0.5;
        }
        if (stringBlockType == "sound") {
            this.state = statesOfInputs.some(Boolean);
        }
        if (stringBlockType == "tile") {
            this.state = false;
        }

        if (this.pulse) {
            if (stringBlockType == "flipflop") {
                this.state = !this.state;
            } else {
                this.state = true;
            }
        }
        this.pulse = false;
    }
}

class Simulation {
    constructor(blockTypeList) {
        this.blocks = {};
        this.connections = [];
        this.blockTypeList = blockTypeList;
    }
    addBlock(block, position, extraProperties) {
        try {
            // first delete the block at this position to ensure that wires don't get messed up
            this.deleteBlock(position);
        } catch {}
        var stringBlockType = this.blockTypeList[block.blockType];
        if (extraProperties != null) {
            block.extraProperties = extraProperties;
        } else if (extraProperties == null) {
            var defaultExtraProperties = {};
            if (stringBlockType == "flipflop") {
                defaultExtraProperties = {
                    lastInput: false,
                };
            }
            if (stringBlockType == "sound") {
                defaultExtraProperties = {
                    frequency: 440,
                    waveform: "sine",
                };
            }
            block.extraProperties = defaultExtraProperties;
        }
        block.position = position;
        this.blocks[`${position[0]},${position[1]}`] = block;
    }
    addConnection(fromCoord, toCoord) {
        // validate that this is a valid connection
        if (this.blocks[`${fromCoord[0]},${fromCoord[1]}`]) {
            if (this.blocks[`${toCoord[0]},${toCoord[1]}`]) {
                if (fromCoord[0] != toCoord[0] || fromCoord[1] != toCoord[1]) {
                    this.connections.push([fromCoord, toCoord]);
                }
            }
        }
    }
    deleteBlock(position) {
        // make sure to disconnect all connections related to this block
        // first make a copy so it doesn't become random chaos
        let connectionsReference = this.connections.slice();
        let newConnections = this.connections.slice();
        for (let i = 0; i < connectionsReference.length; i++) {
            if (
                (connectionsReference[i][0][0] == position[0] &&
                    connectionsReference[i][0][1] == position[1]) ||
                (connectionsReference[i][1][0] == position[0] &&
                    connectionsReference[i][1][1] == position[1])
            ) {
                newConnections[i] = null;
            }
        }
        // remove null from new connections and copy it to the main connections
        this.connections = [];
        for (let connection of newConnections) {
            if (connection != null) {
                this.connections.push(connection);
            }
        }
        delete this.blocks[`${position[0]},${position[1]}`];
    }
    pulseBlock(position) {
        this.blocks[`${position[0]},${position[1]}`].pulse = true;
    }
    tick() {
        // tick all blocks
        let copyOfBlocks = {};
        for (let coord in this.blocks) {
            let copiedBlock = new Block(
                this.blocks[coord].blockType,
                this.blocks[coord].position,
                this.blocks[coord].state,
                this.blocks[coord].extraProperties,
                this.blocks[coord].pulse
            );
            copyOfBlocks[coord] = copiedBlock;
        }

        for (let coord in this.blocks) {
            let statesOfInputs = [];
            let block = this.blocks[coord];
            for (let connection of this.connections) {
                if (
                    connection[1][0] == block.position[0] &&
                    connection[1][1] == block.position[1]
                ) {
                    statesOfInputs.push(
                        this.blocks[`${connection[0][0]},${connection[0][1]}`]
                            .state
                    );
                }
            }
            copyOfBlocks[coord].tick(blockTypes, statesOfInputs);
        }
        this.blocks = copyOfBlocks;
    }
}

var mousePos = [0, 0];

var renderer = new Renderer(gameCanvas);
var simulation = new Simulation(blockTypes);
var tickInterval = setInterval(function () {
    simulation.tick();
}, 0.05 * 1000);

var inputDictionary = {
    MoveUp: false,
    MoveDown: false,
    MoveLeft: false,
    MoveRight: false,
    ZoomIn: false,
    ZoomOut: false,
};

simulation.addBlock(new Block(0, [0, 0], false, {}, false), [0, 0]);

var lastFrameTime = 0;
var currentTime = 0;
var deltaTime = 0;
update();
function update() {
    window.requestAnimationFrame(update);
    currentTime = Date.now() / 1000;
    deltaTime = currentTime - lastFrameTime;

    ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
    ctx.fillStyle = "#f0f0f0";
    ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
    ctx.imageSmoothingEnabled = false;

    if (inputDictionary.MoveUp) {
        renderer.cameraPosition[1] -=
            deltaTime * 400 * (1 / renderer.cameraZoom);
    }
    if (inputDictionary.MoveDown) {
        renderer.cameraPosition[1] +=
            deltaTime * 400 * (1 / renderer.cameraZoom);
    }
    if (inputDictionary.MoveLeft) {
        renderer.cameraPosition[0] -=
            deltaTime * 400 * (1 / renderer.cameraZoom);
    }
    if (inputDictionary.MoveRight) {
        renderer.cameraPosition[0] +=
            deltaTime * 400 * (1 / renderer.cameraZoom);
    }
    if (inputDictionary.ZoomIn) {
        renderer.cameraZoom += deltaTime * 2 * renderer.cameraZoom;
    }
    if (inputDictionary.ZoomOut) {
        renderer.cameraZoom -= deltaTime * 2 * renderer.cameraZoom;
    }
    renderer.cameraZoom = Math.max(0.1, renderer.cameraZoom);

    mouseWorldPos = renderer.screenToWorldPoint(mousePos);
    mouseSnappedWorldPos = [
        Math.round(mouseWorldPos[0] / 50) * 50,
        Math.round(mouseWorldPos[1] / 50) * 50,
    ];
    mouseBlockPos = [
        mouseSnappedWorldPos[0] / 50,
        mouseSnappedWorldPos[1] / 50,
    ];

    renderer.drawFrame(simulation.blocks, simulation.connections, blockTypes);

    if (selectedTool == "pencil") {
        renderer.drawSelectionBox(
            renderer.worldToScreenPoint(mouseSnappedWorldPos),
            "black"
        );
    }
    if (selectedTool == "eraser") {
        renderer.drawSelectionBox(
            renderer.worldToScreenPoint(mouseSnappedWorldPos),
            "red"
        );
    }
    if (selectedTool == "connector") {
        firstPoint = null;
        secondPoint = null;
        if (firstConnectionCoord != null) {
            firstPoint = renderer.worldToScreenPoint([
                firstConnectionCoord[0] * 50,
                firstConnectionCoord[1] * 50,
            ]);
            if (secondConnectionCoord != null) {
                secondPoint = renderer.worldToScreenPoint([
                    secondConnectionCoord[0] * 50,
                    secondConnectionCoord[1] * 50,
                ]);
            } else {
                secondPoint = renderer.worldToScreenPoint(mouseSnappedWorldPos);
            }
            renderer.canvas_arrow(
                ctx,
                firstPoint,
                secondPoint,
                10 * renderer.cameraZoom,
                2,
                "lime"
            );
        }
    }

    ctx.font = "30px sans-serif";
    ctx.fillStyle = "black";
    ctx.fillText(`Mouse Position: ${mouseBlockPos}`, 0, gameCanvas.height - 15);

    lastFrameTime = currentTime;
}

document.addEventListener("mousemove", (event) => {
    if (!gameCanvas.matches(":hover")) {
        return;
    }
    mousePos = [
        renderer.getMousePos(event)["x"] - gameCanvas.width / 2,
        renderer.getMousePos(event)["y"] - gameCanvas.height / 2,
    ];
});
document.addEventListener("keydown", (event) => {
    if (event.key == "ArrowUp") {
        inputDictionary.MoveUp = true;
    }
    if (event.key == "ArrowDown") {
        inputDictionary.MoveDown = true;
    }
    if (event.key == "ArrowLeft") {
        inputDictionary.MoveLeft = true;
    }
    if (event.key == "ArrowRight") {
        inputDictionary.MoveRight = true;
    }
    if (event.key == "i") {
        inputDictionary.ZoomIn = true;
    }
    if (event.key == "o") {
        inputDictionary.ZoomOut = true;
    }
});
document.addEventListener("keyup", (event) => {
    if (event.key == "ArrowUp") {
        inputDictionary.MoveUp = false;
    }
    if (event.key == "ArrowDown") {
        inputDictionary.MoveDown = false;
    }
    if (event.key == "ArrowLeft") {
        inputDictionary.MoveLeft = false;
    }
    if (event.key == "ArrowRight") {
        inputDictionary.MoveRight = false;
    }
    if (event.key == "i") {
        inputDictionary.ZoomIn = false;
    }
    if (event.key == "o") {
        inputDictionary.ZoomOut = false;
    }
});
document.addEventListener("mousedown", (event) => {
    if (!gameCanvas.matches(":hover")) {
        return;
    }
    if (selectedTool == "pencil") {
        var block = new Block(
            blockTypes.indexOf(selectedBlockType),
            mouseBlockPos,
            false,
            {},
            false
        );
        simulation.addBlock(block, mouseBlockPos);
    }
    if (selectedTool == "eraser") {
        simulation.deleteBlock(mouseBlockPos);
    }
    if (selectedTool == "connector") {
        firstConnectionCoord = mouseBlockPos;
    }
    if (selectedTool == "pulse") {
        simulation.pulseBlock(mouseBlockPos);
    }
});
document.addEventListener("mouseup", (event) => {
    if (!gameCanvas.matches(":hover")) {
        return;
    }
    if (selectedTool == "connector") {
        secondConnectionCoord = mouseBlockPos;
        simulation.addConnection(firstConnectionCoord, secondConnectionCoord);
        firstConnectionCoord = null;
        secondConnectionCoord = null;
    }
});
