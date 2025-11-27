import * as THREE from './Three JS/build/three.module.js'
import {OrbitControls} from './Three JS/examples/jsm/controls/OrbitControls.js'

const scene = new THREE.Scene()
const TPcamera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth/window.innerHeight,
    0.1,
    1000
)
const FPcamera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth/window.innerHeight,
    0.1,
    1000
)
const renderer = new THREE.WebGLRenderer({antialias: true})

const orbitControls = new OrbitControls(TPcamera, renderer.domElement)
orbitControls.target.set(0,0,0)
orbitControls.update()

renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

TPcamera.position.set(6,3,5)
TPcamera.lookAt(0,0,0)

FPcamera.position.set(0,1.8,0)
FPcamera.lookAt(1,1.8,0)

renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFShadowMap

function animate(){
    orbitControls.update()
    renderer.render(scene, TPcamera)
}
renderer.setAnimationLoop(animate)

window.onresize = ()=>{
    renderer.setSize(window.innerWidth, window.innerHeight)
    TPcamera.aspect = window.innerWidth/window.innerHeight
    TPcamera.updateProjectionMatrix()

    FPcamera.aspect = window.innerWidth/window.innerHeight
    FPcamera.updateProjectionMatrix()
}

const ambientLight = new THREE.AmbientLight('#ffffff', 0.7)
const spotLight = new THREE.SpotLight('#ffffff', 1.2, 1000)
spotLight.castShadow=true
spotLight.position.set(0,10,0)
spotLight.shadow.mapSize.width = 2048
spotLight.shadow.mapSize.height = 2048
//map size width and height still don't know how to set
const directionalLight = new THREE.DirectionalLight('#ffffee', 0.5)
directionalLight.position.set(5,2,8)
const pointLight = new THREE.PointLight('#ffd700', 2, 3)
pointLight.position.set(0,0.5,0)
//x and z relative to Dark Warrior's position (idk how to set this)
// Nanti di animate loop setelah Dark Warrior ada:
// pointLight.position.set(darkWarrior.position.x, 0.5, darkWarrior.position.z)

scene.add(ambientLight, spotLight, directionalLight, pointLight)

//test 
