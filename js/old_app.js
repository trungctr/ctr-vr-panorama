import * as THREE from '../three146/build/three.module.js'
import { OrbitControls } from '../three146/examples/jsm/controls/OrbitControls.js'
import { RGBELoader } from '../three146/examples/jsm/loaders/RGBELoader.js'
import { XRControllerModelFactory } from '../three146/examples/jsm/webxr/XRControllerModelFactory.js'
import { CanvasUI } from '../canvas_gui/CanvasUI.js'
import { EnvInit } from './webvr-compatibility.js'
import Areas from './areas.js'
import Devices from './devices.js'

const currentScene = {
	ID: 'A_1',
	devices: {},
	img: '',
	mark: () => {},
	renderer: new THREE.WebGLRenderer({ antialias: true }),
	scene: new THREE.Scene(),
	// currentScene.camera parameters: field od view, with/height, near(distance form currentScene.camera to near plan) and far (distance form currentScene.camera to far plan)
	camera: new THREE.PerspectiveCamera(
		75,
		window.innerWidth / window.innerHeight,
		0.1,
		1000000
	),
	textureLoader: new THREE.TextureLoader(),
	startButton: document.getElementById('start-button'),
	mouse: new THREE.Vector2(),
	raycaster: new THREE.Raycaster(),
	uiVisibility: false,
	gridsHelper: false,
	axiesHelper: true
}

const bgm = document.getElementById('BGM-speaker')
const sfx = document.getElementById('SFX-speaker')

function clearBody() {
	// startstartButton.classList.add('hide')
	// document.getElementById('tuts').classList.add('hide')
	document.getElementById('intro_menu').classList.add('hide')
	document.getElementById('intro-img').classList.add('hide')
}

function configScene(w) {
	const area = Areas[w]
	// console.log(area)
	const oldDvs = Object.keys(currentScene.devices)
	currentScene.textureLoader.load(area.img, (tr) => {
		tr.mapping = THREE.EquirectangularReflectionMapping
		currentScene.scene.background = tr
	})
	// currentScene.img.material.map = currentScene.textureLoader.load(area.img)
	if (oldDvs.length > 0) {
		for (let i = 0; i < oldDvs.length; i++) {
			currentScene.scene.getObjectByName(oldDvs[i]).removeFromParent()
			console.log('for', oldDvs[i], currentScene.devices[oldDvs[i]])
		}
		currentScene.devices = {}
	}
	currentScene.ID = w
	if (currentScene.vrMenu) currentScene.vrMenu.updateElement('info', area.name)
	if (area.voice != '') {
		document.getElementById('SFX-speaker').src = area.voice
		document.getElementById('SFX-speaker').play()
	}
	if (area.devices.length > 0) {
		for (let i = 0; i < area.devices.length; i++) {
			handleDevices(area.devices[i])
		}
	}
}

function handleDevices(m) {
	if (Devices[m]) {
		const dvc = Devices[m].name
		const config = {
			panelSize: { width: 2, height: 0.2 },
			height: 102,
			opacity: 1,
			name: {
				type: 'button',
				position: { top: 0, left: 0 },
				width: 700,
				height: 100,
				fontColor: '#fff',
				// backgroundColor: '#fff',
				fontSize: 45,
				textAlign: 'left',
				hover: '#bb0'
				// onSelect: execute
			},
			renderer: currentScene.renderer,
			watcher: m
		}

		const content = {
			name: dvc
		}

		currentScene.devices[m] = new CanvasUI(content, config)
		currentScene.devices[m].mesh.position.set(
			Devices[m].pos.x,
			Devices[m].pos.y,
			Devices[m].pos.z
		)
		currentScene.devices[m].mesh.rotation.y =
			(Devices[m].pos.r / 180) * Math.PI
		currentScene.devices[m].mesh.name = m
		currentScene.devices[m].mesh.scale.set(300, 300, 300)
		currentScene.scene.add(currentScene.devices[m].mesh)
	}
}

function mouseSelector() {
	//selector
	// make sure listeners listen from renderer domElement, if not will have many error
	currentScene.renderer.domElement.addEventListener('click', function (e) {
		currentScene.mouse.x = (e.clientX / window.innerWidth) * 2 - 1
		currentScene.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
		currentScene.raycaster.setFromCamera(
			currentScene.mouse,
			currentScene.camera
		)
		const oList = currentScene.raycaster.intersectObjects(
			currentScene.scene.children
		)
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
				if (oList[i].object.name == 'camera locker') {
					console.log(oList[i].point)
					const sphereGeometry = new THREE.SphereGeometry(100, 10, 10)
					const sphereMaterial = new THREE.MeshStandardMaterial({
						color: 0xff0000,
						side: THREE.DoubleSide,
						wireframe: false,
						map: '',
						visible: true
					})
					const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
					sphere.position.set(
						oList[i].point.x,
						oList[i].point.y,
						oList[i].point.z
					)
					currentScene.scene.add(sphere)
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

function onPrev() {
	const ext = currentScene.ID.split('_')
	const order = Number(ext[1]) - 1
	if (Number(ext[1]) == 18) order = 18
	console.log(order)
	const nextName = 'A_' + order
	configScene(nextName)
}

function onNext() {
	const ext = currentScene.ID.split('_')
	let order = Number(ext[1]) + 1
	if (Number(ext[1]) == 18) order = 1
	const nextName = 'A_' + order
	configScene(nextName)
}

function addVrMenu() {
	const config = {
		panelSize: { width: 2, height: 0.5 },
		height: 163,
		opacity: 1,
		info: {
			type: 'text',
			position: { left: 0, top: 0 },
			width: 512,
			height: 85,
			backgroundColor: '#000',
			fontColor: '#fff',
			fontSize: 25,
			border: { width: 1, color: '#fff', style: 'solid' }
		},
		line: {
			type: 'text',
			position: { left: 0, top: 85 },
			width: 512,
			height: 2,
			backgroundColor: '#fff'
		},
		prev: {
			type: 'button',
			position: { top: 92, left: 0 },
			width: 64,
			fontColor: '#fff',
			hover: '#2659a4',
			onSelect: onPrev
		},
		mute: {
			type: 'button',
			position: { top: 98, left: 72 },
			width: 175,
			height: 52,
			fontColor: '#fff',
			backgroundColor: '#2659a4',
			hover: '#bb0',
			fontSize: 20
			// onSelect: ''
		},
		sound: {
			type: 'button',
			position: { top: 98, left: 258 },
			width: 175,
			height: 52,
			fontColor: '#fff',
			backgroundColor: '#2659a4',
			hover: '#bb0',
			fontSize: 20
			// onSelect: ''
		},
		next: {
			type: 'button',
			position: { top: 92, left: 442 },
			width: 64,
			fontColor: '#fff',
			hover: '#2659a4',
			onSelect: onNext
		},
		renderer: currentScene.renderer,
		watcher: 'W'
	}

	const content = {
		info: 'Khu nhận mẫu ban đầu',
		line: '',
		prev: '<path>M 10 32 L 54 10 L 54 54 Z</path>',
		mute: 'Giữ im lặng',
		sound: 'Bật âm thanh',
		next: '<path>M 54 32 L 10 10 L 10 54 Z</path>'
	}

	currentScene.vrMenu = new CanvasUI(content, config)

	currentScene.vrMenu.mesh.position.set(0, 0, -2)
	currentScene.scene.add(currentScene.vrMenu.mesh)
}

function keyboardControl() {
	const mainMenu = document.getElementById('main_menu')
	document.addEventListener('keydown', (e) => {
		console.log(e.key)
		if (e.key === 'h' || e.key === 'Escape') {
			if (currentScene.uiVisibility == false) {
				mainMenu.classList.remove('hide')
				currentScene.uiVisibility = true
			} else {
				mainMenu.classList.add('hide')
				currentScene.uiVisibility = false
			}
		}
		if (e.key === 'ArrowRight' || e.key === 'd') {
			onNext()
		}
		if (e.key === 'ArrowLeft' || e.key === 'a') {
			onPrev()
		}
		if (e.key === 'ArrowUp' || e.key === 'w') {
			bgm.play()
			if (bgm.volume < 1) {
				bgm.volume = Number(bgm.volume.toFixed(2)) + 0.01
			}
			console.log('volume up to', bgm.volume)
		}
		if (e.key === 'ArrowDown' || e.key === 's') {
			if (bgm.volume > 0) {
				bgm.volume = Number(bgm.volume.toFixed(2)) - 0.01
			}
			console.log('volume down to', bgm.volume)
		}
	})
}

function init() {
	clearBody()
	//setup renderer
	currentScene.renderer.setClearColor(0x000)
	currentScene.renderer.setPixelRatio(window.devicePixelRatio)
	currentScene.renderer.setSize(window.innerWidth, window.innerHeight)
	currentScene.renderer.shadowMap.enabled = true
	document.body.appendChild(currentScene.renderer.domElement)

	//setup camera
	currentScene.camera.position.set(0, 0, 1)
	currentScene.camera.name = 'Camera'
	currentScene.camera.lookAt(0, 0, 0)
	currentScene.camera.updateMatrixWorld()
	currentScene.camera.updateProjectionMatrix()

	/**
	 *  light effect setup
	 */
	currentScene.ambientLight = new THREE.AmbientLight(0xffffff)
	currentScene.scene.add(currentScene.ambientLight)

	/**
	 * add develope helper (for developer)
	 */
	// axis helper
	if (currentScene.axiesHelper) {
		const axesHelper = new THREE.AxesHelper(100)
		axesHelper.setColors(0xff0000, 0x00ff00, 0x0000ff)
		axesHelper.updateMatrixWorld()
		currentScene.scene.add(axesHelper)
	}

	//grid helper
	if (currentScene.gridsHelper) {
		const gridsHelper = new THREE.GridHelper(30, 30)
		gridsHelper.updateMatrixWorld()
		currentScene.scene.add(gridsHelper)
	}

	/**
	 * add static models
	 */
	// background sphere
	const sphereGeometry = new THREE.SphereGeometry(1000, 100, 100)
	const sphereMaterial = new THREE.MeshStandardMaterial({
		color: 0x000,
		side: THREE.BackSide,
		wireframe: true,
		map: '',
		visible: true
	})
	currentScene.img = new THREE.Mesh(sphereGeometry, sphereMaterial)
	currentScene.img.name = 'camera locker'
	currentScene.img.position.set(0, 0, 0)
	currentScene.img.castShadow = false
	currentScene.scene.add(currentScene.img)
	// currentScene.img.add(currentScene.camera)

	window.addEventListener('resize', () => {
		currentScene.camera.aspect = window.innerWidth / window.innerHeight
		currentScene.renderer.setSize(window.innerWidth, window.innerHeight)
		currentScene.camera.updateProjectionMatrix()
	})

	/**
	 * animation function here
	 */
	configScene('A_1')
}
const ENV = {
	webGL: () => {
		init()
		//setup currentScene.camera control
		const orbit = new OrbitControls(
			currentScene.camera,
			currentScene.renderer.domElement
		)
		orbit.target = currentScene.scene.position
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
		keyboardControl()

		function maintainMethods() {
			orbit.update()
		}
		/**
		 * main loop
		 */
		function mainLoop() {
			maintainMethods()
			currentScene.renderer.render(currentScene.scene, currentScene.camera)
		}
		currentScene.renderer.setAnimationLoop(mainLoop)
	},
	VR: () => {
		init()
		/**
		 * setup VR/XR
		 */

		currentScene.renderer.xr.enabled = true
		currentScene.renderer.xr.setReferenceSpaceType('local')
		const controllerModelFactory = new XRControllerModelFactory()

		// controller
		const controller = currentScene.renderer.xr.getController(0)
		currentScene.scene.add(controller)

		const controllerGrip = currentScene.renderer.xr.getControllerGrip(0)
		controllerGrip.add(
			controllerModelFactory.createControllerModel(controllerGrip)
		)
		currentScene.scene.add(controllerGrip)

		// controller
		const controller1 = currentScene.renderer.xr.getController(1)
		currentScene.scene.add(controller1)

		const controllerGrip1 = currentScene.renderer.xr.getControllerGrip(1)
		controllerGrip1.add(
			controllerModelFactory.createControllerModel(controllerGrip1)
		)
		currentScene.scene.add(controllerGrip1)

		//
		const geometry = new THREE.BufferGeometry().setFromPoints([
			new THREE.Vector3(0, 0, 0),
			new THREE.Vector3(0, 0, -1)
		])

		const line = new THREE.Line(geometry)
		line.name = 'selectorLine'
		line.scale.z = 100

		controller.add(line.clone())
		controller1.add(line.clone())

		/**
		 * add GUI
		 */
		addVrMenu()
		controller1.attach(currentScene.vrMenu.mesh)

		/**
		 * Optimized function here
		 */

		function maintainMethods() {
			currentScene.vrMenu.update()
		}

		/**
		 * animation function here
		 */

		/**
		 * main loop
		 */
		function mainLoop() {
			maintainMethods()
			currentScene.renderer.render(currentScene.scene, currentScene.camera)
		}
		currentScene.renderer.setAnimationLoop(mainLoop)
	},
	START: () => {
		EnvInit.formatButton(currentScene.renderer, currentScene.startButton)
	}
}

export default ENV

