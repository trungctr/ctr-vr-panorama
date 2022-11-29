import * as THREE from '/ctr-3js-static/3js/build/three.module.js'
import WebGLcheck from '/ctr-3js-static/js/compatibility-check.js'
import { VRButton } from '/ctr-3js-static/3js/examples/jsm/webxr/VRButton_ctr.js'
import { PointerLockControls } from '/ctr-3js-static/3js/examples/jsm/controls/PointerLockControls.js'

function htmlRun() {
	const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
	renderer.setPixelRatio(window.devicePixelRatio)
	renderer.shadowMap.enabled = true

	const scene = new THREE.Scene()

	const textureLoader = new THREE.TextureLoader()

	renderer.xr.enabled = true
	document.body.appendChild(VRButton.createButton(renderer))

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

	const pointerLocked = {
		isLocked: false
	}
	renderer.domElement.addEventListener('load', () => {
		pointerL.lock()
		pointerLocked.isLocked = true
	})
	document.addEventListener('click', () => {
		if (pointerLocked.isLocked == false) {
			pointerL.lock()
		} else {
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

	function maintainMethods() {}

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
		maintainMethods()
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
}

export default htmlRun()