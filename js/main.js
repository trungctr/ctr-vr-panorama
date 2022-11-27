import * as THREE from '/3js/build/three.module.js'
import WebGLcheck from '/js/compatibility-check.js'
import * as dat from '/js/dat.gui.min.js'
import { VRButton } from '/canvas_gui/VRButton.js'

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
renderer.setPixelRatio(window.devicePixelRatio)
renderer.shadowMap.enabled = true

const scene = new THREE.Scene()

const textureLoader = new THREE.TextureLoader()

/**
 * add GUI
 */
new VRButton(renderer)

const gui = new dat.GUI()
const options = {
	'Sphere wireframe': false,
	'Sphere visible': true,
	'spot Light shadow': true,
	'sLight angle': 0.3,
	'sLight penumbra': 0.1,
	'sLight intensity': 1,
	'aLight intensity': 1.8,
	WebXR: false
}

gui.add(options, 'Sphere visible').onChange(function (e) {
	if (e) {
		scene.add(sphere)
	} else {
		scene.remove(scene.getObjectByName('background'))
		console.log(sphere)
	}
})


gui.add(options, 'Sphere wireframe').onChange(function (e) {
	sphere.material.wireframe = e
})


gui.add(options, 'spot Light shadow').onChange(function (e) {
	directionalLight.castShadow = e
})

gui.add(options, 'WebXR').onChange(function (e) {
	if (e) {
		renderer.xr.enabled = e
		renderer.xr.setReferenceSpaceType('local')
		// document.body.appendChild(VRButton.createButton(renderer))
	} else {
		renderer.xr.enabled = e
		var node = document.getElementById('VRButton')
		if (node) {
			node.parentNode.removeChild(node)
		}
	}
})

gui.add(options, 'sLight angle', 0, 1)

gui.add(options, 'sLight penumbra', 0, 1)

gui.add(options, 'sLight intensity', 0, 1)

gui.add(options, 'aLight intensity', 0, 10)

/**
 * add environment effects
 */

/** fog effect setting */
scene.fog = new THREE.FogExp2(0xffffff, 0.015)
// scene.fog = new THREE.Fog(0xffffff,0, 200)

/** scene background  setting */
// renderer.setClearColor(0xffea00)
const stars = '/asset/img/stars.jpg'
scene.background = textureLoader.load(stars)

/** ambient light effect setting */
const ambientLight = new THREE.AmbientLight(0xffffff)
console.log(ambientLight)
scene.add(ambientLight)


/** spot light effect setting */
const spotLight = new THREE.SpotLight(0xff0000)
spotLight.position.set(0, 0, 0)
scene.add(spotLight)

// camera parameters: field od view, with/height, near(distance form camera to near plan) and far (distance form camera to far plan)
const camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	1000
)

renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)
camera.position.set(0, 0, 0)
camera.lookAt(0, 0, 1)

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
const sceneImg6 = '/asset/img/scene_6.jpg'
const sphereGeometry = new THREE.SphereGeometry(5, 100, 100)
const sphereMaterial = new THREE.MeshStandardMaterial({
	color: 0xffffff,
	side: THREE.DoubleSide,
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
	spotLight.castShadow = options['sLight shadow']
	spotLight.angle = options['sLight angle']
	spotLight.penumbra = options['sLight penumbra']
	spotLight.intensity = options['sLight intensity']
	ambientLight.intensity = options['aLight intensity']
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
