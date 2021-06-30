"use strict";

const helper = {

    initEmptyScene: function (sceneElements) {

        // ************************** //
        // Create the 3D scene
        // ************************** //
        sceneElements.sceneGraph = new THREE.Scene();
        //Get your video element:
        const video = document.getElementById('video');

        //Create your video texture:
        const videoTexture = new THREE.VideoTexture(video);
        sceneElements.sceneGraph.background = videoTexture;
            /*
            // instantiate a loader
            var loader = new THREE.TextureLoader();

            // load a resource
            loader.load(
                // resource URL
                'background.jpg',
                // Function when resource is loaded
                function ( texture ) {
                    // do something with the texture
                    sceneElements.sceneGraph.background = texture;
                    console.log( 'Loaded texture successfully' );
                },
                // Function called when download progresses
                function ( xhr ) {
                    console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
                },
                // Function called when download errors
                function ( xhr ) {
                    console.log( 'An error happened' );
                }
            );

            */
            
            


        // ************************** //
        // Add camera
        // ************************** //
        const width = window.innerWidth;
        const height = window.innerHeight;
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 500);
        sceneElements.camera = camera;
        camera.position.set(0, 1, 40);
        camera.lookAt(new THREE.Vector3(0, 0, -150));

        // ************************** //
        // Illumination
        // ************************** //

        // ************************** //
        // Add ambient light
        // ************************** //
        const ambientLight = new THREE.AmbientLight('rgb(255, 255, 255)', 0.2);
        sceneElements.sceneGraph.add(ambientLight);

        // ***************************** //
        // Add spotlight (with shadows)
        // ***************************** //
    
        // Create PointLight
        const pLight = new THREE.PointLight(0xffffff, 4, 8);
        pLight.name = "pLight";
        pLight.position.set(10, 4, 10);
        sceneElements.sceneGraph.add(pLight);

        sceneElements.sceneGraph.add( new THREE.AmbientLight( 0x404040 ) );

        // Add axis helper
        const axesHelper = new THREE.AxesHelper(50);
        sceneElements.sceneGraph.add(axesHelper);


        // *********************************** //
        // Create renderer (with shadow map)
        // *********************************** //
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        sceneElements.renderer = renderer;
        renderer.setPixelRatio(window.devicePixelRatio);
        // renderer.toneMapping = THREE.ReinhardToneMapping;
        
        renderer.toneMapping = THREE.LinearToneMapping;
        /*
        renderer.setClearColor(0x000000,0.0);
        */
        // renderer.setClearColor('rgb(255, 255, 150)', 1.0);
        renderer.setSize(width, height);

        // Setup shadowMap property
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Blooom
        var renderScene = new THREE.RenderPass( sceneElements.sceneGraph, sceneElements.camera );
        // Bloom channel creation
        var bloomPass = new THREE.UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 3, 0, 0);
        bloomPass.renderToScreen = true;
        
        bloomPass.threshold = 0.25;
        bloomPass.strength = 1;
        bloomPass.radius = 0.5;
        
        
        var composer = new THREE.EffectComposer( renderer );
        composer.setSize( window.innerWidth, window.innerHeight );
        composer.addPass( renderScene );
        // Insert gloom channel bloomPass into composer
        composer.addPass( bloomPass );
        sceneElements.composer = composer;


        // **************************************** //
        // Add the rendered image in the HTML DOM
        // **************************************** //
        const htmlElement = document.querySelector("#Tag3DScene");
        htmlElement.appendChild(renderer.domElement);

        // ************************** //
        // NEW --- Control for the camera
        // ************************** //
        sceneElements.control = new THREE.PointerLockControls(camera , document.body);

        document.body.addEventListener( 'click', function () {
            //lock mouse on screen
            sceneElements.control.lock();
        }, false );


    },

    render: function render(sceneElements) {
        sceneElements.renderer.render(sceneElements.sceneGraph, sceneElements.camera);
    },
};