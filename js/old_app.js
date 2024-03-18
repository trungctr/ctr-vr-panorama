import * as THREE from '../three162/build/three.module.js'
import { OrbitControls } from '../three146/examples/jsm/controls/OrbitControls.js'
import { RGBELoader } from '../three146/examples/jsm/loaders/RGBELoader.js'
import { XRControllerModelFactory } from '../three146/examples/jsm/webxr/XRControllerModelFactory.js'
import { CanvasUI } from '../canvas_gui/CanvasUI.js'
import { ENV_driven } from './environmentDriven.js'
import { Areas, Devices } from './data.js'

const Scene = {
	ID: 'A_1',
	devices: {},
	img: '',
	mark: () => {},
	renderer: new THREE.WebGLRenderer({ antialias: true }),
	scene: new THREE.Scene(),
	// Scene.camera parameters: field od view, with/height, near(distance form Scene.camera to near plan) and far (distance form Scene.camera to far plan)
	camera: new THREE.PerspectiveCamera(
		75,
		window.innerWidth / window.innerHeight,
		0.1,
		1000
	),
	textureLoader: new THREE.TextureLoader(),
	startButton: document.getElementById('start-button'),
	mouse: new THREE.Vector2(),
	trackGroup: new THREE.Group(),
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
	const oldDvs = Object.keys(Scene.devices)
	Scene.textureLoader.load(area.img, (tr) => {
		tr.mapping = THREE.EquirectangularReflectionMapping
		Scene.scene.background = tr
	})
	// Scene.img.material.map = Scene.textureLoader.load(area.img)
	if (oldDvs.length > 0) {
		for (let i = 0; i < oldDvs.length; i++) {
			Scene.scene.getObjectByName(oldDvs[i]).removeFromParent()
			console.log('for', oldDvs[i], Scene.devices[oldDvs[i]])
		}
		Scene.devices = {}
	}
	Scene.ID = w
	if (Scene.vrMenu) Scene.vrMenu.updateElement('info', area.name)
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
			renderer: Scene.renderer,
			watcher: m,
			type: 'sprite' // or static
		}

		const content = {
			name: dvc
		}

		Scene.devices[m] = new CanvasUI(content, config)
		Scene.devices[m].mesh.position.set(
			Devices[m].pos.x,
			Devices[m].pos.y,
			Devices[m].pos.z
		)
		Scene.devices[m].mesh.rotation.y = (Devices[m].pos.r / 180) * Math.PI
		Scene.devices[m].mesh.name = m
		Scene.devices[m].mesh.scale.set(300, 300, 300)
		Scene.scene.add(Scene.devices[m].mesh)
	}
}

function mouseSelector() {
	//selector
	// make sure listeners listen from renderer domElement, if not will have many error
	Scene.renderer.domElement.addEventListener('click', function (e) {
		Scene.mouse.x = (e.clientX / window.innerWidth) * 2 - 1
		Scene.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
		Scene.raycaster.setFromCamera(Scene.mouse, Scene.camera)
		const oList = Scene.raycaster.intersectObjects(Scene.scene.children)
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
					Scene.scene.add(sphere)
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
	const ext = Scene.ID.split('_')
	const order = Number(ext[1]) - 1
	if (Number(ext[1]) == 18) order = 18
	console.log(order)
	const nextName = 'A_' + order
	configScene(nextName)
}

function onNext() {
	const ext = Scene.ID.split('_')
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
		renderer: Scene.renderer,
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

	Scene.vrMenu = new CanvasUI(content, config)

	Scene.vrMenu.mesh.position.set(0, 0, -2)
	Scene.scene.add(Scene.vrMenu.mesh)
}

function keyboardControl() {
	const mainMenu = document.getElementById('main_menu')
	document.addEventListener('keydown', (e) => {
		console.log(e.key)
		if (e.key === 'h' || e.key === 'Escape') {
			if (Scene.uiVisibility == false) {
				mainMenu.classList.remove('hide')
				Scene.uiVisibility = true
			} else {
				mainMenu.classList.add('hide')
				Scene.uiVisibility = false
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
	Scene.renderer.setClearColor(0x000)
	Scene.renderer.setPixelRatio(window.devicePixelRatio)
	Scene.renderer.setSize(window.innerWidth, window.innerHeight)
	Scene.renderer.shadowMap.enabled = true
	document.body.appendChild(Scene.renderer.domElement)

	//setup camera
	Scene.camera.position.set(0, 0, 1)
	Scene.camera.name = 'Camera'
	Scene.camera.lookAt(0, 0, 0)
	Scene.camera.updateMatrixWorld()
	Scene.camera.updateProjectionMatrix()

	/**
	 *  light effect setup
	 */
	Scene.ambientLight = new THREE.AmbientLight(0xffffff)
	Scene.scene.add(Scene.ambientLight)

	/**
	 * add develope helper (for developer)
	 */
	// axis helper
	if (Scene.axiesHelper) {
		const axesHelper = new THREE.AxesHelper(100)
		axesHelper.setColors(0xff0000, 0x00ff00, 0x0000ff)
		axesHelper.updateMatrixWorld()
		Scene.scene.add(axesHelper)
	}

	//grid helper
	if (Scene.gridsHelper) {
		const gridsHelper = new THREE.GridHelper(30, 30)
		gridsHelper.updateMatrixWorld()
		Scene.scene.add(gridsHelper)
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
	Scene.img = new THREE.Mesh(sphereGeometry, sphereMaterial)
	Scene.img.name = 'camera locker'
	Scene.img.position.set(0, 0, 0)
	Scene.img.castShadow = false
	Scene.scene.add(Scene.img)
	// Scene.img.add(Scene.camera)

	window.addEventListener('resize', () => {
		Scene.camera.aspect = window.innerWidth / window.innerHeight
		Scene.renderer.setSize(window.innerWidth, window.innerHeight)
		Scene.camera.updateProjectionMatrix()
	})

	/**
	 * animation function here
	 */
	configScene('A_1')
}
const ENV = {
	webGL: () => {
		init()
		//setup Scene.camera control
		const orbit = new OrbitControls(Scene.camera, Scene.renderer.domElement)
		orbit.target = Scene.scene.position
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
			Scene.renderer.render(Scene.scene, Scene.camera)
		}
		Scene.renderer.setAnimationLoop(mainLoop)
	},
	VR: () => {
		init()
		/**
		 * setup VR/XR
		 */

		Scene.renderer.xr.enabled = true
		Scene.renderer.xr.setReferenceSpaceType('local')
		const controllerModelFactory = new XRControllerModelFactory()

		// controller
		const controller = Scene.renderer.xr.getController(0)
		Scene.scene.add(controller)

		const controllerGrip = Scene.renderer.xr.getControllerGrip(0)
		controllerGrip.add(
			controllerModelFactory.createControllerModel(controllerGrip)
		)
		Scene.scene.add(controllerGrip)

		// controller
		const controller1 = Scene.renderer.xr.getController(1)
		Scene.scene.add(controller1)

		const controllerGrip1 = Scene.renderer.xr.getControllerGrip(1)
		controllerGrip1.add(
			controllerModelFactory.createControllerModel(controllerGrip1)
		)
		Scene.scene.add(controllerGrip1)

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
		controller1.attach(Scene.vrMenu.mesh)

		/**
		 * Optimized function here
		 */

		function maintainMethods() {
			Scene.vrMenu.update()
		}

		/**
		 * animation function here
		 */

		/**
		 * main loop
		 */
		function mainLoop() {
			maintainMethods()
			Scene.renderer.render(Scene.scene, Scene.camera)
		}
		Scene.renderer.setAnimationLoop(mainLoop)
	},
	START: () => {
		ENV_driven.drive(Scene)
	}
}

export default ENV

