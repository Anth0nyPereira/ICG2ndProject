const helper = {

    initEmptyScene: function (sceneElements) {

        // Create the 3D scene
        sceneElements.sceneGraph = new THREE.Scene();
        //Get your video element:
        const video = document.getElementById('video');

        // Create video texture
        const videoTexture = new THREE.VideoTexture(video);
        sceneElements.sceneGraph.background = videoTexture;
        
        // Add camera
        const width = window.innerWidth;
        const height = window.innerHeight;
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 500);
        sceneElements.camera = camera;
        camera.position.set(0, 1, 40);
        camera.lookAt(new THREE.Vector3(0, 0, -150));
    
        // Create PointLight
        // NOTE: why am I using a pLight here??
        // well, it's to be easier to set the "hitbox" (circular) to trigger the "I grabbed a new checkpoint" animation
        const pLight = new THREE.PointLight(0xffffff, 4, 8);
        pLight.name = "pLight";
        pLight.position.set(10, 4, 10);
        sceneElements.sceneGraph.add(pLight);

        sceneElements.sceneGraph.add( new THREE.AmbientLight( 0x404040 ) );

        // Add axis helper
        const axesHelper = new THREE.AxesHelper(500);
        sceneElements.sceneGraph.add(axesHelper);

        // Add renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        sceneElements.renderer = renderer;
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.toneMapping = THREE.LinearToneMapping;
        renderer.setSize(width, height);

        // Setup shadowMap property
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Blooom effect
        var renderScene = new THREE.RenderPass( sceneElements.sceneGraph, sceneElements.camera );
        // Bloom channel creation
        var bloomPass = new THREE.UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 3, 0, 0);
        bloomPass.renderToScreen = true;
        
        bloomPass.threshold = 0.25;
        bloomPass.strength = 1;
        bloomPass.radius = 0.5;
        
        var composer = new THREE.EffectComposer(renderer);
        composer.setSize(window.innerWidth, window.innerHeight);
        composer.addPass(renderScene);

        // Insert bloomPass into composer
        composer.addPass(bloomPass);
        sceneElements.composer = composer;


        // Add rendered image to html
        const htmlElement = document.querySelector("#Tag3DScene");
        htmlElement.appendChild(renderer.domElement);

        // Add PointerLockControls (1st person camera)
        sceneElements.control = new THREE.PointerLockControls(camera , document.body);

        document.body.addEventListener( 'click', function () {
            //lock mouse on screen
            document.getElementById("menu").style.display = "none"; // remove the controls menu
            sceneElements.control.lock();
        });
    },

    render: function render(sceneElements) {
        sceneElements.renderer.render(sceneElements.sceneGraph, sceneElements.camera);
    },
};