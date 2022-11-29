import * as THREE from '/3js/build/three.module.js'
import WebGLcheck from '/js/compatibility-check.js'
import { VRButton } from '/3js/examples/jsm/webxr/VRButton_ctr.js'
import { XRControllerModelFactory } from '/3js/examples/jsm/webxr/XRControllerModelFactory.js'
import { PointerLockControls } from '/3js/examples/jsm/controls/PointerLockControls.js'

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
renderer.setPixelRatio(window.devicePixelRatio)
renderer.shadowMap.enabled = true

const scene = new THREE.Scene()

const textureLoader = new THREE.TextureLoader()

/**
 * setup VR/XR
 */
renderer.xr.enabled = true
renderer.xr.setReferenceSpaceType('local')
document.body.appendChild(VRButton.createButton(renderer))

const controllerModelFactory = new XRControllerModelFactory()

// controller
const controller = renderer.xr.getController(0)
scene.add(controller)

const controllerGrip = renderer.xr.getControllerGrip(0)
controllerGrip.add(controllerModelFactory.createControllerModel(controllerGrip))
scene.add(controllerGrip)

// controller
const controller1 = renderer.xr.getController(1)
scene.add(controller1)

const controllerGrip1 = renderer.xr.getControllerGrip(1)
controllerGrip1.add(
	controllerModelFactory.createControllerModel(controllerGrip1)
)
scene.add(controllerGrip1)

//
const geometry = new THREE.BufferGeometry().setFromPoints([
	new THREE.Vector3(0, 0, 0),
	new THREE.Vector3(0, 0, -1)
])

const line = new THREE.Line(geometry)
line.name = 'line'
line.scale.z = 10

controller.add(line.clone())
controller1.add(line.clone())

const selectPressed = false

/**
 * add GUI
 */

/**
 * add environment effects
 */

/** scene background  setting */
// renderer.setClearColor(0xffea00)
const stars = '/asset/img/stars.jpg'
const sceneImg6 =
	'https://cdn.glitch.global/3bb6e432-db98-42e3-9331-6fb68707bea8/scene_6_flip.jpg?v=1669607764141'

/** ambient light effect setting */
const ambientLight = new THREE.AmbientLight(0xffffff)
scene.add(ambientLight)

// camera parameters: field od view, with/height, near(distance form camera to near plan) and far (distance form camera to far plan)
const camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	1000
)
const pointerL = new PointerLockControls(camera, renderer.domElement)
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)
camera.position.set(0, 0, 0)
camera.lookAt(0, 0, 1)
document.onclick = () => {
	pointerL.lock()
}

/**
 * add xyz axis, x red, y green, z blue
 */
const axesHelper = new THREE.AxesHelper(100)
axesHelper.setColors(0xff0000, 0x00ff00, 0x0000ff)
scene.add(axesHelper)

/**
 * add a xz grid plane
 */
const gridsHelper = new THREE.GridHelper(30, 30)
scene.add(gridsHelper)

/**
 * add a sphere
 */

const sphereGeometry = new THREE.SphereGeometry(999, 99, 99)
const sphereMaterial = new THREE.MeshStandardMaterial({
	color: 0xffffff,
	side: THREE.BackSide,
	wireframe: false,
	map: textureLoader.load(sceneImg6)
})
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
sphere.name = 'background'
sphere.position.set(0, 0, 0)
sphere.castShadow = true
scene.add(sphere)

/**
 * Optimized function here
 */

function setUp() {
	camera.position.set(0, 0, 0)
}

function maintainScene() {
	window.addEventListener('resize', () => {
		camera.aspect = window.innerWidth / window.innerHeight
		camera.updateProjectionMatrix()
		renderer.setSize(window.innerWidth, window.innerHeight)
	})
}
maintainScene()

/**
 * animation function here
 */

function mainLoop() {
	setUp()
	renderer.render(scene, camera)
}

/**
 * main loop
 */
if (WebGLcheck.isWebGLAvailable()) {
	renderer.setAnimationLoop(mainLoop)
} else {
	const warning = WebGLcheck.getWebGLErrorMessage()
	document.getElementById('container').appendChild(warning)
}
