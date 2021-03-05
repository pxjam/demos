import * as THREE from 'three'

import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
// import {KMZLoader} from 'three/examples/jsm/loaders/KMZLoader.js'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'

let camera, scene, renderer

init()

function init() {
    scene = new THREE.Scene()
    scene.background = new THREE.Color(0x999999)

    const light = new THREE.DirectionalLight(0xffffff)
    light.position.set(0.5, 1.0, 0.5).normalize()

    scene.add(light)

    camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 500)

    camera.position.y = 5
    camera.position.z = 10

    scene.add(camera)

    const grid = new THREE.GridHelper(50, 50, 0xffffff, 0x555555)
    scene.add(grid)

    renderer = new THREE.WebGLRenderer({antialias: true})
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(renderer.domElement)

    const loader = new GLTFLoader()
    // loader.setPath('models/helmet/')
    loader.setPath('models/sputnik/')
    loader.load('./sputnik.gltf', function(gltf) {
        // loader.load('./DamagedHelmet.gltf', function(gltf) {
        //gltf.scene.position.y = 0.5
        // gltf.scene.scale(0.1)
        scene.add(gltf.scene)

        gltf.scene.scale.x = .03
        gltf.scene.scale.y = .03
        gltf.scene.scale.z = .03

        console.log(gltf.scene)
        render()
    })

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.addEventListener('change', render)
    controls.update()

    window.addEventListener('resize', onWindowResize)
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()

    renderer.setSize(window.innerWidth, window.innerHeight)

    render()
}

function render() {
    renderer.render(scene, camera)
}
