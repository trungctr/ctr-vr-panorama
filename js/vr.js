import * as THREE from '/ctr-3js-static/3js/build/three.module.js'
import WebGLcheck from '/ctr-3js-static/js/compatibility-check.js'
import { VRButton } from '/ctr-3js-static/3js/examples/jsm/webxr/VRButton_ctr.js'
import { XRControllerModelFactory } from '/ctr-3js-static/3js/examples/jsm/webxr/XRControllerModelFactory.js'
import { PointerLockControls } from '/ctr-3js-static/3js/examples/jsm/controls/PointerLockControls.js'

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
 * add GUI (deving)
 */

function onPrev() {
	const msg = 'Prev pressed'
	console.log(msg)
	ui.updateElement('info', msg)
}

function onStop() {
	const msg = 'Stop pressed'
	console.log(msg)
	ui.updateElement('info', msg)
}

function onNext() {
	const msg = 'Next pressed'
	console.log(msg)
	ui.updateElement('info', msg)
}

function onContinue() {
	const msg = 'Continue pressed'
	console.log(msg)
	ui.updateElement('info', msg)
}

const config = {
	panelSize: { width: 2, height: 0.5 },
	height: 128,
	info: {
		type: 'text',
		position: { left: 6, top: 6 },
		width: 500,
		height: 58,
		backgroundColor: '#aaa',
		fontColor: '#000'
	},
	prev: {
		type: 'button',
		position: { top: 64, left: 0 },
		width: 64,
		fontColor: '#bb0',
		hover: '#ff0',
		onSelect: onPrev
	},
	stop: {
		type: 'button',
		position: { top: 64, left: 64 },
		width: 64,
		fontColor: '#bb0',
		hover: '#ff0',
		onSelect: onStop
	},
	next: {
		type: 'button',
		position: { top: 64, left: 128 },
		width: 64,
		fontColor: '#bb0',
		hover: '#ff0',
		onSelect: onNext
	},
	continue: {
		type: 'button',
		position: { top: 70, right: 10 },
		width: 200,
		height: 52,
		fontColor: '#fff',
		backgroundColor: '#2659a4',
		hover: '#3df',
		onSelect: onContinue
	},
	renderer: renderer
}

const content = {
	info: '',
	prev: '<path>M 10 32 L 54 10 L 54 54 Z</path>',
	stop: '<path>M 50 15 L 15 15 L 15 50 L 50 50 Z<path>',
	next: '<path>M 54 32 L 10 10 L 10 54 Z</path>',
	continue: 'Continue'
}

let ui = new CanvasUI(content, config)

ui.mesh.position.set(0, 1, -3)
scene.add(ui.mesh)

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

let pointerLocked = false
document.addEventListener('DOMContentLoaded', () => {
	pointerL.lock()
	pointerLocked = true
})
document.addEventListener('click', () => {
	if (pointerLocked == false) {
		pointerL.lock()
	} else
	{
		pointerL.unlock()
	}
})

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
	ui.update()
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
