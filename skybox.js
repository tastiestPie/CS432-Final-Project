var gl;

class Skybox {
    constructor() {
        this.gl = gl;
        var texture = gl.createTexture();
        var textsize = 256;

        gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);

        var image1 = new Image();
        image1.src = "./Textures/sky-top.jpg";
        image1.onload = function(){
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGB, textsize, textsize, 0, gl.RGB, gl.UNSIGNED_BYTE, image1);
        };

        var image2 = new Image();
        image2.src = "./Textures/sky-bottom.jpg";
        image2.onload = function(){
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGB, textsize, textsize, 0, gl.RGB, gl.UNSIGNED_BYTE, image2);
        };

        var image3 = new Image();
        image3.src = "./Textures/sky-right.jpg";
        image3.onload = function(){
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGB, textsize, textsize, 0, gl.RGB, gl.UNSIGNED_BYTE, image3);
        };

        var image4 = new Image();
        image4.src = "./Textures/sky-left.jpg";
        image4.onload = function(){
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGB, textsize, textsize, 0, gl.RGB, gl.UNSIGNED_BYTE, image4);
        };
        
        var image5 = new Image();
        image5.src = "./Textures/sky-back.jpg";
        image5.onload = function(){
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGB, textsize, textsize, 0, gl.RGB, gl.UNSIGNED_BYTE, image5);
        };
        
        var image6 = new Image();
        image6.src = "./Textures/sky-front.jpg";
        image6.onload = function(){
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGB, textsize, textsize, 0, gl.RGB, gl.UNSIGNED_BYTE, image6);
        };
        
    }
}

