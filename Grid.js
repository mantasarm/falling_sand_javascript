function array2D(rows, cols) {
    let arr = [];
    for (let i = 0; i < rows; i++) {
        arr.push(Array(cols));
    }
    return arr;
}

class Grid {
    constructor(rows, cols) {
        this.grid = array2D(rows, cols);
        this.cellSize = width / rows;

        this.brushSize = 20;

        // Sitame masyve kaupiame visus possible swaps
        this.swaps = [];

        this.img = createImage(rows, cols);

        this.rows = rows;
        this.cols = cols;

        this.updateGrid = true;
        this.renderHeatMap = false;

        for (let i = 0; i < this.grid.length; i++) {
            for (let j = 0; j < this.grid[0].length; j++) {
                this.grid[i][j] = airElement();
            }
        }

        // Cia simulation tuos pilkus krastus nustatome į
        for (let i = 0; i < this.grid.length; i++) {
            this.grid[i][0] = solidElement();
            this.grid[i][this.grid.length - 1] = solidElement();
        }
        for (let j = 0; j < this.grid.length; j++) {
            this.grid[0][j] = solidElement();
            this.grid[this.grid.length - 1][j] = solidElement();
        }

        this.selectedElement = sandElement();

       canvas.getTexture(this.img).setInterpolation(NEAREST, NEAREST);
    }

    render() {
        this.img.loadPixels();
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                let c = this.grid[i][j].color;
                
                if (this.renderHeatMap) {
                    if (this.grid[i][j].temp >= 0) {
                        let tColor = map(this.grid[i][j].temp, 0, 1000, 0, 255);
                        c = color(tColor, 255 - tColor, 0, 120);
                    } else {
                        let tColor = map(this.grid[i][j].temp, 0, -1000, 0, 255);
                        c = color(0, 255 - tColor, tColor, 120);
                    }
                }

                this.img.set(i, j, c);
            }
        }
        this.img.updatePixels();
        
        image(this.img, 0, 0, width, height);
    }

    update() {
        if (this.updateGrid) {
            for (let i = 0; i < this.rows; i++) {
                for (let j = 0; j < this.cols; j++) {

                    if (i > 0 && j > 0 && i < this.grid.length - 1 && j < this.grid[0].length - 1) {
                        // Cia gauname vidurki visu aplinkiniu elementu temperatura ir padaliname is medziagos silumos laidumo
                        this.grid[i][j].temp = (this.grid[i - 1][j].temp + this.grid[i + 1][j].temp + this.grid[i][j - 1].temp + this.grid[i][j + 1].temp) / this.grid[i][j].heatSpreadFactor;
                        
                        // Sita reikalinga, kad temperatura galetu nukristi atgal iki 0, kitaip ji tik priartetu prie 0
                        if (this.grid[i][j].temp > -0.1 && this.grid[i][j].temp < 0.1) {
                            this.grid[i][j].temp = 0;
                        }

                        // Behaviour aprasymas kiekvienos medziagos
                        switch (this.grid[i][j].element) {
                            case Element.Sand:
                                this.fallingSand(i, j);
                                break;

                            case Element.Water:
                                if (this.grid[i][j].temp > 200) {
                                    let temp  = this.grid[i][j].temp;
                                    this.grid[i][j] = steamElement();
                                    this.grid[i][j].temp = temp;
                                } else if (this.grid[i][j].temp < 0) {
                                    let temp  = this.grid[i][j].temp;
                                    this.grid[i][j] = iceElement();
                                    this.grid[i][j].temp = temp;
                                } else {
                                    this.liquidMovement(i, j);
                                }

                                break;
                            
                            case Element.Smoke:
                                this.gasMovement(i, j);
                                break;

                            case Element.Fire:
                                this.fireMovement(i, j);
                                this.grid[i][j].temp = 1000;
                                break;
                            
                            case Element.Steam:
                                if (this.grid[i][j].temp < 200 && (random() < 0.001 || this.grid[i][j].temp < 0)) {
                                    let temp  = this.grid[i][j].temp;
                                    this.grid[i][j] = waterElement();
                                    this.grid[i][j].temp =  temp;
                                } else {
                                    this.gasMovement(i, j);
                                }

                                break;
                            
                            case Element.Coal:
                                this.burnable(i, j, 510, 650, 0.05, color(70, 30, 30, 255));
                                break;

                            case Element.Wood:
                                this.burnable(i, j, 282, 350, 0.08, color(30, 24, 12, 255));
                                break;

                            case Element.SawDust:
                                this.fallingSand(i, j);
                                this.burnable(i, j, 282, 350, 0.08, color(42, 32, 18, 255));
                                break;

                            case Element.ColdFire:
                                this.fireMovement(i, j);
                                this.grid[i][j].temp = -1000;
                                break;

                            case Element.Ice:
                                if (this.grid[i][j].temp >= 0 && random() < 0.25) {
                                    this.grid[i][j] = waterElement();
                                }
                        }
                    } else if (j == 0 && i > 0 && i < this.grid.length - 1) {
                        this.grid[i][j].temp = (this.grid[i - 1][j].temp + this.grid[i + 1][j].temp + this.grid[i][j + 1].temp) / (this.grid[i][j].heatSpreadFactor * 3 / 4);
                    } else if (j == this.grid[0].length - 1 && i > 0 && i < this.grid.length - 1) {
                        this.grid[i][j].temp = (this.grid[i - 1][j].temp + this.grid[i + 1][j].temp + this.grid[i][j - 1].temp) / (this.grid[i][j].heatSpreadFactor * 3 / 4);
                    } else if (i == 0 && j > 0 && j < this.grid[0].length - 1) {
                        this.grid[i][j].temp = (this.grid[i + 1][j].temp + this.grid[i][j - 1].temp + this.grid[i][j + 1].temp) / (this.grid[i][j].heatSpreadFactor * 3 / 4);
                    } else if (i == this.grid.length - 1 && j > 0 && j < this.grid[0].length - 1) {
                        this.grid[i][j].temp = (this.grid[i - 1][j].temp + this.grid[i][j - 1].temp + this.grid[i][j + 1].temp) / (this.grid[i][j].heatSpreadFactor * 3 / 4);
                    } else if (i == 0 && j == 0) {
                        this.grid[i][j].temp = (this.grid[i + 1][j].temp + this.grid[i][j + 1].temp + this.grid[i + 1][j + 1].temp) / (this.grid[i][j].heatSpreadFactor * 3 / 4);
                    } else if (i == this.grid.length - 1 && j == 0) {
                        this.grid[i][j].temp = (this.grid[i - 1][j].temp + this.grid[i][j + 1].temp + this.grid[i - 1][j + 1].temp) / (this.grid[i][j].heatSpreadFactor * 3 / 4);
                    } else if (i == 0 && j == this.grid[0].length - 1) {
                        this.grid[i][j].temp = (this.grid[i + 1][j].temp + this.grid[i][j - 1].temp + this.grid[i + 1][j - 1].temp) / (this.grid[i][j].heatSpreadFactor * 3 / 4);
                    }  else if (i == this.grid.length - 1 && j == this.grid[0].length - 1) {
                        this.grid[i][j].temp = (this.grid[i - 1][j].temp + this.grid[i][j - 1].temp + this.grid[i - 1][j - 1].temp) / (this.grid[i][j].heatSpreadFactor * 3 / 4);
                    }
                }
            }

            shuffleArray(this.swaps);
            for (const swap of this.swaps) {
                if (this.grid[swap.i1][swap.j1].element == swap.startElement && this.grid[swap.i2][swap.j2].element == swap.destElement) {
                    this.swapCells(swap.i1, swap.j1, swap.i2, swap.j2);
                }
            }
            this.swaps = [];
        }
    }

    fallingSand(i, j) {
        if (!this.fallDown(i, j, [State.Liquid, State.Gas, State.Plasma])) {
            this.fallSides(i, j, [State.Liquid, State.Gas, State.Plasma]);
        }
    }

    liquidMovement(i, j) {
        if (!this.fallDown(i, j, [State.Gas])) {
            if (!this.fallSides(i, j, [State.Gas, State.Plasma])) {
                this.moveSides(i, j, [State.Gas, State.Plasma]);
            }
        }
    }

    gasMovement(i, j) {
        if (!this.riseUp(i, j, [State.Gas, State.Plasma])) {
            this.moveSides(i, j, [State.Gas, State.Plasma]);
        }
    }

    fireMovement(i, j) {
        this.grid[i][j].lifetime -= random(1, 4);

        if (this.grid[i][j].lifetime <= 0) {
            this.grid[i][j] = airElement();
        } else if (!this.riseUpEl(i, j, [Element.Air])) {
            this.moveSides(i, j, [State.Gas]);
        }
    }

    // Sia funkcija naudojame, kad medziagos galetu sudegti
    burnable(i, j, ignitionTemp, burnTemp, rate, burnColor) {
        if (this.grid[i][j].temp >= ignitionTemp && !this.grid[i][j].active) {
            this.grid[i][j].active = true;
            this.grid[i][j].color = burnColor;
        } else if (this.grid[i][j].active && this.grid[i][j].lifetime > 0) {
            this.grid[i][j].lifetime -= random(1, 4);
            this.grid[i][j].temp = burnTemp;
            this.burn_with_fire(i, j, rate);
        } else if (this.grid[i][j].lifetime <= 0) {
            this.grid[i][j] = smokeElement();
            this.grid[i][j].temp = burnTemp;
        }
    }

    // Medziagos kurios skleistu is saves ugnies elements
    burn_with_fire(i, j, rate) {
        if (this.grid[i + 1][j].element == Element.Air && random() < rate) {
            this.grid[i + 1][j] = fireElement();
        }
        if (this.grid[i - 1][j].element == Element.Air && random() < rate) {
            this.grid[i - 1][j] = fireElement();
        }
        if (this.grid[i][j + 1].element == Element.Air && random() < rate) {
            this.grid[i][j + 1] = fireElement();
        }
        if (this.grid[i][j - 1].element == Element.Air && random() < rate) {
            this.grid[i][j - 1] = fireElement();
        }
    }


    riseUp(i, j, elementState) {
        if (elementState.includes(this.grid[i][j - 1].state) && this.grid[i][j].element != this.grid[i][j - 1].element) {
            this.addSwap(i, j, i, j - 1);
            return true;
        }
        return false;
    }

    riseUpEl(i, j, element) {
        if (element.includes(this.grid[i][j - 1].element) && this.grid[i][j].element != this.grid[i][j - 1].element) {
            this.addSwap(i, j, i, j - 1);
            return true;
        }
        return false;
    }

    fallDown(i, j, elementState) {
        if (elementState.includes(this.grid[i][j + 1].state) && this.grid[i][j].element != this.grid[i][j + 1].element) {
            this.addSwap(i, j, i, j + 1);
            return true;
        }
        return false;
    }

    fallSides(i, j, elementState) {
        let right = elementState.includes(this.grid[i + 1][j + 1].state) && elementState.includes(this.grid[i + 1][j].state);
        let left = elementState.includes(this.grid[i - 1][j + 1].state) && elementState.includes(this.grid[i - 1][j].state);

        if (right && left) {
            if (random([true, false])) {
                this.addSwap(i, j, i + 1, j + 1);
            } else {
                this.addSwap(i, j, i - 1, j + 1);
            }
            return true;
        } else if (right) {
            this.addSwap(i, j, i + 1, j + 1);
            return true;
        } else if (left) {
            this.addSwap(i, j, i - 1, j + 1);
            return true;
        }
        return false;
    }

    moveSides(i, j, elementState) {
        let right = this.checkRight(i, j, elementState);
        let left = this.checkLeft(i, j, elementState);

        if (right > 0 || left > 0) {
            if (right > 0 && left > 0) {
                if (random([true, false])) {
                    this.addSwap(i, j, i + right, j);
                } else {
                    this.addSwap(i, j, i - left, j);
                }
                return true;
            } else if (right > 0) {
                this.addSwap(i, j, i + right, j);
                return true;
            } else if (left > 0) {
                this.addSwap(i, j, i - left, j);
                return true;
            }
        }
        return false;
    }

    // Gauname kiek langeliu laisvu yra i desine elemento
    checkRight(i, j, elementState) {
        if (this.grid[i][j].element != this.grid[i + 1][j].element) {
            for (let r = 1; r <= this.grid[i][j].spreadFactor; r++) {

                if (random(0, 1) < 1 / this.grid[i][j].spreadFactor && r != 1) {
                    return r - 1;
                }

                if (!elementState.includes(this.grid[i + r][j].state)) {
                    return r - 1;
                }
            }

            return this.grid[i][j].spreadFactor;
        }

        return 0;
    }

    // Gauname kiek langeliu laisvu yra i kaire elemento
    checkLeft(i, j, elementState) {
        if (this.grid[i][j].element != this.grid[i - 1][j].element) {
            for (let l = 1; l <= this.grid[i][j].spreadFactor; l++) {

                if (random(0, 1) < 1 / this.grid[i][j].spreadFactor && l != 1) {
                    return l - 1;
                }

                if (!elementState.includes(this.grid[i - l][j].state)) {
                    return l - 1;
                }
            }
            return this.grid[i][j].spreadFactor;
        }

        return 0;
    }

    addSwap(i1, j1, i2, j2) {
        this.swaps.push(new Swap(i1, j1, i2, j2, this.grid[i1][j1].element, this.grid[i2][j2].element));
    }

    modifyCells(x, y, cell) {
        for (let i = 0; i < this.brushSize; i++) {
            for (let j = 0; j < this.brushSize; j++) {
                if (dist(i, j, this.brushSize/2, this.brushSize/2) < this.brushSize/2) {
                    this.modifyCell(x - Math.round(this.brushSize / 2) + i, y - Math.round(this.brushSize / 2) + j, cell);
                }
            }
        }
    }

    modifyCell(x, y, cell) {
        if (x > 0 && y > 0 && x < this.grid.length - 1 && y < this.grid.length - 1) {
            this.grid[x][y] = cell.copy();
        }
    }

    swapCells(i1, j1, i2, j2) {
        let temp = this.grid[i1][j1].copy();
        this.grid[i1][j1] = this.grid[i2][j2].copy();
        this.grid[i2][j2] = temp;
    }

    getCellSize() {
        return this.cellSize;
    }

    changeGridSize(rows, cols) {
        this.grid = array2D(parseInt(rows), parseInt(cols));

        this.cellSize = width / rows;

        this.swaps = [];

        this.img = createImage(rows, cols);

        this.rows = rows;
        this.cols = cols;

        for (let i = 0; i < this.grid.length; i++) {
            for (let j = 0; j < this.grid[0].length; j++) {
                this.grid[i][j] = airElement();
            }
        }

        for (let i = 0; i < cols; i++) {
            this.grid[i][0] = solidElement();
            this.grid[i][this.grid.length - 1] = solidElement();
        }

        for (let j = 0; j < rows; j++) {
            this.grid[0][j] = solidElement();
            this.grid[this.grid.length - 1][j] = solidElement();
        }

        canvas.getTexture(this.img).setInterpolation(NEAREST, NEAREST);
    }
}

class Swap {
    constructor(i1, j1, i2, j2, startElement, destElement) {
        this.i1 = i1;
        this.j1 = j1;
        this.i2 = i2;
        this.j2 = j2;
        this.startElement = startElement;
        this.destElement = destElement;
    }
}

function shuffleArray(arr) {
    arr.sort(() => Math.random() - 0.5);
}