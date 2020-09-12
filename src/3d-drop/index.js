import * as THREE from 'three'
import {noise} from './perlin'
import {arrayMax} from "three/src/utils"

let power = 0
let scene, camera, renderer, sphere, sphere2, ambientLight, spotlight, floor, wall, material, envMap
const width = window.innerWidth
const height = window.innerHeight
const aspectRatio = width/height

function init() {
    scene = new THREE.Scene()
    envMap = new THREE.CubeTextureLoader()
        .setPath(
            "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/cube/pisa/"
        )
        .load(["px.png", "nx.png", "py.png", "ny.png", "pz.png", "nz.png"]);

    camera = new THREE.PerspectiveCamera(45, aspectRatio, 0.1, 1000)
    camera.position.z = 50
    camera.lookAt(scene.position)

    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setClearColor("#eeeeee", 1.0)
    renderer.setSize(width, height)

    const geometry = new THREE.IcosahedronGeometry(10, 5)
    material = new THREE.MeshPhongMaterial({
        shininess: 90,
        transparent: true,
        opacity: 1,
        // map: new THREE.TextureLoader().load('https://pixeljam.ru/cloud/codepen/oil-texture-grad.jpg'),
        wireframe: false,
        specular: 0xffff44, // Цвет бликов
        flatShading: false,
        envMap: envMap,
        color: 0xffddff // основной цвет
    })

    sphere = new THREE.Mesh(geometry, material)
    sphere.name = "Sphere"
    sphere.castShadow = true
    scene.add(sphere)

    // Lights
    ambientLight = new THREE.AmbientLight(0xffffff, .1)
    ambientLight.castShadow = true
    scene.add(ambientLight)

    spotlight = new THREE.SpotLight(0x9999ff, 1.2) // верхний направленный свет
    spotlight.castShadow = true
    spotlight.position.set(100, 100, 50)
    // spotlight.shadowDarkness = 1
    scene.add(spotlight)

    const NewSpotlight = new THREE.SpotLight(0xff5555, .5) // нижний направленный свет
    NewSpotlight.castShadow = true
    NewSpotlight.position.set(-30, -100, 10)
    scene.add(NewSpotlight)

    // Floor
//   const floorGeometry = new THREE.PlaneGeometry(200, 200, 25, 25)
//   const floorMesh = new THREE.MeshStandardMaterial({ color: 0x2d3440 })
//   floor = new THREE.Mesh(floorGeometry, floorMesh)
//   floor.rotation.x = Math.PI / 180 * - 90
//   floor.position.y = -15
//   floor.receiveShadow = true
//   scene.add(floor)

//   // Wall
//   const wallGeometry = new THREE.PlaneGeometry(200, 200, 25, 25)
//   const wallMesh = new THREE.MeshStandardMaterial({ color: 0x2d3436 })
//   wall = new THREE.Mesh(wallGeometry, wallMesh)
//   wall.position.z = -20
//   wall.position.y = 0
//   wall.receiveShadow = true
//   scene.add(wall)

    // Updating
    const update = () => {
        const time = performance.now() * 0.0025

        let rippleCount = 0.5 // Количество волн в покое
        let extraRippleCount = 1 // Max прирост количество волн
        rippleCount += extraRippleCount * power

        let size = 10 // Базовый размер
        let extraSize = 1 // Max прирост размера
        size += extraSize * power

        let rippleHeight = 2.5 // Размер волн
        let extraRippleHeight = 2 // Max прирост пазмера волн
        rippleHeight += extraRippleHeight * power

        for (let i = 0; i < sphere.geometry.vertices.length; i++) {
            const p = sphere.geometry.vertices[i]
            p.normalize().multiplyScalar(size + rippleHeight * noise.perlin3(p.x * rippleCount + time, p.y * rippleCount, p.z * rippleCount))
        }
        sphere.geometry.computeVertexNormals()
        sphere.geometry.normalSpeedUpdate = true
        sphere.geometry.verticesNeedUpdate = true
    }


    // Rendering
    document.body.appendChild(renderer.domElement)
    window.onresize = function () {
        renderer.setSize(window.innerWidth, window.innerHeight)
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
    }
    const render = function () {
        renderer.render(scene, camera)
        sphere.rotation.x += 0.001
        sphere.rotation.y += 0.005
        update()
        requestAnimationFrame(render)
    }
    render()
}

document.addEventListener('mousemove', e => {
    let mouseX = e.clientX
    let mouseY = e.clientY
    let halfWidth = window.innerWidth / 2
    let halfHeight = window.innerHeight / 2

    const minDistance = Math.min(halfWidth, halfHeight)

    let distanceX = halfWidth - mouseX
    let distanceY = halfHeight - mouseY
    let distance = Math.sqrt(distanceX ** 2 + distanceY ** 2)

    if (distance < minDistance) {
        power = (minDistance - distance) / minDistance
    } else {
        power = 0
    }
})

document.querySelector('#envMap').addEventListener('change', e => {
    if (e.target.checked) {
        material.envMap = envMap
    } else {
        material.envMap = null
    }
})

window.onload = init()