var cameraPosition = [0, 0];
var cameraZoom = 1;
var gameArea = document.getElementById("gameArea");
gameArea.innerHTML += `<canvas id="gameCanvas" width=${gameArea.offsetWidth} height=${gameArea.offsetHeight}></canvas>`;
var gameCanvas = document.getElementById("gameCanvas");

function getMousePos(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
    };
}
function worldToScreenPoint(coordinates) {
    var xCoord =
        gameCanvas.width / 2 +
        (coordinates[0] - cameraPosition[0]) * cameraZoom;
    var yCoord =
        gameCanvas.height / 2 +
        (-coordinates[1] - cameraPosition[1]) * cameraZoom;
    return [xCoord, yCoord];
}
function screenToWorldPoint(screenCoordinates) {
    var xCoord = screenCoordinates[0] / cameraZoom + cameraPosition[0];
    var yCoord = -screenCoordinates[1] / cameraZoom - cameraPosition[1];
    return [xCoord, yCoord];
}
function drawBlock(position, filename) {
    ctx = gameCanvas.getContext("2d");
    var image = new Image();
    image.src = filename;
    ctx.drawImage(
        image,
        position[0] - 25 * cameraZoom,
        position[1] - 25 * cameraZoom,
        50 * cameraZoom,
        50 * cameraZoom
    );
}
function drawSelectionBox(position, color) {
    ctx = gameCanvas.getContext("2d");
    ctx.strokeStyle = color;
    ctx.strokeRect(
        position[0] - 25 * cameraZoom,
        position[1] - 25 * cameraZoom,
        50 * cameraZoom,
        50 * cameraZoom
    );
}
export function setCameraPositionAndZoom(newPosition, newZoom) {
    cameraPosition = newPosition;
    cameraZoom = newZoom;
}

export function drawFrame(blocks) {
    // ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
    var ctx = gameCanvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    for (let coordinate in blocks) {
        // console.log(coordinate);
        var split = coordinate.split("-");
        ctx.strokeStyle = "black";
        ctx.strokeRect(0, 0, 50, 50);
        // drawBlock(
        //     worldToScreenPoint([
        //         parseInt(split[0]) * 50,
        //         parseInt(split[1]) * 50,
        //     ]),
        //     "tile.png"
        // );
    }
}
