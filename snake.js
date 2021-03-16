import { tiny, defs } from './examples/common.js';
import { GridRenderer } from './gridrenderer.js';
// Pull these names into this module's scope for convenience:
//keeping imports for use in the future
const { vec3, vec4, color, Mat4, Light, Shape, Material, Shader, Texture, Scene } = tiny;
const { Triangle, Square, Tetrahedron, Windmill, Cube, Subdivision_Sphere } = defs;

/* Implement Game Logic for Snake */
export class Snake {
    constructor(tRate, scale) {
        // 20 x 20 grid layout
        // 1 represents wall, 0 represents empty space, 2 represents snake, 3 represents fruit
        this.GRID = [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],

        ]
        // Number of Rows
        this.ROWS = 20;
        // Number of Columns
        this.COLUMNS = 20;

        // Direction where the player is facing 
        this.DIRECTION = "RIGHT";

        // Starting row for the player
        this.STARTING_ROW = 8;

        // Starting column for the player
        this.STARTING_COLUMN = 12;

        // Coordinates of where the snakes are located
        // first entry is the head and the last entry is the tail
        this.BODY = [[this.STARTING_ROW, this.STARTING_COLUMN]];


        //we need to define where the snake is facing
        //0=up,1=right,2=down,3=left
        this.SNAKE_DIRECTION = 2;


        this.gridRenderer = new GridRenderer(this.ROWS, this.COLUMNS, scale);



        //tic rate
        this.time = 0;
        this.tickRate = tRate;
        this.paused = false;
    }

    // Returns true if the row, column is a wall or is part of the snake
    checkCollision(row, column) {
        if (row < 0 || column >= this.COLUMNS || this.GRID[row][column] == 1 || this.GRID[row][column] == 2)
            return true;
        return false;
    }

    // Called by moveSnake. If the snake will move to a square containing a fruit
    // then it will add the old tail that was popped
    growSnake(row, column, tail) {
        if (this.GRID[row][column] == 3) {
            this.GRID[tail[0]][tail[1]] = 2;
            this.GRID[row][column] = 0;
            this.BODY.push(tail);
        }
    }


    //reset the game
    resetGame() {
        this.GRID = [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],

        ]
        // Direction where the player is facing 
        this.DIRECTION = "RIGHT";

        // Starting row for the player
        this.STARTING_ROW = 8;

        // Starting column for the player
        this.STARTING_COLUMN = 12;

        // Coordinates of where the snakes are located
        // first entry is the head and the last entry is the tail
        this.BODY = [[this.STARTING_ROW, this.STARTING_COLUMN]];


        //we need to define where the snake is facing
        //0=up,1=right,2=down,3=left
        this.SNAKE_DIRECTION = 2;

        this.time = 0;
    }


    // Moves the snake to a given row and column, updates grid
    //TODO: There is some wacky behavior here with groups of 2/3
    moveSnake(row, column) {
        let head = [row, column];
        if (this.checkCollision(row, column)) {

            this.resetGame();
            return;
        }


        let tailPosition = this.BODY.length - 1;
        let old_tail_row = this.BODY[tailPosition][0];
        let old_tail_column = this.BODY[tailPosition][1];
        this.GRID[old_tail_row][old_tail_column] = 0;
        //pop at the end of this part
        this.BODY.pop();
        this.BODY.unshift(head);
        this.growSnake(row, column, [old_tail_row, old_tail_column]); // Call in case the snake moves on to a fruit
        this.GRID[row][column] = 2;
    }

    // Creates a fruit in a square that is not occupied
    generateFruit() {
        let temp_row, temp_col;
        while (1) {
            temp_row = Math.floor(Math.random() * (this.ROWS - 2) + 1);
            temp_col = Math.floor(Math.random() * (this.COLUMNS - 2) + 1);
            if (this.BODY.includes([temp_row, temp_col]) == false) {
                this.GRID[temp_row][temp_col] = 3;
                return;
            }
        }
    }


    //check to see if a fruit is in the game
    fruitExists() {
        for (let r = 0; r < this.ROWS; r++)
            for (let c = 0; c < this.COLUMNS; c++)
                if (this.GRID[r][c] == 3) {
                    return true;
                }

        return false;
    }

    processTick(dt) {
        if (!this.paused) {
            this.time += dt;
            if (this.time > this.tickRate) {
                this.time = 0;
                if (!this.fruitExists()) {
                    console.log("Spawned Fruit");
                    this.generateFruit();
                }
                this.moveSnakeForward();
            }

        }

    }

    //change the input in the game
    input(input) {
        //we have to make sure you aren't doing a 180, which would always result in a game failure
        switch (this.SNAKE_DIRECTION) {
            case 0:
                if (input == 2)
                    return;
                break;
            case 1:
                if (input == 3)
                    return;
                break;
            case 2:
                if (input == 0)
                    return;
                break;
            case 3:
                if (input == 1)
                    return;
                break;
        }
        this.SNAKE_DIRECTION = input;
    }

    displayGrid(context, program_state, identity) {

        return this.gridRenderer.displayGrid(context, program_state, identity, this.GRID);
    }

    //move the snake forward, this is the default action
    moveSnakeForward() {
        let currentRow = this.BODY[0][0];
        let currentCol = this.BODY[0][1];
        switch (this.SNAKE_DIRECTION) {
            //up
            case 0:
                currentRow -= 1;
                break;
            //right
            case 1:
                currentCol -= 1;
                break;
            //down
            case 2:
                currentRow += 1;
                break;
            //left
            case 3:
                currentCol += 1;
                break;
        }
        this.moveSnake(currentRow, currentCol);
    }

    changeTickRate(t) {
        this.tickRate = t;
    }


}
