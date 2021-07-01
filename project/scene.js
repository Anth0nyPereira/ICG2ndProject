// To store the scene graph, and elements usefull to rendering the scene
const sceneElements = {
    sceneGraph: null,
    camera: null,
    control: null, 
    renderer: null,
    composer: null,
    spheresDirections: null,
    existingMonsters: null,
};


// Functions are called
//  1. Initialize the empty scene
//  2. Add elements within the scene
//  3. Animate
helper.initEmptyScene(sceneElements);
load3DObjects(sceneElements.sceneGraph);
requestAnimationFrame(computeFrame);

var moveForward = false, moveBackward = false, moveLeft = false, moveRight = false, canJump = false, moveFaster = false, show = false;

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
        case 27: //esc
            show = true;
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

    function createSphere() {
        var geometry = new THREE.SphereGeometry(20, 10, 10);
        var geo = new THREE.EdgesGeometry(geometry);
        var mat = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 1.5 });
        var sphere = new THREE.LineSegments(geo, mat);
        return sphere;
    }

    function selectPosition(pLight, checkpoint) {
        pLight.position.set(randomIntFromInterval(-490, 490), 4, randomIntFromInterval(-490, 490));
        checkpoint.position.set(pLight.position.x, 15, pLight.position.z);
    }

    function createMonster() {

        var monster = new THREE.Group();

        var shape = new THREE.Shape();

        // head
        shape.moveTo(-1.5, 3);
        shape.lineTo(1.5, 3);
        shape.lineTo(0, 0);
        shape.lineTo(-1.5, 3);

        // torso
        shape.moveTo(0, 0);
        shape.lineTo(4, 0);
        shape.lineTo(0, -7);
        shape.lineTo(-4, 0);
        shape.lineTo(0, 0);

        var shapeSettings = { steps: 2, depth: 2, bevelEnabled: false, bevelThickness: 1, bevelSize: 1, bevelSegments: 2};
        var shapeGeometry = new THREE.ExtrudeGeometry(shape, shapeSettings);
        var edgesGeometry = new THREE.EdgesGeometry(shapeGeometry);
        var material = new THREE.LineBasicMaterial({color: 0xff4d00, linewidth: 3.5})
        var headAndTorso = new THREE.LineSegments(edgesGeometry, material);

         // 1st arm
        var boxGeometry = new THREE.BoxGeometry(0.5, 0.5, 6);
        var edgesArmGeometry = new THREE.EdgesGeometry(boxGeometry);
        var firstArm = new THREE.LineSegments(edgesArmGeometry, material);
        firstArm.rotation.y = Math.PI/2;
        firstArm.rotateOnWorldAxis(new THREE.Vector3(0,0,1), -1);
        firstArm.position.set(5, -3.5, 0);

        // 2nd arm
        var secondArm = new THREE.LineSegments(edgesArmGeometry, material);
        secondArm.rotation.y = Math.PI/2;
        secondArm.rotateOnWorldAxis(new THREE.Vector3(0,0,1), 1);
        secondArm.position.set(-5, -3.5, 0);

        monster.add(headAndTorso);
        monster.add(firstArm);
        monster.add(secondArm);
        
        monster.rotation.y = 2 * Math.random();
        return monster;
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

    // Create obstacles!! 
    sceneElements.spheresDirections = []; // random directions of the spheres; sphere 1 with direction[0] and so on
    var randomD = ["x", "-x", "z", "-z"];
    sceneElements.spheresDeltas = [];

    // Spheres that will kill youuuuuu
    for (var i = 1; i < 7; i ++) {
        var sphere1 = createSphere();
        sphere1.name = "sphere" + i;
        sphere1.position.y = 18;
        sphere1.visible = true;
        var randomChoice = randomElementFromArray(randomD);
        //console.log(sceneElements.spheresDirections);
        sceneElements.spheresDirections.push(randomChoice);
        sceneElements.sceneGraph.add(sphere1);
        sphere1.position.set(randomIntFromInterval(-490, 490), 18, randomIntFromInterval(-490, 490));
        if (randomChoice == "z"  || randomChoice == "-z") {
            sphere1.rotation.z = Math.PI/2;
        } else if (randomChoice == "x" || randomChoice == "-x") {
            sphere1.rotation.x = Math.PI/2;
        }
    }

    sceneElements.existingMonsters = [];
    // Create monsters!!
    for (var m=1; m<50; m++) {
        var monster = createMonster();
        // console.log("monster" + m);
        monster.name = "monster" + m;
        monster.scale.set(1.5, 1.5, 1.5);
        monster.visible = false;
        monster.position.set(randomIntFromInterval(-490, 490), 10, randomIntFromInterval(-490, 490));
        sceneElements.sceneGraph.add(monster);
        sceneElements.existingMonsters.push(monster.name);
    }


}

// Displacement value

var delta = 0.1;

var dispX = 0.2, dispZ = 0.2;
var isExecuted = false;

var count = 0;

var up = true;

var deltaSpheres = [1, 1, 1, 1, 1, 1, 1, 1];
var deltaSphere1 = 1;

function computeFrame() {

    var checkpointGrab = new Audio("/resources/checkpoint.wav");
    
    sceneElements.composer.render();

    var allPlane = sceneElements.sceneGraph.getObjectByName("allPlane");
    var children = allPlane.children; // array of groups

    // Random ground disappears/reappears
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
                fallAndResetGame();
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
    //console.log("light positions: " + pLight.position.x + " " + pLight.position.z);
    //console.log(camera.getWorldPosition(target));
    if ((Math.round(camera.getWorldPosition(target).x) < pLight.position.x + 5 && Math.round(camera.getWorldPosition(target).x) > pLight.position.x - 5) && (Math.round(camera.getWorldPosition(target).z) < pLight.position.z + 5 && Math.round(camera.getWorldPosition(target).z) > pLight.position.z - 5)) {
        checkpointGrab.play();
        checkpointGrab.currentTime=0;
        selectPosition(pLight, checkpoint);

        // Update score
        updateScore();

    }

    // Animate spheres
    animateSpheres();

    // If camera gets touched by some sphere, izi kill rip
    for (var k=1; k<7; k++) {
        var sphere = sceneElements.sceneGraph.getObjectByName("sphere" + k);
        if ((Math.round(camera.getWorldPosition(target).x) < sphere.position.x + 12 && Math.round(camera.getWorldPosition(target).x) > sphere.position.x - 12) && (Math.round(camera.getWorldPosition(target).z) < sphere.position.z + 12 && Math.round(camera.getWorldPosition(target).z) > sphere.position.z - 12)) {
            // alert("died 2.0");
            var deathSound = new Audio("/resources/death.wav");
            deathSound.play();
            deathSound.currentTime=0;

            resetGame();
        }
    }
    
    
    // Create monsters and animate them
    
    if (count % 40 == 0) {
        var pickedMonster = randomElementFromArray(sceneElements.existingMonsters); // get name of a specific monster
        var monsterFromScene = sceneElements.sceneGraph.getObjectByName(pickedMonster);
        if (monsterFromScene.visible == false) {
            monsterFromScene.visible = true;
        }
    }

    animateAllMonsters();

    // HELP, I'm being followed by some random androids, PLS SAVE ME ----> AND I DIED (resetGame)
    for (var k=0; k<sceneElements.existingMonsters.length; k++) {
        var name = sceneElements.existingMonsters[k];
        var monster = sceneElements.sceneGraph.getObjectByName(name);
        if (monster.visible == true) {
            console.log(camera.getWorldPosition(target));
            console.log(monster.position.x + " " + monster.position.z);
            if ((Math.round(camera.getWorldPosition(target).x) < monster.position.x + 5 && Math.round(camera.getWorldPosition(target).x) > monster.position.x - 5) && (Math.round(camera.getWorldPosition(target).z) < monster.position.z + 10 && Math.round(camera.getWorldPosition(target).z) > monster.position.z - 10)) {
                console.log("reset game!!");
                var deathSound = new Audio("/resources/death.wav");
                deathSound.play();
                deathSound.currentTime=0;
    
                resetGame();
            }
        }
        
    }
    
    
    
    

    requestAnimationFrame( computeFrame );

    const time = performance.now();
    var scenecontrols = sceneElements.control;
    if (scenecontrols.isLocked === true) {
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

    } else {
        if (show) {
            document.getElementById("menu").style.display = "block";
            show = false;
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

function randomElementFromArray(array) {
    return array[Math.floor(Math.random()*array.length)];
}

function animateSpheres() {
    for (var j = 1; j < 7; j++) {
        var deltaSphere = deltaSpheres[j-1];
        var sphere = sceneElements.sceneGraph.getObjectByName("sphere" + j);
        var chosenDirection = sceneElements.spheresDirections[j-1];
        if (chosenDirection == "x") {
            sphere.rotation.y += 0.5;
            sphere.position.x += deltaSphere*6;
            
            if (sphere.position.x >= 490 || sphere.position.x <= -490) {
                deltaSphere *= -1;
                deltaSpheres[j-1] = deltaSphere;
            }
        } else if (chosenDirection == "-x") {
            sphere.rotation.y -= 0.5;
            sphere.position.x -= deltaSphere*6;
        
            if (sphere.position.x >= 490 || sphere.position.x <= -490) {
                deltaSphere *= -1;
                deltaSpheres[j-1] = deltaSphere;
            }
        } else if (chosenDirection == "z") {
            sphere.rotation.x += 0.5;
            sphere.position.z += deltaSphere*6;
            if (sphere.position.z >= 490 || sphere.position.z <= -490) {
                deltaSphere *= -1;
                deltaSpheres[j-1] = deltaSphere;
            }
        } else if (chosenDirection == "-z") {
            sphere.rotation.x -= 0.5;
            sphere.position.z -= deltaSphere*6;
            if (sphere.position.z >= 490 || sphere.position.z <= -490) {
                deltaSphere *= -1;
                deltaSpheres[j-1] = deltaSphere;
            }
        }
    }
}

function showAllPlanes() {
    var allPlanes = sceneElements.sceneGraph.getObjectByName("allPlane").children;
    for (var i=0; i<allPlanes.length; i++) {
        var elem = allPlanes[i].children[0];
        var edges = allPlanes[i].children[1];
        elem.visible = true;
        edges.visible = true;
    }

}

function resetCamera() {
    sceneElements.camera.position.set(0, 1, 40);
    sceneElements.camera.lookAt(new THREE.Vector3(0, 0, -150));
}

function fallAndResetGame() {
    
    sceneElements.control.unlock();
    sceneElements.camera.position.y -= 1;
    if (sceneElements.camera.position.y == -100) {
        var fallSound = new Audio("/resources/fall.wav");
        fallSound.play();
        fallSound.currentTime=0;

        removeAllMonsters();

        showAllPlanes();

        resetCamera();

        // Reset score
        resetScore();
    }

}

function resetGame() {
    
    showAllPlanes();

    removeAllMonsters();

    resetCamera();

    // Reset score
    resetScore();
}

function removeAllMonsters() {
    for (var i=0; i<sceneElements.existingMonsters.length; i++) {
        var monsterName = sceneElements.existingMonsters[i];
        var monster = sceneElements.sceneGraph.getObjectByName(monsterName);
        monster.visible = false;
    }
}

function animateAllMonsters() {
    var camera = sceneElements.camera;
    var target = new THREE.Vector3();
    for (var i=0; i<sceneElements.existingMonsters.length; i++) {
        var monsterName = sceneElements.existingMonsters[i];
        var monster = sceneElements.sceneGraph.getObjectByName(monsterName);
        if (monster.visible == true) {
            var dir = new THREE.Vector3(); // create once an reuse it
            var v2 = new THREE.Vector3(camera.getWorldPosition(target).x, camera.getWorldPosition(target).y, camera.getWorldPosition(target).z);
            var v1 = new THREE.Vector3(monster.position.x, monster.position.y, monster.position.z);
            dir.subVectors(v2, v1).normalize();
            monster.position.x += dir.x;
            monster.position.z += dir.z;
        }
    }
}




