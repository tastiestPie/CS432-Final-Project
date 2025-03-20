var canvas;
var gl;
var angle = 0.0;

class Light{
    constructor(loc,dir,color,alpha,cutoff,type){
    	this.location = loc;
    	this.direction = dir;
    	this.color = color;
    	this.alpha = alpha;
    	this.cutoff = cutoff;
    	this.type = type;
    	this.status = 1;
    }
    turnOff(){this.status = 0;}
    turnOn(){this.status = 1;}
}

class Camera{
    constructor(vrp,u,v,n){
    	this.vrp = vrp;
    	this.u = normalize(u);
    	this.v = normalize(v);
    	this.n = normalize(n);

    	this.projectionMatrix = perspective(90.0,1.0,0.1,100);

    	this.updateCameraMatrix();
    }

    updateCameraMatrix(){
    	let t = translate(-this.vrp[0],-this.vrp[1],-this.vrp[2]);
    	let r = mat4(this.u[0], this.u[1], this.u[2], 0,
    		this.v[0], this.v[1], this.v[2], 0,
    		this.n[0], this.n[1], this.n[2], 0,
    		0.0, 0.0, 0.0, 1.0);
    	this.cameraMatrix = mult(r,t);
    }

    getModelMatrix(){
    	return this.modelMatrix;
    }

    setModelMatrix(mm){
    	this.modelMatrix = mm;
    }

	moveForward(amount){
		this.vrp = subtract(this.vrp, scale(amount, this.n));
		this.updateCameraMatrix();
	}

	moveBackward(amount){
		this.vrp = add(this.vrp, scale(amount, this.n));
		this.updateCameraMatrix();
	}

	moveLeft(amount){
		this.vrp = subtract(this.vrp, scale(amount, this.u));
		this.updateCameraMatrix();
	}

	moveRight(amount){
		this.vrp = add(this.vrp, scale(amount, this.u));
		this.updateCameraMatrix();
	}
}

var camera1 = new Camera(vec3(0,0,3), vec3(1,0,0), vec3(0,1,0), vec3(0,0,1));
var camera2 = new Camera(vec3(0,5,15), vec3(1,0,0), vec3(0,1,0), vec3(0,0,1));
var light1 = new Light(vec3(10,50,0),vec3(0,-1,0),vec4(1,1,1,1),0,45,1);

//console.log(camera2);

class Drawable{
    constructor(tx,ty,tz,scale,rotX, rotY, rotZ, diffcolor, speccolor, sh){
    	this.tx = tx;
    	this.ty = ty;
    	this.tz = tz;
    	this.scale = scale;
    	this.modelRotationX = rotX;
    	this.modelRotationY = rotY;
    	this.modelRotationZ = rotZ;
    	this.updateModelMatrix();

    	this.matDiffColor = diffcolor;
    	this.matSpecColor = speccolor;
    	this.matAlpha = sh;
    }

    updateModelMatrix(){
        let t = translate(this.tx, this.ty, this.tz);

    	let s = scale(this.scale,this.scale,this.scale);

    	let rx = rotateX(this.modelRotationX);
    	let ry = rotateY(this.modelRotationY);
    	let rz = rotateZ(this.modelRotationZ);

	this.modelMatrix = mult(t,mult(s,mult(rz,mult(ry,rx))));

	//console.log(this.modelMatrix);

    }

    getModelMatrix(){
      	return this.modelMatrix;
    }

    setModelMatrix(mm){
       	this.modelMatrix = mm;
    }
}

var tri;
var currentCamera = camera1;

let skybox;


window.onload = function init(){
    canvas = document.getElementById( "gl-canvas" );
    gl = canvas.getContext('webgl2');
    if ( !gl ) { alert( "WebGL 2.0 isn't available" ); }
	

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.3, 0.3, 0.9, 1.0 );
    gl.enable(gl.DEPTH_TEST);

	window.addEventListener("keydown", function(event){
		switch(event.key){
			case "w":
				camera1.moveForward(0.1);
				break;
			case "s":
				camera1.moveBackward(0.1);
				break;
			case "a":
				camera1.moveLeft(0.1);
				break;
			case "d":
				camera1.moveRight(0.1);
				break;
			case "f":
				toggleCamera();
				break;		
		}
	});

    var pos = vec3(0,-2,0);
    var rot = vec3(0,0,0);
    var scale = 1.0;
    var diffcolor = vec4(0.5,0.5,0.5,0.5);
    var speccolor = vec4(0.5,0.5,0.5,0.5);
    var shine = 0.5;

	plane = new Plane(4,-1, 1, 2,rot[0],rot[1],rot[2],diffcolor,speccolor,shine);
	skybox = new Skybox(gl);

	//builds the handmade sandcastle
    cube = new Cube(pos[0],0,pos[2],1.5,rot[0],rot[1],rot[2],diffcolor,speccolor,shine);
	cylinder1 = new Cylinder(2, -1, -0.5, 1,rot[0],rot[1],rot[2],diffcolor,speccolor,shine);
	cylinder2 = new Cylinder(-2, -1.5, -0.5, 1,rot[0],rot[1],rot[2],diffcolor,speccolor,shine);

	wave = new RectPrism(-20,-1,0,1.5,rot[0],rot[1],rot[2],diffcolor,speccolor,shine)

	//Sandcastle Roofs. C1 and C2 are for the side pillars, C3 is for the main castle (cube)
	cone1= new Cone(2, 1, -0.5, 1,rot[0],rot[1],rot[2],diffcolor,speccolor,shine);
	cone2= new Cone(-2, 1, -0.5, 1,rot[0],rot[1],rot[2],diffcolor,speccolor,shine);
	cone3= new Cone(0, 1.70, 0, 0.80,rot[0],rot[1],rot[2],diffcolor,speccolor,shine); 

	//Beachball
	//sphere = new Sphere(-2, 1, -2, 1,rot[0],rot[1],rot[2],diffcolor,speccolor,shine);
	
	//obj models
	//sandCastle = new OBJModel("./Models/sandcastle.obj");
	umbrella = new OBJParser("./Models/beach-umbrella.obj");
	umbrella.parse();
	umbrella.createBuffers(gl);


    render();
};

function toggleCamera(){
	if (currentCamera === camera1){
		currentCamera = camera2;
	} else {
		currentCamera = camera1;
	}
}


function render(){
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	//skybox.render(currentCamera);


	//Series of draws to make the "bad" sand castle
    cube.draw(currentCamera);
	plane.draw(currentCamera);
	cylinder1.draw(currentCamera);
	cylinder2.draw(currentCamera);
	cone1.draw(currentCamera);
	cone2.draw(currentCamera);
	cone3.draw(currentCamera);


	//animate the wave to the right
	wave.draw(currentCamera);
	wave.tx += 0.07;
	wave.ty -= 0.005;
	wave.updateModelMatrix();

	//slowly animate left side sinking from the wave
	cylinder2.ty -= 0.001;
	cylinder2.updateModelMatrix();

	cone2.ty -= 0.001;
	cone2.updateModelMatrix();

	//For beach ball // scrapped
	//sphere.draw(currentCamera);

	//obj draws
	//sandCastle.draw(currentCamera);
	//umbrella.draw(gl, "");


	requestAnimationFrame(render);
}


