"use strict";

// To store the scene graph, and elements usefull to rendering the scene
const sceneElements = {
    sceneGraph: null,
    camera: null,
    control: null, 
    renderer: null,
};


// Functions are called
//  1. Initialize the empty scene
//  2. Add elements within the scene
//  3. Animate
helper.initEmptyScene(sceneElements);
load3DObjects(sceneElements.sceneGraph);
requestAnimationFrame(computeFrame);

// HANDLING EVENTS

// Event Listeners

window.addEventListener('resize', resizeWindow);

//To keep track of the keyboard - WASD
var keyD = false, keyA = false, keyS = false, keyW = false;
document.addEventListener('keydown', onDocumentKeyDown, false);
document.addEventListener('keyup', onDocumentKeyUp, false);

// Update render image size and camera aspect when the window is resized
function resizeWindow(eventParam) {
    const width = window.innerWidth;
    const height = window.innerHeight;

    sceneElements.camera.aspect = width / height;
    sceneElements.camera.updateProjectionMatrix();

    sceneElements.renderer.setSize(width, height);
}

function onDocumentKeyDown(event) {
    switch (event.keyCode) {
        case 68: //d
            keyD = true;
            break;
        case 83: //s
            keyS = true;
            break;
        case 65: //a
            keyA = true;
            break;
        case 87: //w
            keyW = true;
            break;
    }
}
function onDocumentKeyUp(event) {
    switch (event.keyCode) {
        case 68: //d
            keyD = false;
            break;
        case 83: //s
            keyS = false;
            break;
        case 65: //a
            keyA = false;
            break;
        case 87: //w
            keyW = false;
            break;
    }
}

function createGrave() {
    var grave = new THREE.Group();
    var shape = new THREE.Shape();
    shape.moveTo(-2, 0);
    shape.lineTo(-2, 6);
    shape.lineTo(-1.5, 6);
    shape.bezierCurveTo(0, 10, 0, 10, 1.5, 6);
    shape.lineTo(2, 6);
    shape.lineTo(2, 0);
    shape.lineTo(-2, 0);

    var extrudeSettings = {
        steps: 20,
        depth: 0.2,
        bevelEnabled: true,
        bevelThickness: 1,
        bevelSize: 1,
        bevelOffset: 0,
        bevelSegments: 1
    };

    var plateGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    var plateMaterial = new THREE.MeshBasicMaterial({color: 0x656565});
    var plate = new THREE.Mesh(plateGeometry, plateMaterial);
    plate.scale.set(0.8, 0.8, 0.8);

    var bottomGeometry = new THREE.BoxGeometry( 4, 2, 10);
    var bottom = new THREE.Mesh(bottomGeometry, plateMaterial);
    bottom.position.set(0, 0, 5.8);
    grave.add(plate);
    grave.add(bottom);
    return grave;
}

function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
}

// Create and insert in the scene graph the models of the 3D scene
function load3DObjects(sceneGraph) {

    // ************************** //
    // Create a ground plane
    // ************************** //
    const planeGeometry = new THREE.PlaneGeometry(500, 500);
    const planeMaterial = new THREE.MeshPhongMaterial({ color: 'rgb(200, 200, 200)', side: THREE.DoubleSide });
    const planeObject = new THREE.Mesh(planeGeometry, planeMaterial);
    sceneGraph.add(planeObject);

    // Change orientation of the plane using rotation
    planeObject.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);
    // Set shadow property
    planeObject.receiveShadow = true;

    // Create user (for now, it's a cone)
    var userGeometry = new THREE.ConeGeometry(3, 8, 16);
    var userMaterial = new THREE.MeshBasicMaterial({color: 0xffff00});
    var user = new THREE.Mesh(userGeometry, userMaterial);
    user.name = "user";
    user.position.set(0, 1, 40);
    sceneElements.sceneGraph.add(user);

    // Create a grave
    var grave1 = createGrave();
    sceneElements.sceneGraph.add(grave1);


}

// Displacement value

var delta = 0.1;

var dispX = 0.2, dispZ = 0.2;
var isExecuted = false;
function computeFrame(time) {

    
    var pLight = sceneElements.sceneGraph.getObjectByName("pLight");
    if (!isExecuted) {
        pLight.position.set(randomIntFromInterval(-50, 50), 4, randomIntFromInterval(-50, 50));
        isExecuted = true;
    }

    var user = sceneElements.sceneGraph.getObjectByName("user");
    var camera = sceneElements.camera;
    camera.lookAt(new THREE.Vector3(0, 0, -150));

    if (keyW && user.position.z >= -100) {
        user.position.z -= 0.2;
        camera.position.z -= 0.2;
    } else if (keyW && user.position.z < -100) {
        user.position.z = -100;
        camera.position.z = -100;
    }

    if (keyA && user.position.x >= -100) {
        user.position.x -= 0.2;
        camera.position.x -= 0.2;
    } else if (keyA && user.position.x < -100) {
        user.position.x = -100;
        camera.position.x = -100;
    }

    if (keyD && user.position.x <= 100) {
        user.position.x += 0.2;
        camera.position.x += 0.2;
    } else if (keyD && user.position.x > 100) {
        user.position.x = 100;
        camera.position.x = 100;
    }

    if (keyS && user.position.z <= 100) {
        user.position.z += 0.2;
        camera.position.z += 0.2;
    } else if (keyD && user.position.z > 100) {
        user.position.z = 100;
        camera.position.z = 100;
    }
    
    console.log("user positions: " + user.position.x + " " + user.position.z);
    console.log("light positions: " + pLight.position.x + " " + pLight.position.z);
    if ((Math.round(user.position.x) < pLight.position.x + 4 && Math.round(user.position.x) > pLight.position.x - 4) && (Math.round(user.position.z) < pLight.position.z + 4 && Math.round(user.position.z) > pLight.position.z - 4)) {
        pLight.position.set(randomIntFromInterval(-50, 50), 4, randomIntFromInterval(-50, 50));
    }

    

    // Rendering
    helper.render(sceneElements);

    // NEW --- Update control of the camera
    sceneElements.control.update();

    // Call for the next frame
    requestAnimationFrame(computeFrame);
}