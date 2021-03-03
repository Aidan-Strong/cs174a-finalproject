import { tiny, defs } from './examples/common.js';

// Pull these names into this module's scope for convenience:
//keeping imports for use in the future
const { vec3, vec4, color, Mat4, Light, Shape, Material, Shader, Texture, Scene } = tiny;
const { Triangle, Square, Tetrahedron, Windmill, Cube, Subdivision_Sphere } = defs;

export class Tetris extends Scene {
    constructor() {                  // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();


        //initialization
        this.grid = [

            [1, 2, 3, 4, 5, 6, 7],
            [1, 2, 3, 4, 5, 6, 7],
            [1, 2, 3, 4, 5, 6, 7],
            [1, 2, 3, 4, 5, 6, 7],
        ]
        this.gR = new GridRenderer(this.grid.length, this.grid[0].length, this.grid, 3);
        this.time = 0;

    }
    make_control_panel() {                                 // make_control_panel(): Sets up a panel of interactive HTML elements
        //put input controller here
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
            program_state.set_camera(Mat4.translation(-10, 10, -50));
        }
        program_state.projection_transform = Mat4.perspective(Math.PI / 4, context.width / context.height, 1, 100);

        // *** Lights: ***
        const t = this.t = program_state.animation_time / 1000, dt = program_state.animation_delta_time / 1000;


        const light_position = Mat4.rotation(0, 1, 0, 0).times(vec4(0, -1, 1, 0));
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000000)];



        //simple animation
        this.time = this.time + dt;
        //defined in ticks/second
        let tickRate = 5;
        if (this.time > 1 / tickRate) {
            this.time = 0;

            let newGrid = this.grid;
            for (let r = 0; r < this.grid.length; r++) {
                for (let c = 0; c < this.grid[0].length; c++) {

                    this.grid[r][c] = (this.grid[r][c] + 1) % 7;



                }
            }
            this.grid = newGrid;
            this.gR.updateGrid(this.grid);
        }
        this.gR.displayGrid(context, program_state, Mat4.identity);
    }
}




class GridRenderer {


    constructor(r, c, g, scale) {
        this.NUM_ROWS = r;
        this.NUM_COLS = c;
        this.grid = g;
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
    };

    //change the grid state
    updateGrid(g) {
        this.grid = g;
    }

    displayGrid(context, program_state, identity) {

        let cube_transform;
        let cubeGap = 2.5;

        for (let r = 0; r < this.NUM_ROWS; r++) {
            for (let c = 0; c < this.NUM_COLS; c++) {
                //render a cube in the correct positions

                //if we have a non-empty spot
                if (this.grid[r][c] != 0) {

                    cube_transform = Mat4.identity();
                    //find the correct position
                    cube_transform = cube_transform.times(Mat4.translation(this.cubeSize * c, this.cubeSize * -r, 0));
                    //the higher the cubeGap, the larger the gap, with 1 being no gap

                    cube_transform = cube_transform.times(Mat4.scale(this.cubeSize / cubeGap, this.cubeSize / cubeGap, this.cubeSize / cubeGap));

                    //get the correct color
                    let boxColor = this.getColor(this.grid[r][c]);

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
        switch (index) {
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