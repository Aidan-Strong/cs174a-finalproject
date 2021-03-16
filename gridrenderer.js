import { tiny, defs } from './examples/common.js';
// Pull these names into this module's scope for convenience:
//keeping imports for use in the future
const { vec3, vec4, color, Mat4, Matrix, Light, Shape, Material, Shader, Texture, Scene } = tiny;
const { Triangle, Square, Tetrahedron, Windmill, Cube, Subdivision_Sphere } = defs;


export class GridRenderer {


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


                    //TODO: We aren't actually passing the identity to the renderer, im not sure how to do this correctly..
                    cube_transform = Mat4.identity();
                    //find the correct position
                    cube_transform = cube_transform.times(Mat4.translation(this.cubeSize * c, this.cubeSize * -r, 0));
                    //the higher the cubeGap, the larger the gap, with 1 being no gap
                    cube_transform = cube_transform.times(Mat4.scale(this.cubeSize / cubeGap, this.cubeSize / cubeGap, this.cubeSize / cubeGap));
                    //get the correct color
                    let boxColor = this.getColor(grid[r][c], program_state);

                    //rotate animation?
                    // cube_transform = cube_transform.times(Mat4.rotation(program_state.animation_time / 1000, 1, 1, 1));

                    //draw
                    this.shapes.box.draw(context, program_state, cube_transform, this.materials.plastic.override(boxColor));
                }

            }
        }

        // //draw the a screen behind our game
        cube_transform = Mat4.identity();
        cube_transform = cube_transform.times(Mat4.translation((this.NUM_COLS * this.cubeSize) / 2, -(this.NUM_ROWS * this.cubeSize) / 2, 0));
        cube_transform = cube_transform.times(Mat4.scale((this.NUM_COLS * 1.75) * (this.cubeSize / cubeGap), (this.NUM_ROWS * 1.75) * this.cubeSize / cubeGap, 1));


        this.shapes.box.draw(context, program_state, cube_transform, this.materials.plastic.override(color(0.25, 0.25, 0.25, 1)));

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
            case 8:
                return color(0.5, 0.5, 0.5, 1);
            default:
                return color(1, 1, 1, 1);
        }
    }

}
