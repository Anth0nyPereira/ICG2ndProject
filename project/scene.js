"use strict";

// To store the scene graph, and elements usefull to rendering the scene
const sceneElements = {
    sceneGraph: null,
    camera: null,
    control: null, 
    renderer: null,
    composer: null,
};


// Functions are called
//  1. Initialize the empty scene
//  2. Add elements within the scene
//  3. Animate
helper.initEmptyScene(sceneElements);
load3DObjects(sceneElements.sceneGraph);
requestAnimationFrame(computeFrame);

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;

let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

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
            moveRight = true;
            break;
        case 83: //s
            moveBackward = true;
            break;
        case 65: //a
            moveLeft = true;
            break;
        case 87: //w
            moveForward = true;
            break;
    }
}
function onDocumentKeyUp(event) {
    switch (event.keyCode) {
        case 68: //d
            moveRight = false;
            break;
        case 83: //s
            moveBackward = false;
            break;
        case 65: //a
            moveLeft = false;
            break;
        case 87: //w
            moveForward = false;
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

function createPlane() {
    var random = randomIntFromInterval(1, 10);
    var plane = new THREE.Group();
    var planeGeometry = new THREE.PlaneGeometry(20, 20);
    if (random == 1) {
        var planeMaterial = new THREE.MeshBasicMaterial({ color: 0xB026FF, side: THREE.DoubleSide });
    } else {
        var planeMaterial = new THREE.MeshBasicMaterial({ color: 0x000026, side: THREE.DoubleSide });
    }
    var edgesGeometry = new THREE.EdgesGeometry(planeGeometry);
    var edgesMaterial = new THREE.LineBasicMaterial( { color: 0xB026FF, linewidth: 10} );
    
    
    var planeObject = new THREE.Mesh(planeGeometry, planeMaterial);
    var edgesMesh = new THREE.LineSegments(edgesGeometry, edgesMaterial);
    
     // Change orientation of the plane using rotation
    planeObject.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);
    edgesMesh.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);
     // Set shadow property
    planeObject.receiveShadow = true;

    plane.add(planeObject);
    plane.add(edgesMesh);
 
    return plane;
}

// Create and insert in the scene graph the models of the 3D scene
function load3DObjects(sceneGraph) {

    var geometry = new THREE.ConeGeometry( 200, 400, 8 );
    //var geo = new THREE.EdgesGeometry( geometry );
  	var mat = new THREE.MeshBasicMaterial( { color: 0xff0000, linewidth: 50 } );

    var mesh = new THREE.Mesh(geometry, mat);
    mesh.position.y = 30;
    mesh.scale.set(1/5, 1/5, 1/5);
    sceneElements.sceneGraph.add(mesh);

    // ************************** //
    // Create a ground plane
    // ************************** //
    var allPlane = new THREE.Object3D();
    allPlane.name = "allPlane";
    for (var z = -25; z < 25; z++) {
        for (var x=-25; x<25; x++) {
            var plane = createPlane();
            // plane.name = "plane" + x + "." + z;
            plane.position.set(x*20, -2, z*20);
            allPlane.add(plane);
        }
    }

    sceneElements.sceneGraph.add(allPlane);
    


    // Create user (for now, it's a cone)
    var userGeometry = new THREE.ConeGeometry(3, 8, 16);
    var userMaterial = new THREE.MeshBasicMaterial({color: 0xffff00});
    var user = new THREE.Mesh(userGeometry, userMaterial);
    user.name = "user";
    user.position.set(0, 1, 40);
    sceneElements.camera.add(user);

    // Create a grave
    var grave1 = createGrave();
    sceneElements.sceneGraph.add(grave1);


}

// Displacement value

var delta = 0.1;

var dispX = 0.2, dispZ = 0.2;
var isExecuted = false;

var count = 0;
function computeFrame() {

    sceneElements.composer.render();

    var allPlane = sceneElements.sceneGraph.getObjectByName("allPlane");
    var children = allPlane.children; // array of groups

    // Random ground turns red and disappears
    var color = new THREE.Color(0xff0000);
    var randomGround = children[Math.floor(Math.random() * children.length)]; // this is a group
    var plane = randomGround.children[0];
    var edges = randomGround.children[1];
    if (plane.visible == true && count % 5 === 0) {
        plane.visible = false;
        edges.visible = false;
        count++;

    } else {
        plane.visible = true;
        edges.visible = true;
        count++;

    }

    

    var camera = sceneElements.camera;
    var target = new THREE.Vector3();
    for (var i = 0; i < children.length; i++) {
        var elem = children[i].children[0];
        var edges = children[i].children[1];
        if (elem.visible == false) {
            //console.log("camera: " + Math.round(camera.getWorldPosition(target).x));
            //console.log("ground: " + elem.position.x + 10);
            if ((Math.round(camera.getWorldPosition(target).x) < elem.getWorldPosition(target).x + 10 && Math.round(camera.getWorldPosition(target).x) > elem.getWorldPosition(target).x - 10) && (Math.round(camera.getWorldPosition(target).z) < elem.getWorldPosition(target).z + 10 && Math.round(camera.getWorldPosition(target).z) > elem.getWorldPosition(target).z - 10)) {
                //console.log("hey");
                sceneElements.control.unlock();
                camera.position.y -= 1;
                if (camera.position.y == -100) {
                    sceneElements.control.unlock();
                    for (var i=0; i<children.length; i++) {
                        var elem = children[i].children[0];
                        var edges = children[i].children[1];
                        elem.visible = true;
                        edges.visible = true;
                    }
                    camera.position.set(0, 1, 40);
                    camera.lookAt(new THREE.Vector3(0, 0, -150));
                }
            }
        }
        
    }
    
    /*

    
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
    
    
    


    

    // Rendering
    helper.render(sceneElements);

    // NEW --- Update control of the camera
    // sceneElements.control.update();

    // Call for the next frame
    requestAnimationFrame(computeFrame);
    */
    var user = sceneElements.camera.children[0];
    var pLight = sceneElements.sceneGraph.getObjectByName("pLight");
    var camera = sceneElements.camera;
    var target = new THREE.Vector3();
    //console.log("user positions: " + user.position.x + " " + user.position.z);
    //console.log("light positions: " + pLight.position.x + " " + pLight.position.z);
    //console.log(camera.getWorldPosition(target));
    if ((Math.round(camera.getWorldPosition(target).x) < pLight.position.x + 5 && Math.round(camera.getWorldPosition(target).x) > pLight.position.x - 5) && (Math.round(camera.getWorldPosition(target).z) < pLight.position.z + 5 && Math.round(camera.getWorldPosition(target).z) > pLight.position.z - 5)) {
        pLight.position.set(randomIntFromInterval(-100, 100), 4, randomIntFromInterval(-100, 100));
    }

    requestAnimationFrame( computeFrame );

    const time = performance.now();
    var scenecontrols = sceneElements.control;
    if ( scenecontrols.isLocked === true ) {

        const delta = ( time - prevTime ) / 1000;

        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;

        velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

        direction.z = Number( moveForward ) - Number( moveBackward );
        direction.x = Number( moveRight ) - Number( moveLeft );
        direction.normalize(); // this ensures consistent movements in all directions

        if ( moveForward || moveBackward ) velocity.z -= direction.z * 400.0 * delta;
        if ( moveLeft || moveRight ) velocity.x -= direction.x * 400.0 * delta;

        scenecontrols.moveRight( - velocity.x * delta );
        scenecontrols.moveForward( - velocity.z * delta );

        scenecontrols.getObject().position.y += ( velocity.y * delta ); // new behavior

        if ( scenecontrols.getObject().position.y < 10 ) {

            velocity.y = 0;
            scenecontrols.getObject().position.y = 10;

            canJump = true;

        }

    }

    prevTime = time;

    sceneElements.composer.render(sceneElements);

}


