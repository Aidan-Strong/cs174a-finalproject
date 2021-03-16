import { tiny, defs } from './examples/common.js';
import { Snake } from './snake.js';
import { Tetris } from './tetris.js';
import { Shape_From_File } from './examples/obj-file-demo.js';
import { Text_Line } from './examples/text-demo.js';
// Pull these names into this module's scope for convenience:
//keeping imports for use in the future

const { vec3, vec4, color, Mat4, Light, Shape, Material, Shader, Texture, Scene, Vector } = tiny;
const { Triangle, Square, Tetrahedron, Windmill, Cube, Subdivision_Sphere } = defs;
export class ArcadeScene extends Scene {
    constructor() {                  // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();



        this.shapes = {
            "cabinet": new Shape_From_File("assets/arcade.obj"),
            "box": new Cube(),
            "text": new Text_Line(35),
        };


        // tick rate remains the same across games
        this.tickRate = 0.25;


        // initialization for Tetris
        this.tetris_game_manager = new Tetris(this.tickRate, 0.6);

        // initialization for Snake
        this.snake_game_manager = new Snake(this.tickRate, 0.6);


        this.cabinet_texture = new Material(new defs.Textured_Phong(1), {
            color: color(0.8, 0.8, 0.8, 1),
            ambient: 0.6, diffusivity: 0, specularity: 0.1, texture: new Texture("assets/dd.png")
        });

        // To show text you need a Material like this one:
        this.text_image = new Material(new defs.Textured_Phong(1), {
            ambient: 1, diffusivity: 1, specularity: 1,
            texture: new Texture("assets/text.png")
        });


        this.screen = new Material(new defs.Phong_Shader(), { color: color(0.8, 0.8, 0.8, 1), ambient: 1, diffusivity: 1, });
        // variables for pausing the games
        this.pause_snake = true;
        this.pause_tetris = false;

        // variables to keep track which game is currently being played (i.e. where the camera should be)
        this.playing_tetris = true;
        this.playing_snake = false;
        this.blend = 1;
        this.time = 0;




        this.tetris_camera_position = Mat4.identity().times(Mat4.translation(-5, 7, -40));
        this.snake_camera_position = Mat4.identity();
        this.snake_camera_position = this.snake_camera_position.times(Mat4.translation(-40, 7, -1));
        this.snake_camera_position = this.snake_camera_position.times(Mat4.rotation(Math.PI / 2, 0, 1, 0));

        this.camera_position = this.tetris_camera_position;

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

            program_state.set_camera(this.camera_position);
        }
        else {
            this.blendTransformations()
            program_state.set_camera(this.camera_position);
        }

        program_state.projection_transform = Mat4.perspective(Math.PI / 4, context.width / context.height, 1, 100);

        // *** Lights: ***
        const t = this.t = program_state.animation_time / 1000, dt = program_state.animation_delta_time / 1000;


        const light_position = Mat4.rotation(0, 1, 0, 0).times(vec4(0, -1, 1, 0));
        const light_position2 = Mat4.rotation(Math.PI, .5, 0, 0).times(vec4(0, -1, 1, 0));
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000000), new Light(light_position2, color(1, 1, 1, 1), 1000000)];


        // ---- TETRIS ----
        if (this.pause_tetris == false && this.playing_tetris == true) {
            this.tetris_game_manager.processTick(dt);
        }

        // ---- SNAKE -----
        if (this.pause_snake == false && this.playing_snake == true) {
            this.snake_game_manager.processTick(dt);

        }

        //draw snake board
        let boardLocation = Mat4.identity();
        boardLocation = boardLocation.times(Mat4.translation(36, 1, 35));
        boardLocation = boardLocation.times(Mat4.rotation(Math.PI / 20, 0, 0, -1));
        boardLocation = boardLocation.times(Mat4.rotation(Math.PI / 2, 0, -1, 0));
        this.snake_game_manager.displayGrid(context, program_state, boardLocation);


        //draw the game name
        let headerTransform = Mat4.identity();
        headerTransform = headerTransform.times(Mat4.translation(-0.5, 5, 0));
        headerTransform = headerTransform.times(Mat4.scale(1, 1, 1));
        this.shapes.text.set_string("TETRIS", context.context);
        this.shapes.text.draw(context, program_state, headerTransform, this.text_image);


        //draw the arcade machine
        let arcadeTransform = Mat4.identity();
        arcadeTransform = arcadeTransform.times(Mat4.scale(5, 5, 5));
        arcadeTransform = arcadeTransform.times(Mat4.translation(0.33, -3, 0));
        this.shapes.cabinet.draw(context, program_state, arcadeTransform, this.cabinet_texture);

        // //draw the a screen behind our game
        let cube_transform = Mat4.identity();
        cube_transform = cube_transform.times(Mat4.translation(2.6, -6, -1));
        cube_transform = cube_transform.times(Mat4.scale(5, 7.5, 0));
        this.shapes.box.draw(context, program_state, cube_transform, this.screen);

        //draw tetris board
        this.tetris_game_manager.displayGrid(context, program_state, Mat4.identity());



        // //draw the cabinet
        arcadeTransform = Mat4.identity();
        arcadeTransform = arcadeTransform.times(Mat4.rotation(Math.PI, 0, 1, 0));
        arcadeTransform = arcadeTransform.times(Mat4.scale(5, 5, 5));
        arcadeTransform = arcadeTransform.times(Mat4.translation(-6, -3, -8));

        //draw the game name
        headerTransform = Mat4.identity();
        headerTransform = headerTransform.times(Mat4.rotation(Math.PI / 2, 0, -1, 0));
        headerTransform = headerTransform.times(Mat4.translation(37.5, 4, -30));
        headerTransform = headerTransform.times(Mat4.scale(1, 1, 1));
        this.shapes.text.set_string("SNAKE", context.context);
        this.shapes.text.draw(context, program_state, headerTransform, this.text_image);

        arcadeTransform = arcadeTransform.times(Mat4.rotation(Math.PI / 2, 0, 1, 0));
        this.shapes.cabinet.draw(context, program_state, arcadeTransform, this.cabinet_texture);
        // //draw the a screen behind our game
        cube_transform = Mat4.identity();

        cube_transform = cube_transform.times(Mat4.rotation(Math.PI, 0, 1, 0));
        cube_transform = cube_transform.times(Mat4.scale(1, 6, 6.2));
        cube_transform = cube_transform.times(Mat4.translation(-38, -0.75, -6.58));
        cube_transform = cube_transform.times(Mat4.rotation(Math.PI / 2, 0, 1, 0));
        this.shapes.box.draw(context, program_state, cube_transform, this.screen);





        //animation
        let blendTime = 0.05;
        this.time += dt;
        if (this.time >= blendTime) {
            if (this.playing_snake && this.blend > 0)
                this.blend -= 0.1;
            if (this.playing_tetris && this.blend < 1)
                this.blend += 0.1;
            this.time = 0;
            this.blendTransformations();
        }
    }

    blendTransformations() {
        this.camera_position = this.tetris_camera_position.map((x, i) => Vector.from(this.snake_camera_position[i]).mix(x, this.blend))
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


