import { tiny, defs } from './examples/common.js';

// Pull these names into this module's scope for convenience:
//keeping imports for use in the future
const { vec3, vec4, color, Mat4, Light, Shape, Material, Shader, Texture, Scene } = tiny;
const { Triangle, Square, Tetrahedron, Windmill, Cube, Subdivision_Sphere } = defs;

export class Tetris extends Scene {
    constructor() {                  // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();


        //initialization
        this.game_manager = new GameManager();
        console.log(this.game_manager);
        this.gR = new GridRenderer(this.game_manager.getNumRows(), this.game_manager.getNumColumns(), 3);
        console.log(this.gR);
        this.time = 0;
        this.tickRate = 1.0;

    }
    make_control_panel() {                                 // make_control_panel(): Sets up a panel of interactive HTML elements
        this.key_triggered_button("Move right", ["k"], () => { this.game_manager.translateMovingBlocksHorizontally("RIGHT") });
        this.key_triggered_button("Move left", ["j"], () => { this.game_manager.translateMovingBlocksHorizontally("LEFT") });
        this.key_triggered_button("Speed up", ["u"], () => { this.tickRate = this.game_manager.changeSpeed("UP", this.tickRate) });
        this.key_triggered_button("Slow down", ["n"], () => { this.tickRate = this.game_manager.changeSpeed("DOWN", this.tickRate) })
        this.key_triggered_button("Rotate", ["i"], () => { this.game_manager.rotate() });
    }
    display(context, program_state) {                                                // display():  Called once per frame of animation


        // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());

            // Define the global camera and projection matrices, which are stored in program_state.  The camera
            // matrix follows the usual format for transforms, but with opposite values (cameras exist as 
            // inverted matrices).  The projection matrix follows an unusual format and determines how depth is 
            // treated when projecting 3D points onto a plane.  The Mat4 functions perspective() and
            // orthographic() automatically generate valid matrices for one.  The input arguments of
            // perspective() are field of view, aspect ratio, and distances to the near plane and far plane.
            program_state.set_camera(Mat4.translation(-10, 30, -95));
        }
        program_state.projection_transform = Mat4.perspective(Math.PI / 4, context.width / context.height, 1, 100);

        // *** Lights: ***
        const t = this.t = program_state.animation_time / 1000, dt = program_state.animation_delta_time / 1000;


        const light_position = Mat4.rotation(0, 1, 0, 0).times(vec4(0, -1, 1, 0));
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000000)];


        // *** Game Logic ***
        this.time = this.time + dt;

        if (this.time > this.tickRate) {
            this.time = 0;

            if (this.game_manager.isFallingBlocks()) {
                this.game_manager.translateMovingBlocksDown();
                if (this.game_manager.getCollision()) {
                    this.game_manager.changeBlocksToStatic();
                    for (let i = 0; i < 4; i++) {
                        if (this.game_manager.checkRowIsSame(this.game_manager.getNumRows() - 1)) {
                            this.game_manager.clearBottomRow();
                        }
                    }
                    this.game_manager.setCollision(false);
                }
            }
            else {
                // Spawn block
                this.game_manager.generateShape();
            }
        }
        this.gR.displayGrid(context, program_state, Mat4.identity, this.game_manager.getGrid());
    }
}

// Class that handles game logic and contains game grid
class GameManager {
    constructor() {
        // 20 x 7 grid layout
        this.GRID = [
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0]
        ]
        // Number of Rows
        this.ROWS = 20;
        // Number of Columns
        this.COLUMNS = 7;
        // Collision Flag
        this.COLLISION = false;
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
        // let shape = Math.floor((Math.random() * NUM_SHAPES) + 1)
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

    // Clear bottom row and shift down all static rows down
    // Only if all blocks at the bottom are the same color
    clearBottomRow() {
        if (this.checkRowIsSame(this.ROWS - 1)) {
            for (let r = this.ROWS - 2; r >= 0; r--) {
                for (let c = 0; c < this.COLUMNS; c++) {
                    if (this.GRID[r][c] <= 0)
                        this.GRID[r + 1][c] = this.GRID[r][c];
                }
            }
            for (let c = 0; c < this.COLUMNS; c++) {
                this.GRID[0][c] = 0
            }
        }
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


    }

    //can this block move horizontally
    canMoveHorizontally(r, c, dir) {
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
            //if we can move one to the left
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
            // case 1:
            //     rotationPoint.c = 0;
            //     rotationPoint.r = 0;


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
        this.GRID = COPYGRID;
    }

    pointInGrid(r, c) {
        let rInGrid = r >= 0 && r < this.ROWS;
        let cInGrid = c >= 0 && c < this.COLUMNS;
        return rInGrid && cInGrid;
    }
}

class GridRenderer {


    constructor(r, c, scale) {
        this.NUM_ROWS = r;
        this.NUM_COLS = c;
        this.cubeSize = scale;


        //now define the actual shapes / materials we are rendering
        this.shapes = {
            'box': new Cube(),
        };

        // *** Materials: *** 
        const phong = new defs.Phong_Shader();
        this.materials = {
            plastic: new Material(phong,
                { ambient: .2, diffusivity: 1, specularity: .5, color: color(.9, .5, .9, 1) }),
        };
    }


    displayGrid(context, program_state, identity, grid) {

        let cube_transform;
        let cubeGap = 2.5;

        for (let r = 0; r < this.NUM_ROWS; r++) {
            for (let c = 0; c < this.NUM_COLS; c++) {
                //render a cube in the correct positions

                //if we have a non-empty spot
                if (grid[r][c] != 0) {

                    cube_transform = Mat4.identity();
                    //find the correct position
                    cube_transform = cube_transform.times(Mat4.translation(this.cubeSize * c, this.cubeSize * -r, 0));
                    //the higher the cubeGap, the larger the gap, with 1 being no gap

                    cube_transform = cube_transform.times(Mat4.scale(this.cubeSize / cubeGap, this.cubeSize / cubeGap, this.cubeSize / cubeGap));

                    //get the correct color
                    let boxColor = this.getColor(grid[r][c]);

                    //draw
                    this.shapes.box.draw(context, program_state, cube_transform, this.materials.plastic.override(boxColor));
                }

            }
        }

        // //draw the bottom row
        cube_transform = Mat4.identity();
        cube_transform = cube_transform.times(Mat4.translation(this.NUM_COLS * this.cubeSize / cubeGap, -1 * this.NUM_ROWS * this.cubeSize, 0));
        cube_transform = cube_transform.times(Mat4.scale((this.NUM_COLS + 4) * this.cubeSize / cubeGap, 1, 1));
        this.shapes.box.draw(context, program_state, cube_transform, this.materials.plastic.override(color(1, 1, 1, 1)));

    }

    getColor(index) {
        switch (Math.abs(index)) {
            case 1:
                return color(1, 0, 0, 1);
            case 2:
                return color(0, 1, 0, 1);
            case 3:
                return color(0, 0, 1, 1);
            case 4:
                return color(0, 1, 1, 1);
            case 5:
                return color(1, 1, 0, 1);
            case 6:
                return color(1, 0, 1, 1);
            case 7:
                return color(0.1, 0.75, 0.5, 1);
            default:
                return color(1, 1, 1, 1);
        }
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


