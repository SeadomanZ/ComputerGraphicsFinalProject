import * as THREE from './Three JS/build/three.module.js'
import {OrbitControls} from './Three JS/examples/jsm/controls/OrbitControls.js'
import {GLTFLoader} from './Three JS/examples/jsm/loaders/GLTFLoader.js'

//2. Scene
const scene = new THREE.Scene()

//3. Camera
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
renderer.setClearColor('#87b6b6')

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

const textureLoader = new THREE.TextureLoader()
const texture = textureLoader.load("./assets/textures/grass/rocky_terrain_02_diff_1k.jpg")

// const normalLoader = new THREE.TextureLoader()
// const normal = normalLoader.load("./assets/textures/grass/rocky_terrain_02_diff_1k.jpg")

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


//4. LIGHT
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

//5. OBJECTS
function createGround(w,h,d){
    const geo = new THREE.BoxGeometry(w,h,d)
    const mat = new THREE.MeshStandardMaterial({color: '#ffffff', map: texture})
    const mesh = new THREE.Mesh(geo, mat)
    return mesh
}

const ground = createGround(25,2,25)
ground.receiveShadow=true
ground.position.set(0,-1,0)
scene.add(ground)

let darkWarrior = null
let spellGroup = null
let spellActive = false

const gltfLoader = new GLTFLoader()
gltfLoader.load(
    './assets/models/momonga_ains_ooal_gown/scene.gltf',
    (gltf)=>{
        darkWarrior = gltf.scene

        darkWarrior.position.set(0,-0.01,3)
        darkWarrior.scale.set(0.01,0.01,0.01)
        darkWarrior.rotation.y=Math.PI/2

        darkWarrior.traverse((child)=>{
            if(child.isMesh{
                child.castShadow=true
                child.receiveShadow=true
            }
        })
        scene.add(darkWarrior)
        console.log("Dark Warrior loaded successfully");
    },
    (progress)=>{
        console.log(`Loading: ${(progress.loaded/progress.total*100).toFixed(2)}%`);
    },
    (error)=>{
        console.error('Error loading Dark Warrior model:', error)
    }
)