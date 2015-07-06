if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var SCREEN_WIDTH = window.innerWidth;
var SCREEN_HEIGHT = window.innerHeight - 50;

var container, camera, scene, renderer;

var character;

var gui, playbackConfig = {

	speed: 1.0,
	wireframe: false

};

var controls;

var clock = new THREE.Clock();

init();
animate();

function init() {

	container = document.getElementById( 'mainScene' );

	// CAMERA

	camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 1000 );
	camera.position.set( 0, 150, 400 );

	// SCENE

	scene = new THREE.Scene();
	scene.fog = new THREE.Fog( 0x050505, 400, 1000 );

	// LIGHTS

	scene.add( new THREE.AmbientLight( 0x222222 ) );

	var light = new THREE.SpotLight( 0xffffff, 2, 1000 );
	light.position.set( 200, 250, 500 );

	light.castShadow = true;
	light.shadowMapWidth = 1024;
	light.shadowMapHeight = 1024;
	light.shadowMapDarkness = 0.95;
	//light.shadowCameraVisible = true;

	scene.add( light );

	var light = new THREE.SpotLight( 0xffffff, 1.5, 500 );
	light.position.set( -100, 350, 250 );

	light.castShadow = true;
	light.shadowMapWidth = 1024;
	light.shadowMapHeight = 1024;
	light.shadowMapDarkness = 0.95;
	//light.shadowCameraVisible = true;

	scene.add( light );

	//  GROUND

	var gt = THREE.ImageUtils.loadTexture( "three.js/examples/textures/terrain/grasslight-big.jpg" );
	var gg = new THREE.PlaneBufferGeometry( 2000, 2000 );
	var gm = new THREE.MeshPhongMaterial( { color: 0xffffff, map: gt } );

	var ground = new THREE.Mesh( gg, gm );
	ground.rotation.x = - Math.PI / 2;
	ground.material.map.repeat.set( 8, 8 );
	ground.material.map.wrapS = ground.material.map.wrapT = THREE.RepeatWrapping;
	ground.receiveShadow = true;

	scene.add( ground );

	// RENDERER

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setClearColor( scene.fog.color );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
	container.appendChild( renderer.domElement );

	//

	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	renderer.shadowMapEnabled = true;

	// STATS

	stats = new Stats();
	container.appendChild( stats.domElement );

	// EVENTS

	window.addEventListener( 'resize', onWindowResize, false );

	// CONTROLS

	controls = new THREE.OrbitControls( camera, renderer.domElement );
	controls.target.set( 0, 50, 0 );

	// GUI

	gui = new dat.GUI();

	gui.add( playbackConfig, 'speed', 0, 2 ).onChange( function() {

		character.setPlaybackRate( playbackConfig.speed );

	} );

	gui.add( playbackConfig, 'wireframe', false ).onChange( function() {

		character.setWireframe( playbackConfig.wireframe );

	} );

	// CHARACTER

	var config = {

		baseUrl: "three.js/examples/models/animated/ratamahatta/",

		body: "ratamahatta.js",
		skins: [ "ratamahatta.png", "ctf_b.png", "ctf_r.png", "dead.png", "gearwhore.png" ],
		weapons:  [  [ "weapon.js", "weapon.png" ],
					 [ "w_bfg.js", "w_bfg.png" ],
					 [ "w_blaster.js", "w_blaster.png" ],
					 [ "w_chaingun.js", "w_chaingun.png" ],
					 [ "w_glauncher.js", "w_glauncher.png" ],
					 [ "w_hyperblaster.js", "w_hyperblaster.png" ],
					 [ "w_machinegun.js", "w_machinegun.png" ],
					 [ "w_railgun.js", "w_railgun.png" ],
					 [ "w_rlauncher.js", "w_rlauncher.png" ],
					 [ "w_shotgun.js", "w_shotgun.png" ],
					 [ "w_sshotgun.js", "w_sshotgun.png" ]
					]

	};

	character = new THREE.MD2Character();
	character.scale = 3;

	character.onLoadComplete = function() {

		setupSkinsGUI( character );
		setupWeaponsGUI( character );
		setupGUIAnimations( character );

		var datGUILoaded = new CustomEvent("datGUILoaded", {
			detail: {
				"gui": gui
			}		
		});
		document.dispatchEvent(datGUILoaded);
	}

	character.loadParts( config );

	scene.add( character.root );

	
}

// EVENT HANDLERS

function onWindowResize( event ) {

	SCREEN_WIDTH = window.innerWidth;
	SCREEN_HEIGHT = window.innerHeight;

	renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );

	camera.aspect = SCREEN_WIDTH/ SCREEN_HEIGHT;
	camera.updateProjectionMatrix();

}

// GUI

function labelize( text ) {

	var parts = text.split( "." );

	if ( parts.length > 1 ) {

		parts.length -= 1;
		return parts.join( "." );

	}

	return text;

}

//

function setupWeaponsGUI( character ) {

	var folder = gui.addFolder( "Weapons" );

	var generateCallback = function( index ) {

		return function () { character.setWeapon( index ); };

	}

	var guiItems = [];

	for ( var i = 0; i < character.weapons.length; i ++ ) {

		var name = character.weapons[ i ].name;

		playbackConfig[ name ] = generateCallback( i );
		guiItems[ i ] = folder.add( playbackConfig, name ).name( labelize( name ) );

	}

}

//

function setupSkinsGUI( character ) {

	var folder = gui.addFolder( "Skins" );

	var generateCallback = function( index ) {

		return function () { character.setSkin( index ); };

	}

	var guiItems = [];

	for ( var i = 0; i < character.skinsBody.length; i ++ ) {

		var name = character.skinsBody[ i ].name;

		playbackConfig[ name ] = generateCallback( i );
		guiItems[ i ] = folder.add( playbackConfig, name ).name( labelize( name ) );

	}

}

//

function setupGUIAnimations( character ) {

	var folder = gui.addFolder( "Animations" );

	var generateCallback = function( animationName ) {

		return function () { character.setAnimation( animationName ); };

	}

	var i = 0, guiItems = [];
	var animations = character.meshBody.geometry.animations;

	for ( var a in animations ) {

		playbackConfig[ a ] = generateCallback( a );
		guiItems[ i ] = folder.add( playbackConfig, a, a );

		i ++;

	}

}

//

function animate() {

	requestAnimationFrame( animate );
	render();

	stats.update();

}

function render() {

	var delta = clock.getDelta();

	controls.update();
	character.update( delta );

	renderer.render( scene, camera );



}