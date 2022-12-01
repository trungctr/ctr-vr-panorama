import * as THREE from '../3js/build/three.module.js'
import { OrbitControls } from '../3js/examples/jsm/controls/OrbitControls.js'
import { XRControllerModelFactory } from '../3js/examples/jsm/webxr/XRControllerModelFactory.js'
import { CanvasUI } from '../canvas_gui/CanvasUI.js'
import { EnvInit } from './webvr-compatibility.js'
import Areas from './areas.js'
import Devices from './devices.js'

const startButton = document.getElementById('start-button')
function clearBody() {
	// startstartButton.classList.add('hide')
	// document.getElementById('tuts').classList.add('hide')
	document.getElementById('intro_menu').classList.add('hide')
	document.getElementById('intro-img').classList.add('hide')
}

const renderer = new THREE.WebGLRenderer()
const scene = new THREE.Scene()
// camera parameters: field od view, with/height, near(distance form camera to near plan) and far (distance form camera to far plan)
const camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	1000000
)
const textureLoader = new THREE.TextureLoader()

function init() {
	clearBody()
	//setup renderer
	renderer.setClearColor(0x000)
	renderer.setPixelRatio(window.devicePixelRatio)
	renderer.setSize(window.innerWidth, window.innerHeight)
	renderer.shadowMap.enabled = true
	document.body.appendChild(renderer.domElement)

	//setup camera
	camera.position.set(0, 0, -1)
	camera.lookAt(0, 0, 1)
	camera.updateMatrixWorld()
	camera.updateProjectionMatrix()

	/**
	 *  light effect setup
	 */
	const ambientLight = new THREE.AmbientLight(0xffffff)
	scene.add(ambientLight)

	/**
	 * add develope helper
	 */
	// axis helper
	const axesHelper = new THREE.AxesHelper(100)
	axesHelper.setColors(0xff0000, 0x00ff00, 0x0000ff)
	axesHelper.updateMatrixWorld()
	scene.add(axesHelper)

	//grid helper
	const gridsHelper = new THREE.GridHelper(30, 30)
	gridsHelper.updateMatrixWorld()
	scene.add(gridsHelper)

	/**
	 * add static models
	 */
	// background sphere
	const sphereGeometry = new THREE.SphereGeometry(999, 99, 99)
	const sphereMaterial = new THREE.MeshStandardMaterial({
		color: 0xffffff,
		side: THREE.BackSide,
		wireframe: false,
		map: textureLoader.load(Areas[1].img)
	})
	const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
	sphere.name = 'background'
	sphere.position.set(0, 0, 0)
	sphere.castShadow = true
	scene.add(sphere)

	window.addEventListener('resize', () => {
		camera.aspect = window.innerWidth / window.innerHeight
		camera.updateProjectionMatrix()
		renderer.setSize(window.innerWidth, window.innerHeight)
	})

	/**
	 * animation function here
	 */
}

function buildGUI() { 
	const planeGeometry = new THREE.PlaneGeometry(5, 5)
	const planeMaterial = new THREE.MeshStandardMaterial({
		color: 0xf0f,
		side: THREE.DoubleSide,
		transparent: true,
		opacity: 0.8,
		visible: false
	})
	const planeM = new THREE.Mesh(planeGeometry, planeMaterial)
	planeM.updateMatrixWorld()
	planeM.userData = { type: 'M', no: 1 }
	scene.add(planeM)
	planeM.position.set(0, 0, 5)

	const planeGeometryA = new THREE.PlaneGeometry(5, 5)
	const planeMaterialA = new THREE.MeshStandardMaterial({
		color: 0xf00,
		side: THREE.DoubleSide,
		transparent: true,
		opacity: 0.8
	})
	const planeA = new THREE.Mesh(planeGeometryA, planeMaterialA)
	planeA.updateMatrixWorld()
	planeA.userData = { type: 'A', no: 1 }
	scene.add(planeA)
	planeA.position.set(5, 5, 5)

	/**
	 * Optimized function here
	 */
	const mouse = new THREE.Vector2()
	const intersectionPoint = new THREE.Vector3()
	const planeNormal = new THREE.Vector3()
	const plane = new THREE.Plane()
	const pHelper = new THREE.PlaneHelper(plane, 1, 0xffff00)
	scene.add(pHelper)
	const raycaster = new THREE.Raycaster()

	function normalizeUI() {
		planeNormal.copy(camera.position).normalize()
		plane.setFromNormalAndCoplanarPoint(planeNormal, scene.position)
	}
	document.addEventListener('click', normalizeUI)

	//selector
	// make sure listeners listen from renderer domElement, if not will have many error
	renderer.domElement.addEventListener('click', function (e) {
		mouse.x = (e.clientX / window.innerWidth) * 2 - 1
		mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
		raycaster.setFromCamera(mouse, camera)
		let itarget = new THREE.Vector3(0, 0, 0)
		const oList = raycaster.intersectObjects(scene.children)
		for (let i = 0; i < oList.length; i++) {
			console.log(oList[i].object.userData)
			if (oList[i].object.material.visible === false) {
				continue
			} else {
				let ident = oList[i].object.userData
				if (ident.type === 'A') {
					oList[i].object.material.color.set(0x0000ff)
					itarget = oList[i].point
					console.log('break at', oList[i].object.userData, oList[i].point)
					break
				}
				if (ident.type === 'M') {
					oList[i].object.material.color.set(0xffea00)
					itarget = oList[i].point
					console.log('break at', oList[i].object.userData, oList[i].point)
					break
				}
			}
		}
		//draw ballistic line
		raycaster.ray.intersectPlane(plane, intersectionPoint)
		const material = new THREE.LineBasicMaterial({
			color: 0x0000ff
		})
		const points = []
		points.push(intersectionPoint)
		points.push(itarget)
		const geometry = new THREE.BufferGeometry().setFromPoints(points)
		const line = new THREE.Line(geometry, material)
		scene.add(line)
		console.log(intersectionPoint, itarget)
	})
}

const ENV = {
	webGL: () => {
		init()
		//setup camera control
		const orbit = new OrbitControls(camera, renderer.domElement)
		orbit.target = scene.position
		orbit.touches = {
			ONE: THREE.TOUCH.ROTATE,
			TWO: ''
		}
		orbit.mouseButtons = {
			LEFT: THREE.MOUSE.ROTATE,
			MIDDLE: THREE.MOUSE.DOLLY,
			RIGHT: THREE.MOUSE.PAN
		}
		orbit.keys = {
			LEFT: 'ArrowLeft', //left arrow
			UP: 'ArrowUp', // up arrow
			RIGHT: 'ArrowRight', // right arrow
			BOTTOM: 'ArrowDown' // down arrow
		}
		orbit.update()

		/**
		 * add GUI
		 */
		buildGUI()
		function normalizeUI() {
			planeNormal.copy(camera.position).normalize()
			plane.setFromNormalAndCoplanarPoint(planeNormal, scene.position)
		}
		orbit.addEventListener('change', normalizeUI)

		function maintainMethods() {
			orbit.update()
		}
		/**
		 * main loop
		 */
		function mainLoop() {
			maintainMethods()
			renderer.render(scene, camera)
		}
		renderer.setAnimationLoop(mainLoop)
	},
	VR: () => {
		init()
		/**
		 * setup VR/XR
		 */

		renderer.xr.enabled = true
		renderer.xr.setReferenceSpaceType('local')

		const controllerModelFactory = new XRControllerModelFactory()

		// controller
		const controller = renderer.xr.getController(0)
		scene.add(controller)

		const controllerGrip = renderer.xr.getControllerGrip(0)
		controllerGrip.add(
			controllerModelFactory.createControllerModel(controllerGrip)
		)
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

		buildGUI()

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
		 * Optimized function here
		 */

		function maintainMethods() {
			ui.update()
		}

		/**
		 * animation function here
		 */

		/**
		 * main loop
		 */
		function mainLoop() {
			maintainMethods()
			renderer.render(scene, camera)
		}
		renderer.setAnimationLoop(mainLoop)

		///////////////////////////////////////////////////////////////////////////////////////////////
		/**
		 * requestVR session
		 */
	},
	START: () => {
		EnvInit.formatButton(renderer, startButton)
	}
}

export default ENV
