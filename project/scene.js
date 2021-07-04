// Storing some variables to access them later
const sceneElements = {
    sceneGraph: null,
    camera: null,
    control: null, 
    renderer: null,
    composer: null,
    spheresDirections: null,
    existingMonsters: null,
};

helper.initEmptyScene(sceneElements);
load3DObjects(sceneElements.sceneGraph);
requestAnimationFrame(computeFrame);

var moveForward = false, moveBackward = false, moveLeft = false, moveRight = false, canJump = false, moveFaster = false, show = false;

var prevTime = performance.now();
var velocity = new THREE.Vector3();
var direction = new THREE.Vector3();

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

// When pressing a key
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
        case 27: //esc --> it does not appear on the onDocumentKeyUp because it is set to false when you lock the game
            show = true;
            break;
            
    }
}

// When releasing a key
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

// function to return a random integer between two values
function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
}

// function to create the floor plane
function createPlane() {
    var random = randomIntFromInterval(1, 20);
    var plane = new THREE.Group();
    var planeGeometry = new THREE.PlaneGeometry(20, 20);
    if (random == 1) { // then the plane will be filled with violet color
        var planeMaterial = new THREE.MeshBasicMaterial({ color: 0xB026FF, side: THREE.DoubleSide });
    } else { // most of the time each plane's color will be dark blue
        var planeMaterial = new THREE.MeshBasicMaterial({ color: 0x000026, side: THREE.DoubleSide });
    }
    var edgesGeometry = new THREE.EdgesGeometry(planeGeometry);
    var edgesMaterial = new THREE.LineBasicMaterial({ color: 0xB026FF, linewidth: 10});
    
    var planeObject = new THREE.Mesh(planeGeometry, planeMaterial);
    var edgesMesh = new THREE.LineSegments(edgesGeometry, edgesMaterial); // the edges of each plane, always violet
    
    planeObject.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);
    edgesMesh.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);
    planeObject.receiveShadow = true;

    plane.add(planeObject);
    plane.add(edgesMesh);

    return plane;
}

// function to create the arrow that points to the checkpoint position
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

    var extrudeSettings = { steps: 2, depth: 2, bevelEnabled: true, bevelThickness: 1, bevelSize: 1, bevelSegments: 2};
    var geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    var material = new THREE.MeshBasicMaterial({color: 0xFFD700});
    var mesh = new THREE.Mesh(geometry, material);
    mesh.scale.set(2, 2.3, 2);
    return mesh;
}

// function that creates the red spheres that appear in the game
function createSphere() {
    var geometry = new THREE.SphereGeometry(20, 10, 10);
    var geo = new THREE.EdgesGeometry(geometry);
    var mat = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 1.5 });
    var sphere = new THREE.LineSegments(geo, mat);
    return sphere;
}

// function that creates each orange wireframed-monster
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

// function that places both pLight and the arrow in a random-new position
function selectPosition(pLight, checkpoint) {
    pLight.position.set(randomIntFromInterval(-490, 490), 4, randomIntFromInterval(-490, 490));
    checkpoint.position.set(pLight.position.x, 15, pLight.position.z);
}

// Create and insert in the scene graph the models of the 3D scene
function load3DObjects(sceneGraph) {

    // Create ground planes
    var allPlane = new THREE.Object3D();
    allPlane.name = "allPlane";
    for (var z = -25; z < 25; z++) {
        for (var x=-25; x<25; x++) {
            var plane = createPlane();
            plane.position.set(x*20, -2, z*20);
            allPlane.add(plane);
        }
    }

    sceneElements.sceneGraph.add(allPlane);

    // Create a checkpoint at the same position that is the pointlight
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
    for (var m=1; m<20; m++) {
        var monster = createMonster();
        monster.name = "monster" + m;
        monster.scale.set(1.5, 1.5, 1.5);
        monster.visible = false;
        monster.position.set(randomIntFromInterval(-490, 490), 10, randomIntFromInterval(-490, 490));
        sceneElements.sceneGraph.add(monster);
        sceneElements.existingMonsters.push(monster.name);
    }
}

var count = 0;

var up = true;

var deltaSpheres = [1, 1, 1, 1, 1, 1];

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

    // Check if you're above a hole --> you died
    var camera = sceneElements.camera;
    var target = new THREE.Vector3();
    for (var i = 0; i < children.length; i++) {
        var elem = children[i].children[0];
        var edges = children[i].children[1];
        if (elem.visible == false) {
            if ((Math.round(camera.getWorldPosition(target).x) < elem.getWorldPosition(target).x + 10 && Math.round(camera.getWorldPosition(target).x) > elem.getWorldPosition(target).x - 10) && (Math.round(camera.getWorldPosition(target).z) < elem.getWorldPosition(target).z + 10 && Math.round(camera.getWorldPosition(target).z) > elem.getWorldPosition(target).z - 10)) {
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
    if ((Math.round(camera.getWorldPosition(target).x) < pLight.position.x + 5 && Math.round(camera.getWorldPosition(target).x) > pLight.position.x - 5) && (Math.round(camera.getWorldPosition(target).z) < pLight.position.z + 5 && Math.round(camera.getWorldPosition(target).z) > pLight.position.z - 5)) {
        checkpointGrab.play();
        checkpointGrab.currentTime=0;
        // Select random position for the pLight and checkpoint
        selectPosition(pLight, checkpoint);

        // Update score (between 500 & 1000)
        updateScore(500, 1000);
    }

    // Animate spheres
    animateSpheres();

    // If camera gets touched by some sphere, izi kill rip
    for (var k=1; k<7; k++) {
        var sphere = sceneElements.sceneGraph.getObjectByName("sphere" + k);
        if ((Math.round(camera.getWorldPosition(target).x) < sphere.position.x + 13 && Math.round(camera.getWorldPosition(target).x) > sphere.position.x - 13) && (Math.round(camera.getWorldPosition(target).z) < sphere.position.z + 13 && Math.round(camera.getWorldPosition(target).z) > sphere.position.z - 13)) {
            var deathSound = new Audio("/resources/death.wav");
            deathSound.play();
            deathSound.currentTime=0;

            resetGame();
        }
    }
    
    
    // Create monsters and animate them
    if (count % 20 == 0) {
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
        if (monster.visible == true) { // only the monsters that are visible are "part of the game"
            if ((Math.round(camera.getWorldPosition(target).x) < monster.position.x + 5 && Math.round(camera.getWorldPosition(target).x) > monster.position.x - 5) && (Math.round(camera.getWorldPosition(target).z) < monster.position.z + 5 && Math.round(camera.getWorldPosition(target).z) > monster.position.z - 5)) {
                var deathSound = new Audio("/resources/death.wav");
                deathSound.play();
                deathSound.currentTime=0;
    
                resetGame();
            }
        }
        
    }

    requestAnimationFrame(computeFrame);

    const time = performance.now();
    var scenecontrols = sceneElements.control;
    if (scenecontrols.isLocked == true) {
        const delta = (time - prevTime)/1000;

        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;

        // Get current directions
        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveRight) - Number(moveLeft);
        direction.normalize(); // this ensures consistent movements in all directions

        // PointerLockControls moving
        if (moveForward || moveBackward) {
            velocity.z -= direction.z * 400.0 * delta; 
        }

        if (moveLeft || moveRight) {
            velocity.x -= direction.x * 400.0 * delta;
        }

        if (moveFaster) { // press shift
            velocity.x = 1.4*velocity.x;
            velocity.z = 1.4*velocity.z;

        }

        scenecontrols.moveRight(-velocity.x * delta);
        scenecontrols.moveForward(-velocity.z * delta);

        // Check game boundaries/limits
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

        scenecontrols.getObject().position.y += ( velocity.y * delta );

        if ( scenecontrols.getObject().position.y < 10 ) {

            velocity.y = 0;
            scenecontrols.getObject().position.y = 10;
        }

    } else {
        if (show) {
            document.getElementById("menu").style.display = "block";
            show = false;
        }
        
    }

    prevTime = time;
    sceneElements.composer.render(sceneElements); // render the renderer with the bloom effect

}

// function that updates the score 
function updateScore(x, y) {
    var scoreSound = new Audio("/resources/points.wav");
    var score = document.getElementById("score").textContent;
    score = parseInt(score);
    score = score + randomIntFromInterval(x, y);
    score = score.toString();
    var scoreLength = score.toString().length;
    var missingZeros = 8 - scoreLength;
    for (var i = 0; i < missingZeros; i++) {
        score = "0" + score;
    }
    document.getElementById("score").textContent=score;
    scoreSound.play();
    scoreSound.currentTime=0;

}

// function that resets the score when you die
function resetScore() {
    document.getElementById("score").textContent="00000000";
}

// function that returns a random element from a given array
function randomElementFromArray(array) {
    return array[Math.floor(Math.random()*array.length)];
}

// function that moves each sphere; each sphere will move in a random direction, selected when creating each sphere
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

// function that sets all planes to become visible
function showAllPlanes() {
    var allPlanes = sceneElements.sceneGraph.getObjectByName("allPlane").children;
    for (var i=0; i<allPlanes.length; i++) {
        var elem = allPlanes[i].children[0];
        var edges = allPlanes[i].children[1];
        elem.visible = true;
        edges.visible = true;
    }

}

// function that sets the camera to the starting position
function resetCamera() {
    sceneElements.camera.position.set(0, 1, 40);
    sceneElements.camera.lookAt(new THREE.Vector3(0, 0, -150));
}

// function used when you fall in a hole
function fallAndResetGame() {
    // unlock (remove mouse input) so that the camera will change its y-position
    sceneElements.control.unlock();
    sceneElements.camera.position.y -= 1; // falling camera
    if (sceneElements.camera.position.y == -30) {
        var fallSound = new Audio("/resources/fall.wav");
        fallSound.play();
        fallSound.currentTime=0;

        // remove all the monsters
        removeAllMonsters();

        // all planes become "filled" - no missing planes
        showAllPlanes();

        // camera goes to the starting position
        resetCamera();

        // Reset score
        resetScore();
    }

}

// function that is used when you got hit by a sphere or monster (you don't fall)
function resetGame() {
    
    // all planes become "filled" - no missing planes
    showAllPlanes();

    // remove all the monsters
    removeAllMonsters();

    // camera goes to the starting position
    resetCamera();

    // Reset score
    resetScore();
}

// function that assigns to all monsters invisibility
function removeAllMonsters() {
    for (var i=0; i<sceneElements.existingMonsters.length; i++) {
        var monsterName = sceneElements.existingMonsters[i];
        var monster = sceneElements.sceneGraph.getObjectByName(monsterName);
        monster.visible = false;
    }
}

// function that moves all monsters into your direction
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
            checkIfMonsterIsInsideVoid(monster);
        }
    }
}

// function that checks if a monster is above a hole
function checkIfMonsterIsInsideVoid(monster) {
    var target = new THREE.Vector3();
    var allPlane = sceneElements.sceneGraph.getObjectByName("allPlane");
    var children = allPlane.children; 
    for (var i=0; i<children.length; i++) {
        var elem = children[i].children[0];
        if ((Math.round(monster.position.x) < elem.getWorldPosition(target).x + 10 && Math.round(monster.position.x) > elem.getWorldPosition(target).x - 10) && (Math.round(monster.position.z) < elem.getWorldPosition(target).z + 10 && Math.round(monster.position.z) > elem.getWorldPosition(target).z - 10)) {
            if (elem.visible == false) {
                monster.position.y -= 1;
                // Update score (for killing a monster or just by luck lmao they are dumb sometimes)
                var camera = sceneElements.camera;
                if (camera.getWorldPosition(target).y == 10) { // when you fall/lose, even if there are monsters falling too, you do not receive any points anymore!!
                    updateScore(100, 200);
                }     
                if (monster.position.y < 5) {
                    monster.position.set(randomIntFromInterval(-490, 490), 10, randomIntFromInterval(-490, 490));
                    monster.visible = false;
                }
            } else if (elem.visible == true && monster.position.y < 10) { // when a monster started to fall but then the floor reappeared
                monster.position.y -= 1;
                var camera = sceneElements.camera;
                if (camera.getWorldPosition(target).y == 10) { // when you fall/lose, even if there are monsters falling too, you do not receive any points anymore!!
                    updateScore(100, 200);
                }     
                if (monster.position.y < 5) {
                    monster.position.set(randomIntFromInterval(-490, 490), 10, randomIntFromInterval(-490, 490));
                    monster.visible = false;
                }
            }
        } 
    }
}





