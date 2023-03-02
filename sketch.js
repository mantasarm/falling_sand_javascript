let grid;
let canvas;

let fpsP;

let gridSizeList;
let gridSize = 400;

let simSpeedList;
let simSpeed = 1;

function setup() {
  canvas = createCanvas(700, 700, WEBGL);
  canvas.parent('sketch-holder');
  canvas.attribute('willReadFrequently', true);

  grid = new Grid(200, 200, WEBGL);

  fpsP = document.getElementById("fpsP");
  gridSizeList = document.getElementById("gridSizes");
  simSpeedList = document.getElementById("simSpeeds");

  frameRate(60);
}

function draw() {
  background(0);

  detectSimSpeedcahnge();
  detectGridSizeChanges();
  
  for (let i = 0; i < simSpeed; i++) {
    grid.update();
  }

  translate(-width/2, -height/2)

  grid.render();

  if (mouseIsPressed && mouseX >= 0 && mouseY >= 0 && mouseX <= width && mouseY <= height) {
    grid.modifyCells(getMouseInGrid().x, getMouseInGrid().y, grid.selectedElement);
  }

  fpsP.innerHTML = 'fps: ' + Math.round(frameRate());

  noFill();
  stroke(255);
  ellipse(mouseX, mouseY, grid.brushSize * grid.cellSize, grid.brushSize * grid.cellSize, 50);
}

function detectGridSizeChanges() {
  if (gridSize != gridSizeList.value) {
    gridSize = gridSizeList.value;
    grid.changeGridSize(gridSize, gridSize);
  }
}

function detectSimSpeedcahnge() {
  if (simSpeed != simSpeedList.value) {
    simSpeed = simSpeedList.value;
  }
}

function getMouseInGrid() {
  return createVector(Math.round(mouseX / grid.getCellSize()), Math.round(mouseY / grid.getCellSize()));
}

function mouseWheel(event) {
  grid.brushSize += (event.delta / deltaTime);

  if (grid.brushSize < 2) {
    grid.brushSize = 2;
  }

  if (grid.brushSize > grid.grid.length) {
    grid.brushSize = grid.grid.length;
  }

  document.getElementById("brushSizeSlider").value = map(grid.brushSize, 2, grid.grid.length, 0, 1000);
}

function keyPressed() {
  if (key == ' ') {
    pausePlay();
  }
  if (key == 'h') {
    document.getElementById("toggleHeatMap").checked = !document.getElementById("toggleHeatMap").checked;
    toggleHeatMap();
  }
}