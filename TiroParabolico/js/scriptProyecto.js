'use strict';
	
Physijs.scripts.worker = '../physijs_worker.js';
Physijs.scripts.ammo = 'TiroParabolico/js/ammo.js';

var initScene, initEventHandling, render, loader,
	renderer, render_stats, physics_stats, scene, dir_light, am_light, camera,
	campo, campo_material, intersect_plane, porteria_material, pelota;

var time = new THREE.Clock();
	
initScene = function() {
	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.shadowMap.enabled = true;
	renderer.shadowMapSoft = true;
	document.getElementById( 'viewport' ).appendChild( renderer.domElement );
	
	render_stats = new Stats();
	render_stats.domElement.style.position = 'absolute';
	render_stats.domElement.style.top = '1px';
	render_stats.domElement.style.zIndex = 100;
	document.getElementById( 'viewport' ).appendChild( render_stats.domElement );

	physics_stats = new Stats();
	physics_stats.domElement.style.position = 'absolute';
	physics_stats.domElement.style.top = '50px';
	physics_stats.domElement.style.zIndex = 100;
	document.getElementById( 'viewport' ).appendChild( physics_stats.domElement );
	
	scene = new Physijs.Scene({ fixedTimeStep: 0.01 });
	scene.addEventListener(
		'update',
		function() {
			scene.simulate();
			physics_stats.update();
		}
	);
	
	camera = new THREE.PerspectiveCamera(
		35,
		window.innerWidth / window.innerHeight,
		1,
		1000
	);
	
	//Camara posición
	camera.position.set( 35, 10, 35 );
	//Enfoque posición
	camera.lookAt(new THREE.Vector3( 0, 0, 0 ));
	
	scene.add( camera );
	
	pespectiva1.addEventListener("click", function(){
		camera.position.set( 35, 10, 35 );
		camera.lookAt(new THREE.Vector3( 0, 0, 0 ));
	});
	pespectiva2.addEventListener("click", function(){
		camera.position.set( 15, 10, 40);
		camera.lookAt(new THREE.Vector3( 15, 0, 0 ));
	});
	pespectiva3.addEventListener("click", function(){
		camera.position.set( 40, 5, 15 );
		camera.lookAt(new THREE.Vector3( 0, 0, 15 ));
	});
	pespectiva4.addEventListener("click", function(){
		camera.position.set( 15, 40, 15 );
		camera.lookAt(new THREE.Vector3( 15, 0, 15 ));
	});
	
	
	// ambient light
	am_light = new THREE.AmbientLight( 0x444444 );
	scene.add( am_light );

	// directional light
	dir_light = new THREE.DirectionalLight( 0xFFFFFF );
	dir_light.position.set( 20, 30, -5 );
	dir_light.target.position.copy( scene.position );
	dir_light.castShadow = true;
	dir_light.shadowCameraLeft = -30;
	dir_light.shadowCameraTop = -30;
	dir_light.shadowCameraRight = 30;
	dir_light.shadowCameraBottom = 30;
	dir_light.shadowCameraNear = 20;
	dir_light.shadowCameraFar = 200;
	dir_light.shadowBias = -.001
	dir_light.shadowMapWidth = dir_light.shadowMapHeight = 2048;
	dir_light.shadowDarkness = .5;
	scene.add( dir_light );

	// Loader
	loader = new THREE.TextureLoader();
	
	// Materials
	campo_material = Physijs.createMaterial(
		new THREE.MeshLambertMaterial({ map: loader.load( 'images/grass.png' )}),
		.9, // high friction
		.2 // low restitution
	);
	campo_material.map.wrapS = campo_material.map.wrapT = THREE.RepeatWrapping;
	campo_material.map.repeat.set( 5, 5 );
	
	// Campo
	campo = new Physijs.BoxMesh(
		new THREE.BoxGeometry(30, 0.5, 30),campo_material,0, { restitution: .2, friction: .8 }
	);
	//Campo posición
	campo.position.x = campo.geometry.parameters.width/2;
	campo.position.y = campo.geometry.parameters.height/2;
	campo.position.z = campo.geometry.parameters.depth/2;
	campo.receiveShadow = true;
	scene.add( campo );
	
	intersect_plane = new THREE.Mesh(
		new THREE.PlaneGeometry( 150, 150 ),
		new THREE.MeshBasicMaterial({ opacity: 0, transparent: true })
	);
	intersect_plane.rotation.x = Math.PI / -2;
	scene.add( intersect_plane );

	//Portería
	//PosiciónX = (campoTam / 2) - (porteriaTam / 2)
	porteria_material = Physijs.createMaterial(	new THREE.MeshLambertMaterial({ map: loader.load( 'images/rocks.jpg' ) }), .6, .2);
	porteria_material.map.wrapS = porteria_material.map.wrapT = THREE.RepeatWrapping;
	porteria_material.map.repeat.set( .25, .25 );
	
	var porteria, _object;
	porteria = new Physijs.BoxMesh(
		new THREE.BoxGeometry( 7.32, .3, .3 ),
		porteria_material
	);
	porteria.castShadow = true;
	porteria.receiveShadow = true;
	
	// Peldaños porteria
	_object = new Physijs.BoxMesh(
		new THREE.BoxGeometry( .3, 2.44, .3 ),
		porteria_material
	);
	_object.position.x = (((campo.geometry.parameters.width/2) - (porteria.geometry.parameters.width/2)) - (campo.geometry.parameters.width/2)) - (porteria.geometry.parameters.depth/2);
	_object.position.y = -(_object.geometry.parameters.height/2);
	_object.castShadow = true;
	_object.receiveShadow = true;
	porteria.add( _object );
	
	_object = new Physijs.BoxMesh(
		new THREE.BoxGeometry( .3, 2.44, .3 ),
		porteria_material
	);
	_object.position.x = ((campo.geometry.parameters.width/2) + (porteria.geometry.parameters.width/2)) - (campo.geometry.parameters.width/2) + (porteria.geometry.parameters.depth/2);
	_object.position.y = -(_object.geometry.parameters.height/2);
	_object.castShadow = true;
	_object.receiveShadow = true;
	porteria.add( _object );
	
	porteria.position.x = (campo.geometry.parameters.width/2);
	porteria.position.y = (_object.geometry.parameters.height) + (campo.geometry.parameters.height);
	porteria.position.z = 5;
	
	scene.add( porteria );
	
	//Pelota de futbol; radio de 11cm
	var sphere_geometry = new THREE.SphereGeometry( 0.11, 32, 32 )
	pelota = new Physijs.SphereMesh(sphere_geometry);
	pelota.mass = 1;
	
	pelota.material.color.setRGB( 10, 10, 10 );
	pelota.castShadow = true;
	pelota.receiveShadow = true;
	
	pelota.position.set(15,0.7,15);
	
	//EVENTO PARA VER LA COLISION DE LA PELOTA Y EL SUELO
	pelota.addEventListener( 'collision', function() {
		time.stop();
		console.log("tocó el suelo!!!! "+" Time: "+time.getElapsedTime()+" Velocidad: "+pelota.getLinearVelocity().x+" "+pelota.getLinearVelocity().y);
	});
	
	scene.add( pelota );
	
	resetPelota.addEventListener("click", function(){
		//time = new THREE.Clock();
		//time.start();
		pelota.position.set( 15, 0.7, 15 );
		pelota.__dirtyPosition = true;
		
		//var velocidad = pelota.getLinearVelocity();
		//pelota.setLinearVelocity(new THREE.Vector3(0,0,0));
		
		//var force = new THREE.Vector3(0, 0, 1);
		//pelota.applyCentralForce(force);
	});
	
	var lol = new Physijs.BoxMesh(
		new THREE.BoxGeometry( 1, 5, 1 ),
		porteria_material
	);
	lol.position.x = 15;
	lol.position.z = 16;
	lol.position.y = 3;
	lol.castShadow = true;
	lol.receiveShadow = true;
	scene.add( lol );
	
	forceButton.addEventListener("click", function(){
		time = new THREE.Clock();
		time.start();
		/*var force = new THREE.Vector3(0, -10, -1);
		var offset = new THREE.Vector3(0, 0, 0);
		pelota.applyImpulse(force, offset);*/
		
		//var force = new THREE.Vector3(0, 100, 0);
		//pelota.applyCentralForce(force);
		pelota.setLinearVelocity(new THREE.Vector3(0, 9.9, 0));
	});
	
	requestAnimationFrame( render );
	scene.simulate();
};

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
};

render = function() {
	requestAnimationFrame( render );
	renderer.render( scene, camera );
	render_stats.update();
};

window.onload = initScene;