import * as THREE from '../3js/build/three.module.js'
import { OrbitControls } from '../3js/examples/jsm/controls/OrbitControls.js'
import { RGBELoader } from '../3js/examples/jsm/loaders/RGBELoader.js'
import { XRControllerModelFactory } from '../3js/examples/jsm/webxr/XRControllerModelFactory.js'
import { CanvasUI } from '../canvas_gui/CanvasUI.js'
import { EnvInit } from './webvr-compatibility.js'
import Areas from './areas.js'
import Devices from './devices.js'

const crScene = {
	ID: 'A1',
	devices: {},
	img: '',
	mark: () => {},
	renderer: new THREE.WebGLRenderer({ antialias: true }),
	scene: new THREE.Scene(),
	// crScene.camera parameters: field od view, with/height, near(distance form crScene.camera to near plan) and far (distance form crScene.camera to far plan)
	camera: new THREE.PerspectiveCamera(
		75,
		window.innerWidth / window.innerHeight,
		0.1,
		1000000
	),
	textureLoader: new THREE.TextureLoader(),
	startButton: document.getElementById('start-button'),
	mouse: new THREE.Vector2(),
	raycaster: new THREE.Raycaster()
}

function clearBody() {
	// startstartButton.classList.add('hide')
	// document.getElementById('tuts').classList.add('hide')
	document.getElementById('intro_menu').classList.add('hide')
	document.getElementById('intro-img').classList.add('hide')
}

function configScene(w) {
	const area = Areas[w]
	crScene.ID = w
	crScene.devices = area.devices
	// crScene.img.material.map = crScene.textureLoader.load(area.img)
	crScene.textureLoader.load(area.img, (tr) => {
		tr.mapping = THREE.EquirectangularReflectionMapping
		crScene.scene.background = tr
	})
	if (crScene.vrMenu) crScene.vrMenu.updateElement('info', area.name)
	if (area.devices.length > 0) {
		console.log(area.devices)
		for (let i = 0; i < area.devices.length; i++) {
			addDevices(area.devices[i])
		}
	}
}

function mouseSelector() {
	//selector
	// make sure listeners listen from renderer domElement, if not will have many error
	crScene.renderer.domElement.addEventListener('click', function (e) {
		crScene.mouse.x = (e.clientX / window.innerWidth) * 2 - 1
		crScene.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
		crScene.raycaster.setFromCamera(crScene.mouse, crScene.camera)
		const oList = crScene.raycaster.intersectObjects(crScene.scene.children)
		for (let i = 0; i < oList.length; i++) {
			if (oList[i].object.material.visible === false) {
				continue
			} else {
				let type = oList[i].object.userData.type
				let id = oList[i].object.userData.name
				if (type === 'A') {
					oList[i].object.material.color.set(0x0000ff)
					console.log(
						'selected object',
						oList[i].object.userData,
						oList[i].point
					)
					break
				}
				if (type === 'M') {
					oList[i].object.material.color.set(0xffea00)
					console.log(
						'selected object',
						oList[i].object.userData,
						oList[i].point
					)
					break
				}
			}
		}
	})
}

function execute(w) {
	const ext = w.split('')
	if (ext[0] == 'A') {
		configScene(w)
	}
	if (ext[0] == 'M') {
		console.log('selected  machine:', w)
	}
}

function addDevices(m) {
	if (Devices[m]) {
		const dvc = Devices[m].name
		const config = {
			panelSize: { width: 1, height: 0.2 },
			height: 100,
			button: {
				type: 'button',
				position: { top: 10, left: 0 },
				width: 480,
				height: 100,
				fontColor: '#fff',
				fontSize: 80,
				// backgroundColor: '#000000',
				hover: '#eee',
				onSelect: execute
			},
			renderer: crScene.renderer,
			watcher: m
		}

		const content = {
			button: dvc
		}

		crScene.devices[dvc] = new CanvasUI(content, config)
		crScene.devices[dvc].mesh.position.set(
			Devices[m].pos.x,
			Devices[m].pos.y,
			Devices[m].pos.z
		)
		crScene.devices[dvc].mesh.name = m
		crScene.scene.add(crScene.devices[dvc].mesh)
	}
}

function onPrev() {
	const ext = crScene.ID.split('')
	const order = Number(ext[1]) - 1
	if (Number(ext[1]) == 18) order = 18
	const nextName = 'A' + order
	configScene(nextName)
}

function onNext() {
	const ext = crScene.ID.split('')
	const order = Number(ext[1]) + 1
	if(Number(ext[1]) == 18) order = 1
	const nextName = 'A' + order
	configScene(nextName)
}

function addVrMenu() {
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
		next: {
			type: 'button',
			position: { top: 64, left: 442 },
			width: 64,
			fontColor: '#bb0',
			hover: '#3df',
			onSelect: onNext
		},
		renderer: crScene.renderer,
		watcher: 'M1'
	}

	const content = {
		info: 'Khu nhận mẫu ban đầu',
		prev: '<path>M 10 32 L 54 10 L 54 54 Z</path>',
		next: '<path>M 54 32 L 10 10 L 10 54 Z</path>'
	}

	crScene.vrMenu = new CanvasUI(content, config)

	crScene.vrMenu.mesh.position.set(0, 0.1, -0.2)
	crScene.scene.add(crScene.vrMenu.mesh)
}

function init() {
	clearBody()
	//setup renderer
	crScene.renderer.setClearColor(0x000)
	crScene.renderer.setPixelRatio(window.devicePixelRatio)
	crScene.renderer.setSize(window.innerWidth, window.innerHeight)
	crScene.renderer.shadowMap.enabled = true
	document.body.appendChild(crScene.renderer.domElement)

	//setup camera
	crScene.camera.position.set(0, 0, 1)
	crScene.camera.name = 'Camera'
	crScene.camera.lookAt(0, 0, 0)
	crScene.camera.updateMatrixWorld()
	crScene.camera.updateProjectionMatrix()

	/**
	 *  light effect setup
	 */
	crScene.ambientLight = new THREE.AmbientLight(0xffffff)
	crScene.scene.add(crScene.ambientLight)

	/**
	 * add develope helper (for developer)
	 */
	// axis helper
	const axesHelper = new THREE.AxesHelper(100)
	axesHelper.setColors(0xff0000, 0x00ff00, 0x0000ff)
	axesHelper.updateMatrixWorld()
	crScene.scene.add(axesHelper)

	//grid helper
	const gridsHelper = new THREE.GridHelper(30, 30)
	gridsHelper.updateMatrixWorld()
	crScene.scene.add(gridsHelper)

	/**
	 * add static models
	 */
	// background sphere
	// const sphereGeometry = new THREE.SphereGeometry(1000, 100, 100)
	// const sphereMaterial = new THREE.MeshStandardMaterial({
	// 	color: 0xffffff,
	// 	side: THREE.BackSide,
	// 	wireframe: true,
	// 	map: '',
	// 	visible: false,
	// })
	// crScene.img = new THREE.Mesh(sphereGeometry, sphereMaterial)
	// crScene.img.name = 'camera locker'
	// crScene.img.position.set(0, 0, 0)
	// crScene.img.castShadow = false
	// crScene.scene.add(crScene.img)
	// crScene.img.add(crScene.camera)
	
	window.addEventListener('resize', () => {
		crScene.camera.aspect = window.innerWidth / window.innerHeight
		crScene.renderer.setSize(window.innerWidth, window.innerHeight)
		crScene.camera.updateProjectionMatrix()
	})
	
	/**
	 * animation function here
	 */
	configScene('A1')
}
const ENV = {
	webGL: () => {
		init()
		//setup crScene.camera control
		const orbit = new OrbitControls(
			crScene.camera,
			crScene.renderer.domElement
		)
		orbit.target = crScene.scene.position
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

		mouseSelector()

		function maintainMethods() {
			orbit.update()
		}
		/**
		 * main loop
		 */
		function mainLoop() {
			maintainMethods()
			crScene.renderer.render(crScene.scene, crScene.camera)
		}
		crScene.renderer.setAnimationLoop(mainLoop)
	},
	VR: () => {
		init()
		/**
		 * setup VR/XR
		 */

		crScene.renderer.xr.enabled = true
		crScene.renderer.xr.setReferenceSpaceType('local')
		const controllerModelFactory = new XRControllerModelFactory()

		// controller
		const controller = crScene.renderer.xr.getController(0)
		crScene.scene.add(controller)

		const controllerGrip = crScene.renderer.xr.getControllerGrip(0)
		controllerGrip.add(
			controllerModelFactory.createControllerModel(controllerGrip)
		)
		crScene.scene.add(controllerGrip)

		// controller
		const controller1 = crScene.renderer.xr.getController(1)
		crScene.scene.add(controller1)

		const controllerGrip1 = crScene.renderer.xr.getControllerGrip(1)
		controllerGrip1.add(
			controllerModelFactory.createControllerModel(controllerGrip1)
		)
		crScene.scene.add(controllerGrip1)

		//
		const geometry = new THREE.BufferGeometry().setFromPoints([
			new THREE.Vector3(0, 0, 0),
			new THREE.Vector3(0, 0, -1)
		])

		const line = new THREE.Line(geometry)
		line.name = 'line'
		line.scale.z = 100

		controller.add(line.clone())
		// controller1.add(line.clone())

		/**
		 * add GUI
		 */
		addVrMenu()
		controller1.attach(crScene.vrMenu.mesh)

		/**
		 * Optimized function here
		 */

		function maintainMethods() {
			crScene.vrMenu.update()
		}

		/**
		 * animation function here
		 */

		/**
		 * main loop
		 */
		function mainLoop() {
			maintainMethods()
			crScene.renderer.render(crScene.scene, crScene.camera)
		}
		crScene.renderer.setAnimationLoop(mainLoop)
	},
	START: () => {
		EnvInit.formatButton(crScene.renderer, crScene.startButton)
	}
}

export default ENV
