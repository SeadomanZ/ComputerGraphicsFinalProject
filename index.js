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
const trunkTexture = textureLoader.load("./assets/textures/tree/chinese_cedar_bark_diff_1k.jpg")

// const normalLoader = new THREE.TextureLoader()
// const normal = normalLoader.load("./assets/textures/grass/rocky_terrain_02_diff_1k.jpg")

function animate(){
    orbitControls.update()
    updateDarkWarrior()
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
    './assets/models/momonga_ainz_ooal_gown/scene.gltf',
    (gltf)=>{
        darkWarrior = gltf.scene

        darkWarrior.position.set(0,-0.01,3)
        darkWarrior.scale.set(0.01,0.01,0.01)
        darkWarrior.rotation.y=Math.PI/2

        darkWarrior.traverse((child)=>{
            if(child.isMesh){
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

//SPELL CIRCLE
function createSpellCircle(){
    const spellCircle = new THREE.Group()
    const spellMaterial= new THREE.MeshPhongMaterial({
        color: '#DAA520',
        emmisive: 0xFFCC00,
        emmisiveIntensity: 2,
        shininess: 100,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
    })

    //INNER RING
    const innerRingGeo = new THREE.RingGeometry(1,1.2,64)
    const innerRing = new THREE.Mesh(innerRingGeo, spellMaterial)
    innerRing.rotation.x = Math.PI/2
    innerRing.position.y = 0.02
    spellCircle.add(innerRing)

    //OUTER RING
    const outerRingGeo = new THREE.RingGeometry(1.8,2,64)
    const outerRing = new THREE.Mesh(outerRingGeo, spellMaterial)
    outerRing.rotation.x = Math.PI/2
    outerRing.position.y = 0.02
    spellCircle.add(outerRing)

    //Pointer 1
    const pointerGeo = new THREE.BoxGeometry(0.05,4,0.01)
    const pointer1 = new THREE.Mesh(pointerGeo, spellMaterial)
    pointer1.rotation.set(Math.PI/2,0,Math.PI/2)
    pointer1.position.y = 0.01
    spellCircle.add(pointer1)

    //Pointer 2
    const pointer2 = new THREE.Mesh(pointerGeo, spellMaterial)
    pointer2.rotation.set(Math.PI/2,0,0)
    pointer2.position.y = 0.01
    spellCircle.add(pointer2)

    return spellCircle
}

//KEYBOARD CONTROLS
const keys= {
    w:false,
    a:false,
    s:false,
    d:false,
    q:false,
    e:false,
    space:false
}

window.addEventListener('keydown',(e)=>{
    const key = e.key.toLowerCase()

    if(key==='w') keys.w=true
    if(key==='a') keys.a=true
    if(key==='s') keys.s=true
    if(key==='d') keys.d=true
    if(key==='q') keys.q=true
    if(key==='e') keys.e=true
    if(key===' ' && !keys.space){
        keys.space=true
        toggleSpell()
    }
})

window.addEventListener('keyup', (e)=>{
    const key = e.key.toLowerCase()

    if(key==='w') keys.w=false
    if(key==='a') keys.a=false
    if(key==='s') keys.s=false
    if(key==='d') keys.d=false
    if(key==='q') keys.q=false
    if(key==='e') keys.e=false
    if(key===' ') keys.space=false
})

//TOGGLE SPACE FUNCTION
function toggleSpell(){
    if(!darkWarrior) return

    if(spellActive){
        //remove spell
        if(spellGroup){
            scene.remove(spellGroup)
            spellGroup = null
        }
        spellActive = false
        console.log('Spell deactivated');
    }else{
        //add spell
        spellGroup = createSpellCircle()
        spellGroup.position.set(darkWarrior.position.x, 0, darkWarrior.position.z)
        scene.add(spellGroup)
        spellActive =true
        console.log('Spell activated');
    }
}

//===================================================================
// UPDATE DARK WARRIOR (called in animate loop)
//===================================================================

function updateDarkWarrior() {
    if (!darkWarrior) return
    
    const movementSpeed = 0.1
    const rotationSpeed = 0.05
    
    // Movement W/A/S/D (relative to model's rotation)
    if (keys.w) {
        darkWarrior.position.x += Math.sin(darkWarrior.rotation.y) * movementSpeed
        darkWarrior.position.z += Math.cos(darkWarrior.rotation.y) * movementSpeed
    }
    if (keys.s) {
        darkWarrior.position.x -= Math.sin(darkWarrior.rotation.y) * movementSpeed
        darkWarrior.position.z -= Math.cos(darkWarrior.rotation.y) * movementSpeed
    }
    if (keys.a) {
        darkWarrior.position.x -= Math.cos(darkWarrior.rotation.y) * movementSpeed
        darkWarrior.position.z += Math.sin(darkWarrior.rotation.y) * movementSpeed
    }
    if (keys.d) {
        darkWarrior.position.x += Math.cos(darkWarrior.rotation.y) * movementSpeed
        darkWarrior.position.z -= Math.sin(darkWarrior.rotation.y) * movementSpeed
    }
    
    // Rotation Q/E
    if (keys.q) {
        darkWarrior.rotation.y += rotationSpeed
    }
    if (keys.e) {
        darkWarrior.rotation.y -= rotationSpeed
    }
    
    // Update spell position to follow Dark Warrior
    if (spellActive && spellGroup) {
        spellGroup.position.set(darkWarrior.position.x, 0, darkWarrior.position.z)
        
        // Optional: Rotate spell circle for cool effect
        spellGroup.rotation.y += 0.01
    }
    
    // Update point light position (spell effect)
    pointLight.position.set(darkWarrior.position.x, 0.5, darkWarrior.position.z)
    
    // Update First Person Camera (mengikuti Dark Warrior)
    const offset = new THREE.Vector3(0, 1.8, 0)
    FPcamera.position.copy(darkWarrior.position).add(offset)
    
    // FP Camera looks forward relative to model rotation
    const lookAtDistance = 1
    const lookAtPoint = new THREE.Vector3(
        darkWarrior.position.x + Math.sin(darkWarrior.rotation.y) * lookAtDistance,
        1.8,
        darkWarrior.position.z + Math.cos(darkWarrior.rotation.y) * lookAtDistance
    )
    FPcamera.lookAt(lookAtPoint)
}

function createTree(x,z){
    const tree = new THREE.Group()

    //TRUNK
    const trunkGeo = new THREE.CylinderGeometry(0.6, 0.6, 3)
    const trunkMat = new THREE.MeshStandardMaterial({color: '#ffffff', map: trunkTexture})
    const trunk = new THREE.Mesh(trunkGeo, trunkMat)

    trunk.position.y = 1.5

    trunk.castShadow = true
    trunk.receiveShadow = true

    tree.add(trunk)

    const BleavesGeo = new THREE.ConeGeometry(3, 4)
    const BleavesMat = new THREE.MeshStandardMaterial({color: '#374F2F'})
    const Bleaves = new THREE.Mesh(BleavesGeo, BleavesMat)

    Bleaves.position.y = 4

    Bleaves.castShadow = true
    Bleaves.receiveShadow = true

    tree.add(Bleaves)

    const TleavesGeo = new THREE.ConeGeometry(2.1, 2.8)
    const TleavesMat = new THREE.MeshStandardMaterial({color: '#374F2F'})
    const Tleaves = new THREE.Mesh(TleavesGeo, TleavesMat)

    Tleaves.position.y = 6

    Tleaves.castShadow = true
    Tleaves.receiveShadow = true

    tree.add(Tleaves)

    tree.position.set(x,0,z)

    return tree
}

const tree1 = createTree(-5,-5)
const tree2 = createTree(7, -6)
const tree3 = createTree(-8, 8)

scene.add(tree1, tree2, tree3)

//SKYBOX
function loadSkybox(){
    const loader = new THREE.CubeTextureLoader()
    const skyboxTexture = loader.load([
        './assets/skybox/bottom.png',
        './assets/skybox/side-1.png',
        './assets/skybox/side-2.png',
        './assets/skybox/side-3.png',
        './assets/skybox/side-4.png',
        './assets/skybox/top.png',
    ])
    scene.background = skyboxTexture
}
loadSkybox()