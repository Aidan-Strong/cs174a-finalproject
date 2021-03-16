import { tiny, defs } from './examples/common.js';
import { Snake } from './snake.js';
import { Tetris } from './tetris.js';
import { Shape_From_File } from './examples/obj-file-demo.js';
// Pull these names into this module's scope for convenience:
//keeping imports for use in the future

const { vec3, vec4, color, Mat4, Light, Shape, Material, Shader, Texture, Scene } = tiny;

export class ArcadeScene extends Scene {
    constructor() {                  // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();



        // this.shapes = { "cabinet": new Shape_From_File("assets/arcade.obj") };


        // tick rate remains the same across games
        this.tickRate = 1.0;


        // initialization for Tetris
        this.tetris_game_manager = new Tetris(this.tickRate);

        // initialization for Snake
        this.snake_game_manager = new Snake(this.tickRate);

        // this.stars = new Material(new defs.Textured_Phong(1), {
        //     color: color(.5, .5, .5, 1),
        //     ambient: .3, diffusivity: .5, specularity: .5,
        // });

        // // Bump mapped:
        // this.bumps = new Material(new defs.Fake_Bump_Map(1), {
        //     color: color(.5, .5, .5, 1),
        //     ambient: .3, diffusivity: .5, specularity: .5,
        // });


        // variables for pausing the games
        this.pause_snake = true;
        this.pause_tetris = false;

        // variables to keep track which game is currently being played (i.e. where the camera should be)
        this.playing_tetris = true;
        this.playing_snake = false;

    }
    make_control_panel() {                                 // make_control_panel(): Sets up a panel of interactive HTML elements




        //Global Controls
        this.key_triggered_button("Speed up", ["u"], () => { this.raiseTickRate() });
        this.key_triggered_button("Slow down", ["n"], () => { this.lowerTickRate() });
        this.key_triggered_button("Pause game", ["p"], () => { if (this.playing_snake) { this.pause_snake = !this.pause_snake; } else { this.pause_tetris = !this.pause_tetris; } });
        this.key_triggered_button("Switch Game", ["x"], () => {
            if (this.playing_snake) {
                this.playing_tetris = true;
                this.playing_snake = false;
                this.pause_tetris = false;
                this.pause_snake = true;
            }
            else
                if (this.playing_tetris) {
                    this.playing_snake = true;
                    this.playing_tetris = false;
                    this.pause_tetris = true;
                    this.pause_snake = false;
                }

        })
        // Game Specific controls
        this.key_triggered_button("Move right", ["l"], () => { if (this.playing_tetris) { this.tetris_game_manager.translateMovingBlocksHorizontally("RIGHT") } else if (this.playing_snake) { this.snake_game_manager.input(3) } });
        this.key_triggered_button("Move left", ["j"], () => { if (this.playing_tetris) { this.tetris_game_manager.translateMovingBlocksHorizontally("LEFT") } else if (this.playing_snake) { this.snake_game_manager.input(1) } });
        this.key_triggered_button("Rotate", ["t"], () => { if (this.playing_tetris) { this.tetris_game_manager.rotate() } });

        this.key_triggered_button("Move up", ["i"], () => { if (this.playing_snake) this.snake_game_manager.input(0) });
        this.key_triggered_button("Move down", ["k"], () => { if (this.playing_snake) this.snake_game_manager.input(2) });
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


        // ---- TETRIS ----
        if (this.pause_tetris == false && this.playing_tetris == true) {
            this.tetris_game_manager.processTick(dt);
            this.tetris_game_manager.displayGrid(context, program_state, Mat4.identity);
        }

        // ---- SNAKE -----
        if (this.pause_snake == false && this.playing_snake == true) {
            this.snake_game_manager.processTick(dt);
            this.snake_game_manager.displayGrid(context, program_state, Mat4.identity);
        }



    }

    raiseTickRate() {
        console.log("Changed!");
        this.tickRate -= 0.1;
        if (this.tickRate < 0.1)
            this.tickRate = 0.1;
        this.snake_game_manager.changeTickRate(this.tickRate);
        this.tetris_game_manager.changeTickRate(this.tickRate);
    }

    lowerTickRate() {
        this.tickRate += 0.1;
        if (this.tickRate > 2)
            this.tickRate = 2;
        this.snake_game_manager.changeTickRate(this.tickRate);
        this.tetris_game_manager.changeTickRate(this.tickRate);
    }
}


