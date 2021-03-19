import { tiny, defs } from './examples/common.js';
import { GridRenderer } from './gridrenderer.js';
// Pull these names into this module's scope for convenience:
//keeping imports for use in the future
const { vec3, vec4, color, Mat4, Light, Shape, Material, Shader, Texture, Scene } = tiny;
const { Triangle, Square, Tetrahedron, Windmill, Cube, Subdivision_Sphere } = defs;


// Class that handles game logic and contains game grid
export class Tetris {
    constructor(tRate, scale) {

        // 20 x 10 grid layout
        this.GRID = [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        ]
        // Number of Rows
        this.ROWS = 20;
        // Number of Columns
        this.COLUMNS = 10;
        // Collision Flag
        this.COLLISION = false;

        //rendering
        this.gridRenderer = new GridRenderer(this.ROWS + 1, this.COLUMNS, scale);
        this.tickRate = tRate;
        this.time = 0;
        this.paused = false;

        // sounds
        this.rotateSound = new Audio("sounds/tetris_rotate.wav");
        this.clearSound = new Audio("sounds/tetris_clear.wav");
        this.stackSound = new Audio("sounds/tetris_stack.wav");
        this.moveSound = new Audio("sounds/tetris_move.wav");
        this.resetSound = new Audio("sounds/tetris_fail.wav");

    }


    //render
    displayGrid(context, program_state, identity) {
        let displayGrid = deepCopy(this.GRID);
        //add a row at the bottom to represent the bottom of the game
        displayGrid.push([8, 8, 8, 8, 8, 8, 8, 8, 8, 8]);
        this.gridRenderer.displayGrid(context, program_state, identity, displayGrid);
    }

    //process timer
    processTick(dt) {
        if (this.paused)
            return;
       
        this.time = this.time + dt;
        if (this.time > this.tickRate) {
            this.time = 0;

            if (this.isFallingBlocks()) {
                this.translateMovingBlocksDown();
                if (this.getCollision()) {
                    this.changeBlocksToStatic();
                    let rows_to_clear = [];
                    for (let i = 0; i < this.getNumRows(); i++) {
                        if (this.checkRowIsSame(i)) {
                            rows_to_clear.push(i);
                        }
                    }
                    if (rows_to_clear.length != 0) {
                        this.clearSound.play();
                    console.log(rows_to_clear);
                        while (rows_to_clear.length > 0) {
                            let row = rows_to_clear.shift();
                            this.clearRow(row);
                            console.log("clear row " + row);
                        }
                    }
                    this.setCollision(false);
                }
            }
            else {
                if (this.checkGameOver()) {
                    this.resetGame();
                    this.resetSound.play();
                }
                // Spawn block
                this.generateShape();
            }
        }

    }


    // Accessor functions
    getCollision() {
        return this.COLLISION;
    }
    getGrid() {
        return this.GRID;
    }
    getNumRows() {
        return this.ROWS;
    }
    getNumColumns() {
        return this.COLUMNS;
    }
    setCollision(val) {
        return this.COLLISION = val;
    }

    // Checks if there are any positive (falling blocks) in the grid
    isFallingBlocks() {
        for (let r = 0; r < this.ROWS; r++) {
            for (let c = 0; c < this.COLUMNS; c++) {
                if (this.GRID[r][c] > 0)
                    return true;
            }
        }
        return false;
    }

    // Create a block at the top row
    generateBlock() {
        let block = Math.floor((Math.random() * 7) + 1)
        // For testing clear block row
        this.GRID[0][Math.floor(this.COLUMNS / 2)] = block;
    }

    //will probably refactor this to do something different
    generateShape() {
        let NUM_SHAPES = 5;
        //let shape = Math.floor((Math.random() * NUM_SHAPES) + 1)
        let shape = 2;
        let middle = Math.floor(this.COLUMNS / 2);
        switch (shape) {
            //2x2 block
            case 1:
                this.GRID[0][middle] = shape;
                this.GRID[1][middle] = shape;
                this.GRID[0][middle - 1] = shape;
                this.GRID[1][middle - 1] = shape;
                break;
            //1x4 block
            case 2:
                this.GRID[0][middle] = shape;
                this.GRID[1][middle] = shape;
                this.GRID[2][middle] = shape;
                this.GRID[3][middle] = shape;
                break;
            //l-shape
            case 3:
                this.GRID[0][middle] = shape;
                this.GRID[1][middle] = shape;
                this.GRID[1][middle - 1] = shape;
                this.GRID[1][middle - 2] = shape;
                break;
            //s-block
            case 4:
                this.GRID[0][middle] = shape;
                this.GRID[0][middle - 1] = shape;
                this.GRID[1][middle - 1] = shape;
                this.GRID[1][middle - 2] = shape;
                break;
            //t-block
            case 5:
                this.GRID[0][middle - 1] = shape;
                this.GRID[1][middle] = shape;
                this.GRID[1][middle - 1] = shape;
                this.GRID[1][middle - 2] = shape;
                break;

        }
    }

    // Shift all moving blocks (positive) down until
    // they collide with another block or reach the bottom
    //TODO: Fix blocks not all stopping together (could just be done using two for loops)
    translateMovingBlocksDown() {
        for (let r = this.ROWS - 1; r >= 0; r--) {
            for (let c = this.COLUMNS - 1; c >= 0; c--) {
                //if the block is positive
                if (this.GRID[r][c] > 0) {
                    //if there is a blank spot below this move it
                    if (!this.canMoveDown(r, c)) {
                        this.COLLISION = true;
                        return;
                    }
                }

            }
        }
        //we know no collisions will occur, so actually move the blocks
        for (let r = this.ROWS - 1; r >= 0; r--) {
            for (let c = this.COLUMNS - 1; c >= 0; c--) {
                //if the block is positive
                if (this.GRID[r][c] > 0) {
                    //if there is a blank spot below this move it
                    if (this.canMoveDown(r, c)) {
                        this.GRID[r + 1][c] = this.GRID[r][c];
                        this.GRID[r][c] = 0;
                    }
                }

            }
        }
    }

    canMoveDown(row, col) {
        if (row + 1 < this.ROWS) {
            //if the space below us is empty, we can move down
            if (this.GRID[row + 1][col] == 0)
                return true;
            if (this.GRID[row + 1][col] < 0)
                return false;
            //otherwise, lets see if that space can move down
            return this.canMoveDown(row + 1, col);
        }
        return false;
    }

    // Change all moving blocks to static (negative)
    changeBlocksToStatic() {
        for (let r = 0; r < this.ROWS; r++) {
            for (let c = 0; c < this.COLUMNS; c++) {
                if (this.GRID[r][c] > 0)
                    this.GRID[r][c] *= -1;
            }
        }
        this.stackSound.play();
    }

    // Check if all blocks at a given row is the same
    checkRowIsSame(row) {
        for (let c = 0; c < this.COLUMNS - 1; c++) {
            if (this.GRID[row][c] != this.GRID[row][c + 1] || this.GRID[row][c] == 0) {
                return false;
            }
        }
        return true;
    }

    // Clear bottom row and shift all static rows down
    // Only if all blocks at the bottom are the same color
    clearRow(row) {
        this.GRID.splice(row, 1);
        let temp_row = [];
        for (let c = 0; c < this.COLUMNS; c++) {
            temp_row.push(0);
        }
        this.GRID.unshift(temp_row);
    }



    // Translate moving blocks horizontally. Takes one argument direction (LEFT, RIGHT)
    translateMovingBlocksHorizontally(dir) {
        //deep copy the grid
        let COPYGRID = deepCopy(this.GRID);
        for (let r = 0; r < this.ROWS; r++) {
            for (let c = 0; c < this.COLUMNS; c++) {
                if (COPYGRID[r][c] > 0)
                    COPYGRID[r][c] = 0;
            }
        }

        //check if the move is legal
        for (let r = 0; r < this.ROWS; r++) {
            for (let c = 0; c < this.COLUMNS; c++) {
                if (this.GRID[r][c] > 0) {
                    if (dir == "LEFT") {
                        if (!this.canMoveHorizontally(r, c, dir)) {
                            return;
                        }
                    }
                    else if (dir == "RIGHT") {
                        if (!this.canMoveHorizontally(r, c, dir)) {
                            return;
                        }
                    }
                }
            }
        }

        //actually move the items
        for (let r = 0; r < this.ROWS; r++) {
            for (let c = 0; c < this.COLUMNS; c++) {
                if (this.GRID[r][c] > 0) {
                    if (dir == "LEFT") {
                        if (this.canMoveHorizontally(r, c, dir)) {
                            COPYGRID[r][c - 1] = this.GRID[r][c];
                        }
                    }
                    else if (dir == "RIGHT") {
                        if (this.canMoveHorizontally(r, c, dir)) {
                            COPYGRID[r][c + 1] = this.GRID[r][c];
                        }
                    }
                }
            }
        }
        this.GRID = COPYGRID;
        this.moveSound.cloneNode(true).play();
    }

    //can this block move horizontally
    canMoveHorizontally(r, c, dir) {
        if (this.GRID[r][c] <= 0)
            return false;
        if (dir == "LEFT") {
            //if we can move one to the left
            if (c - 1 >= 0) {
                //if there is no block, we can move
                if (this.GRID[r][c - 1] == 0)
                    return true;
                //or if the block next to us is positive and can move
                return this.canMoveHorizontally(r, c - 1, dir);
            }
            return false;
        }
        if (dir == "RIGHT") {
            //if we can move one to the right
            if (c + 1 < this.COLUMNS) {
                //if there is no block, we can move
                if (this.GRID[r][c + 1] == 0)
                    return true;
                //or if the block next to us is positive and can move
                return this.canMoveHorizontally(r, c + 1, dir);
            }
            return false;
        }
    }

    changeSpeed(dir, rate) {
        if (dir == "UP") {
            if (rate == 0.2)
                return 0.2;
            else
                return rate - 0.2;
        }
        else {
            if (rate == 1.0)
                return 1.0;
            else
                return rate + 0.2;
        }
    }

    //rotation
    findRotation() {
        let rotationPoint = new Point(0, 0, 0);

        for (let r = 0; r < this.ROWS; r++) {
            for (let c = 0; c < this.COLUMNS; c++) {
                if (this.GRID[r][c] > 0) {
                    rotationPoint = new Point(r, c, this.GRID[r][c]);
                    break;
                }

            }
        }



        //figure out which shape we are dealing with
        switch (rotationPoint.type) {
            // //2x2
            case 1:
                rotationPoint.c = 0;
                rotationPoint.r = 0;
                rotationPoint.valid = false;
                break;

            //1x4 block
            case 2:
                //see what orrientation it is already

                //VERTICAL:
                if (this.pointInGrid(rotationPoint.r + 1, rotationPoint.c) && this.GRID[rotationPoint.r + 1][rotationPoint.c] == 2) {
                    rotationPoint.r += 1.5;
                    rotationPoint.c -= 0.5;
                    break;
                }
                //HORIZONTAL:
                else {
                    rotationPoint.r -= 0.5;
                    rotationPoint.c += 1.5;
                    break;
                }

            // l-shape
            case 3:

                // Horizontal
                // 0 0 0
                // 0 0 3
                // 3 3 3
                console.log("L Shape");
                if (this.pointInGrid(rotationPoint.r - 1, rotationPoint.c + 1) && this.GRID[rotationPoint.r - 1][rotationPoint.c + 1] == 0) {
                    rotationPoint.r -= 1;
                    rotationPoint.c += 1;
                    break;
                }
                //
                //000
                //111
                //100
                //000
                else if (this.pointInGrid(rotationPoint.r, rotationPoint.c + 1) && this.GRID[rotationPoint.r][rotationPoint.c + 1] == 0) {
                    rotationPoint.r += 0;
                    rotationPoint.c += 1;
                }
                else {
                    rotationPoint.valid = false;
                }




            // s-shape
            case 4:
                // VERTICAL:
                if (this.pointInGrid(rotationPoint.r, rotationPoint.c + 1) && this.GRID[rotationPoint.r][rotationPoint.c + 1] != 4) {
                    rotationPoint.r -= 0.5;
                    rotationPoint.c -= 0.5;
                    break;
                }
                else {
                    //rotationPoint.r += 1;
                    //rotationPoint.c += 1;
                    break;
                }

            //t-block
            case 5:
                //000
                //010
                //111
                if (this.pointInGrid(rotationPoint.r - 1, rotationPoint.c + 1) && this.GRID[rotationPoint.r - 1][rotationPoint.c] != 4) {
                    //rotation point will be the first block we find
                    break;
                }
                else {
                    //rotationPoint.r += 1;
                    //rotationPoint.c += 1;
                    break;
                }


        }
        console.log("Rotation Point: (" + rotationPoint.r + "," + rotationPoint.c + ")");
        return rotationPoint;


    }


    rotate() {
        if (this.paused)
            return;

        //find rotation point
        let rotationPoint = this.findRotation();
        console.log("Rotation Point: (" + rotationPoint.r + "," + rotationPoint.c + ")");

        if (!rotationPoint.valid)
            return;

        //deep copy it
        let COPYGRID = deepCopy(this.GRID);
        for (let r = 0; r < this.ROWS; r++) {
            for (let c = 0; c < this.COLUMNS; c++) {
                if (COPYGRID[r][c] > 0)
                    COPYGRID[r][c] = 0;
            }
        }
        //rotation bit
        for (let r = 0; r < this.ROWS; r++) {
            for (let c = 0; c < this.COLUMNS; c++) {
                if (this.GRID[r][c] > 0) {
                    //apply the rotation

                    let rotatedC = (c - rotationPoint.c) * Math.cos(Math.PI / 2);
                    rotatedC -= (r - rotationPoint.r) * Math.sin(Math.PI / 2);
                    rotatedC += rotationPoint.c;
                    rotatedC = Math.round(rotatedC);

                    let rotatedR = (c - rotationPoint.c) * Math.sin(Math.PI / 2);
                    rotatedR += (r - rotationPoint.r) * Math.cos(Math.PI / 2);
                    rotatedR += rotationPoint.r;
                    rotatedR = Math.round(rotatedR);

                    //make sure it is valid to set this new position
                    if (!this.pointInGrid(rotatedR, rotatedC) || COPYGRID[rotatedR][rotatedC] < 0) {
                        return;
                    }

                    COPYGRID[rotatedR][rotatedC] = this.GRID[r][c];

                }
            }
        }
        this.rotateSound.cloneNode(true).play();
        this.GRID = COPYGRID;
    }

    pointInGrid(r, c) {
        let rInGrid = r >= 0 && r < this.ROWS;
        let cInGrid = c >= 0 && c < this.COLUMNS;
        return rInGrid && cInGrid;
    }


    changeTickRate(t) {
        this.tickRate = t;
    }

    checkGameOver() {
        for (let c = 0; c < this.COLUMNS; c++) {
            let flag = true;
            for (let r = this.ROWS-1; r >= 1; r--) {
                if (this.GRID[r][c] == 0) {
                    flag = false;
                    break;
                }
            }
            if (flag) {
                return true;
            }
        }
        return false;
    }

    resetGame() {
        this.GRID = [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        ];
    }
}






const deepCopy = (arr) => {
    let copy = [];
    arr.forEach(elem => {
        if (Array.isArray(elem)) {
            copy.push(deepCopy(elem))
        } else {
            if (typeof elem === 'object') {
                copy.push(deepCopyObject(elem))
            } else {
                copy.push(elem)
            }
        }
    })
    return copy;
}

// Helper function to deal with Objects
const deepCopyObject = (obj) => {
    let tempObj = {};
    for (let [key, value] of Object.entries(obj)) {
        if (Array.isArray(value)) {
            tempObj[key] = deepCopy(value);
        } else {
            if (typeof value === 'object') {
                tempObj[key] = deepCopyObject(value);
            } else {
                tempObj[key] = value
            }
        }
    }
    return tempObj;
}





class Point {
    constructor(rr, cc, t) {
        this.r = rr;
        this.c = cc;
        this.type = t;
        this.valid = true;
    }
}


