import * as THREE from 'three'
import globe from './models/sputnik/sputnik.gltf'
// import globe from './models/globe.gltf'
// import globe from './models/helmet/DamagedHelmet.gltf'

import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
// import {KMZLoader} from 'three/examples/jsm/loaders/KMZLoader.js'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'

let scene, renderer

window.camera = null

let evrasia

init()

function init() {
    scene = new THREE.Scene()
    // scene.background = new THREE.Color(0x332288)
    scene.background = new THREE.Color(0x999999)


    let light = new THREE.DirectionalLight(0xffffff)
    light.position.set(0.5, 1.0, 0.5).normalize()
    light.intensity = 3

    scene.add(light)

    camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 500)

    camera.position.x = 10
    camera.position.y = 10
    camera.position.z = 10

    scene.add(camera)

    let grid = new THREE.GridHelper(50, 50, 0xbbbbbb, 0x777777)
    scene.add(grid)

    renderer = new THREE.WebGLRenderer({antialias: true})
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(renderer.domElement)

    let loader = new GLTFLoader()

    let controls = new OrbitControls(camera, renderer.domElement)
    controls.addEventListener('change', render)
    controls.update()

    // loader.setPath('models/sputnik/')
    loader.load(globe, function(gltf) {
        // loader.load('./DamagedHelmet.gltf', function(gltf) {
        gltf.scene.position.y = 1
        gltf.scene.scale.x = .03
        gltf.scene.scale.y = .03
        gltf.scene.scale.z = .03

        const root = gltf.scene;
        scene.add(root);

        const box = new THREE.Box3().setFromObject(root);

        const boxSize = box.getSize(new THREE.Vector3()).length();
        const boxCenter = box.getCenter(new THREE.Vector3());

        // set the camera to frame the box
        frameArea(boxSize * 0.5, boxSize, boxCenter, camera);

        // update the Trackball controls to handle the new size
        controls.maxDistance = boxSize * 10;
        controls.target.copy(boxCenter);
        controls.update();

        console.log(dumpObject(root).join('\n'));

        evrasia = root.getObjectByName('Evrasia_dop');
        console.log(evrasia)

        render()
    })

    window.addEventListener('resize', onWindowResize)
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()

    renderer.setSize(window.innerWidth, window.innerHeight)

    //render()
}

function render() {
    let time = performance.now() / 1000
    if (evrasia) {
        let dist = 500
        let x = dist * Math.sin(time)
        let y = dist * Math.cos(time)
        evrasia.position.set(x, 5, y)
    }
    renderer.render(scene, camera)

    requestAnimationFrame(render)
}

function frameArea(sizeToFitOnScreen, boxSize, boxCenter, camera) {
    const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
    const halfFovY = THREE.MathUtils.degToRad(camera.fov * .5);
    const distance = halfSizeToFitOnScreen / Math.tan(halfFovY);
    // compute a unit vector that points in the direction the camera is now
    // in the xz plane from the center of the box
    const direction = (new THREE.Vector3())
        .subVectors(camera.position, boxCenter)
        .multiply(new THREE.Vector3(1, 0, 1))
        .normalize();

    // move the camera to a position distance units way from the center
    // in whatever direction the camera was from the center already
    camera.position.copy(direction.multiplyScalar(distance).add(boxCenter));

    // pick some near and far values for the frustum that
    // will contain the box.
    camera.near = boxSize / 100;
    camera.far = boxSize * 100;

    camera.updateProjectionMatrix();

    // point the camera to look at the center of the box
    camera.lookAt(boxCenter.x, boxCenter.y, boxCenter.z);
}

function dumpObject(obj, lines = [], isLast = true, prefix = '') {
    const localPrefix = isLast ? '└─' : '├─';
    lines.push(`${prefix}${prefix ? localPrefix : ''}${obj.name || '*no-name*'} [${obj.type}]`);
    const newPrefix = prefix + (isLast ? '  ' : '│ ');
    const lastNdx = obj.children.length - 1;
    obj.children.forEach((child, ndx) => {
        const isLast = ndx === lastNdx;
        dumpObject(child, lines, isLast, newPrefix);
    });
    return lines;
}