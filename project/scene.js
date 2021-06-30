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

var moveForward = false, moveBackward = false, moveLeft = false, moveRight = false, canJump = false, moveFaster = false;

let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

// HANDLING EVENTS

// Event Listeners

window.addEventListener('resize', resizeWindow);

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
        case 16: //shift
            moveFaster = true;
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
        case 16: //shift
            moveFaster = false;
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
    var random = randomIntFromInterval(1, 20);
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


function createCheckpoint() {
    var shape = new THREE.Shape();
    shape.moveTo(-2, 15);
    shape.lineTo(2, 15);
    shape.lineTo(2, 4.5);
    shape.lineTo(6, 6.5);
    shape.lineTo(6, 3.5);
    shape.lineTo(0, 0);
    shape.lineTo(-6, 3.5);
    shape.lineTo(-6, 6.5);
    shape.lineTo(-2, 4.5);
    shape.lineTo(-2, 10);

    const extrudeSettings = { steps: 2, depth: 2, bevelEnabled: true, bevelThickness: 1, bevelSize: 1, bevelSegments: 2};
    var geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    var material = new THREE.MeshBasicMaterial({color: 0xFFD700});
    var mesh = new THREE.Mesh(geometry, material);
    mesh.scale.set(2, 2.3, 2);
    return mesh;
}

// Create and insert in the scene graph the models of the 3D scene
function load3DObjects(sceneGraph) {

    var geometry = new THREE.ConeGeometry( 200, 400, 8 );
    //var geo = new THREE.EdgesGeometry( geometry );
    var mat = new THREE.MeshBasicMaterial( { color: 0xff0000, linewidth: 50 } );

    var mesh = new THREE.Mesh(geometry, mat);
    mesh.position.y = 30;
    mesh.scale.set(1/5, 1/5, 1/5);
    // sceneElements.sceneGraph.add(mesh);

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

    // Create a checkpoint at the same position that is the first light
    var checkpoint1 = createCheckpoint();
    checkpoint1.name = "checkpoint";
    checkpoint1.position.set(10, 5, 10);
    sceneElements.sceneGraph.add(checkpoint1);


}

// Displacement value

var delta = 0.1;

var dispX = 0.2, dispZ = 0.2;
var isExecuted = false;

var count = 0;

var up = true;
function computeFrame() {
    var checkpointGrab = new Audio("/resources/checkpoint.wav");

    sceneElements.composer.render();

    var allPlane = sceneElements.sceneGraph.getObjectByName("allPlane");
    var children = allPlane.children; // array of groups

    // Random ground disappears/reappears
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
                    // Reset score
                    resetScore();
                }
            }
        }
        
    }
    
    // Checkpoint animation

    var checkpoint = sceneElements.sceneGraph.getObjectByName("checkpoint");
    checkpoint.rotation.y += 0.12;
    
    
    if (up) {
        if (checkpoint.position.y >= 15) {
            up = false;
        } else {
            checkpoint.position.y += 0.3;
            //console.log(checkpoint.position.y);
        }
    } else if (!up) {
        if (checkpoint.position.y <= 5) {
            up = true;
        } else {
            checkpoint.position.y -= 0.3;
        }
    } 


    var pLight = sceneElements.sceneGraph.getObjectByName("pLight");
    var camera = sceneElements.camera;
    var target = new THREE.Vector3();
    console.log("light positions: " + pLight.position.x + " " + pLight.position.z);
    console.log(camera.getWorldPosition(target));
    if ((Math.round(camera.getWorldPosition(target).x) < pLight.position.x + 5 && Math.round(camera.getWorldPosition(target).x) > pLight.position.x - 5) && (Math.round(camera.getWorldPosition(target).z) < pLight.position.z + 5 && Math.round(camera.getWorldPosition(target).z) > pLight.position.z - 5)) {
        checkpointGrab.play();
        checkpointGrab.currentTime=0;
        pLight.position.set(randomIntFromInterval(-490, 490), 4, randomIntFromInterval(-490, 490));
        checkpoint.position.set(pLight.position.x, 15, pLight.position.z);

        // Update score
        updateScore();

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

        if (moveFaster) {
            velocity.x = 1.2*velocity.x;
            velocity.z = 1.2*velocity.z;

        }

        scenecontrols.moveRight(-velocity.x * delta);
        scenecontrols.moveForward(-velocity.z * delta);

        scenecontrols.getObject().position.y += (velocity.y * delta);

        var camera = sceneElements.camera;

        var target = new THREE.Vector3();
        console.log(camera.getWorldPosition(target));

        if (Math.round(camera.getWorldPosition(target).x) >= 490) {
            camera.position.x = 490;
        } else if (Math.round(camera.getWorldPosition(target).x) <= -490) {
            camera.position.x = -490;
        } else if (Math.round(camera.getWorldPosition(target).z) >= 490) {
            camera.position.z = 490;
        } else if (Math.round(camera.getWorldPosition(target).z) <= -490) {
            camera.position.z = -490;
        }

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

function updateScore() {
    var score = document.getElementById("score").textContent;
    score = parseInt(score);
    score = score + randomIntFromInterval(200, 500);
    score = score.toString();
    var scoreLength = score.toString().length;
    var missingZeros = 8 - scoreLength;
    for (var i = 0; i < missingZeros; i++) {
        score = "0" + score;
    }
    document.getElementById("score").textContent=score;

}

function resetScore() {
    document.getElementById("score").textContent="00000000";
}


