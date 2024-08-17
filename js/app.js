import * as THREE from '../three162/build/three.module.min.js'
import { OrbitControls } from '../three162/addons/controls/OrbitControls.js'
import { XRControllerModelFactory } from '../three162/addons/webxr/XRControllerModelFactory.js'
import { Areas, Devices } from './data.js'
import GLOBAL_ENV from './global.js'
import Action from './actions.js'
import Control from './control/index.js'
import { CanvasUI } from './canvas_gui/CanvasUI.js'

function millimeter(n) {
	return Number(n / 1000)
}
class Application {
	constructor() {
		const _THIS = this
		/**
		 * khởi tạo state
		 */

		this.state = {
			areasArray: Object.keys(Areas),
			areaNo: 0,
			selectedObject: null,
			labels: {},
			GUIs: {}
		}
		this.log = GLOBAL_ENV.devLog
		this.isOculus = GLOBAL_ENV.isOculus
		this.isDeveloping = GLOBAL_ENV.developing
		this.startButton = GLOBAL_ENV.startButton
		/*
		 * tạo vùng chứa ứng dụng trên DOM
		 */
		const container = document.createElement('div')
		document.body.appendChild(container)

		/*
		 * load background cho ứng dụng
		 */
		this.scene = new THREE.Scene()
		// this.scene.background = new THREE.Color(0x000000)
		this.scene.background = new THREE.TextureLoader().load(
			Areas[this.state.areasArray[this.state.areaNo]].img
		)
		this.scene.background.mapping = THREE.EquirectangularReflectionMapping

		/*
		 * tạo camera ảo
		 */
		this.camera = new THREE.PerspectiveCamera(
			60,
			window.innerWidth / window.innerHeight,
			0.1,
			1000
		)
		this.camera.position.set(0.001, 0, 0.001)
		this.camera.lookAt(1, 0, 1)
		this.scene.add(this.camera)

		/*
		 * tạo ánh sáng môi trường
		 */
		// const ambient = new THREE.AmbientLight(0x404040, 0) // soft white light
		// this.scene.add(ambient)

		/*
		 * nguồn sáng định hướng
		 */
		// const light = new THREE.DirectionalLight()
		// light.position.set(0.2, 1, 1)
		// this.scene.add(light)

		/**
		 * add develope helper (for development purposes)
		 */
		// axis helper, x red, y green, z blue

		if (this.isDeveloping) {
			const axesHelper = new THREE.AxesHelper(100)
			axesHelper.setColors(0xff0000, 0x00ff00, 0x0000ff)
			axesHelper.updateMatrixWorld()
			this.scene.add(axesHelper)
		}

		//grid helper
		if (this.isDeveloping) {
			const gridsHelper = new THREE.GridHelper(30, 30)
			gridsHelper.updateMatrixWorld()
			this.scene.add(gridsHelper)
		}

		/*
		 * thêm vào một hoặc nhiều đối tượng vào scene
		 */
		// track group
		this.trackGroup = new THREE.Group()
		this.trackGroup.name = 'trackGroup'
		this.scene.add(this.trackGroup)

		/*
		 * thêm các đối tượng thuộc HUD
		 */
		//HUD - next button
		const geometry = new THREE.PlaneGeometry(
			millimeter(15),
			millimeter(15),
			10,
			10
		)
		const material = new THREE.MeshBasicMaterial({
			color: 0xffff00,
			side: THREE.DoubleSide,
			wireframe: !true
		})
		this.plane = new THREE.Mesh(geometry, material)
		this.plane.userMark = 'p1'
		this.plane.userEvent = 'showInformation'
		this.camera.add(this.plane)
		this.plane.position.set(
			millimeter(window.innerWidth / 20 + 35),
			millimeter(-(window.innerHeight / 20 + 30)),
			-millimeter(150)
		)

		//HUD - next button
		const material2 = new THREE.MeshBasicMaterial({
			color: 0x00ff00,
			side: THREE.DoubleSide,
			wireframe: !true
		})
		this.plane2 = new THREE.Mesh(geometry, material2)
		this.plane2.userMark = 'p2'
		this.plane2.userEvent = 'showInformation'
		this.camera.add(this.plane2)
		this.plane2.position.set(
			millimeter(-(window.innerWidth / 20 + 35)),
			millimeter(-(window.innerHeight / 20 + 30)),
			-millimeter(150)
		)

		//#ref  reference sphere
		const sphereGeometry = new THREE.SphereGeometry(100, 100, 100)
		const sphereMaterial = new THREE.MeshStandardMaterial({
			color: 0x000000,
			wireframe: true
		})
		sphereMaterial.visible = this.isDeveloping
		this.refSphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
		this.refSphere.position.set(0, 0, 0)
		this.refSphere.name = 'snap'
		this.refSphere.castShadow = true
		this.trackGroup.add(this.refSphere)
		/*
		 * tạo trình kết xuất bằng webGL
		 * antialias: true = bật khử răng cưa
		 */
		this.renderer = new THREE.WebGLRenderer({ antialias: true })
		// thiết lập tỉ lệ pixels; devicePixelRatio: dùng tỉ lệ của thiết bị
		this.renderer.setPixelRatio(window.devicePixelRatio)
		// thiết lập kích thước cửa sổ ứng dụng; đang thiết lập full màn hình
		this.renderer.setSize(window.innerWidth, window.innerHeight)

		// thêm của sổ ứng dụng vào vùng chứa được tạo trước đó
		container.appendChild(this.renderer.domElement)
		/*
		 * Quá trình kết xuất cần hiển thị cảnh nhiều lần
		 * để những thay đổi về vị trí camera và đối tượng trong cảnh được cập nhật liên tục
		 * chúng ta có thể thiết lập vòng lặp hoạt ảnh để thực hiện việc đó.
		 */

		//================================================================
		this.renderer.setAnimationLoop(this.render.bind(_THIS))
		//Theo dõi sự thay đổi kích thước cửa sổ và cập nhật kích thước vùng chứa
		window.addEventListener('resize', this.resize.bind(_THIS))
		//hàm điều khiển camera
		this.cameraControls = new OrbitControls(
			this.camera,
			this.renderer.domElement
		)
		this.actions = new Action(_THIS)
		this.controls = new Control(_THIS)
		this.actions.putLabels(this.state.areasArray[this.state.areaNo])
	}

	resize() {
		let width = window.innerWidth,
			height = window.innerHeight
		this.camera.aspect = width / height
		this.camera.updateProjectionMatrix()
		this.renderer.setSize(width, height)

		// update HUD position
		this.plane.position.set(
			millimeter(width / 20),
			millimeter(-(height / 20 + 25)),
			-millimeter(150)
		)
	}

	action() {
		const _THIS = this
		//track controller
		this.controls.vrPointer()
		this.trackGroup.position.copy(this.camera.position)
		if (this.vrMenu) {
			this.vrMenu.update()
		}
		// this.plane.lookAt(this.camera.position)
	}

	render() {
		this.action()
		this.renderer.render(this.scene, this.camera)
	}

	VRrender() {
		const _THIS = this
		/**
		 * setup VR/XR
		 */
		this.renderer.xr.enabled = true
		this.renderer.xr.setReferenceSpaceType('local')
		const controllerModelFactory = new XRControllerModelFactory()

		// controller
		this.controller = this.renderer.xr.getController(0)
		this.scene.add(this.controller)

		this.controllerGrip = this.renderer.xr.getControllerGrip(0)
		this.controllerGrip.add(
			controllerModelFactory.createControllerModel(this.controllerGrip)
		)
		this.scene.add(this.controllerGrip)

		// controller
		this.controller1 = this.renderer.xr.getController(1)
		this.scene.add(this.controller1)

		this.controllerGrip1 = this.renderer.xr.getControllerGrip(1)
		this.controllerGrip1.add(
			controllerModelFactory.createControllerModel(this.controllerGrip1)
		)
		this.scene.add(this.controllerGrip1)

		//pointer linear
		const lineGeometry = new THREE.BufferGeometry().setFromPoints([
			new THREE.Vector3(0, 0, 0),
			new THREE.Vector3(0, 0, -1)
		])

		const line = new THREE.Line(lineGeometry)
		line.name = 'selectorLine'
		line.scale.z = 10000

		this.controller.add(line.clone())
		this.controller1.add(line.clone())

		// add a menu in vr
		function gotoPrev() {
			_THIS.actions.previousArea()
		}
		function gotoNext() {
			_THIS.actions.nextArea()
		}
		const vrMenuConfig = {
			panelSize: { width: 0.512, height: 0.17 },
			height: 170,
			opacity: 1,
			backgroundColor: '#000',
			renderer: this.renderer,
			scene: this.scene,
			info: {
				type: 'text',
				position: { left: 0, top: 0 },
				width: 512,
				height: 85,
				backgroundColor: '#000',
				fontColor: '#fff',
				fontSize: 25
			},
			line: {
				type: 'shape',
				position: { left: 0, top: 85 },
				width: 512,
				height: 2,
				backgroundColor: '#fff'
			},
			prev: {
				type: 'button',
				position: { top: 98, left: 0 },
				width: 70,
				fontColor: '#fff',
				hover: '#bb0',
				onSelect: {
					action: gotoPrev,
					params: ''
				}
			},
			next: {
				type: 'button',
				position: { top: 98, left: 75 },
				width: 70,
				fontColor: '#fff',
				hover: '#bb0',
				// hover: '#2659a4',
				onSelect: {
					action: gotoNext,
					params: ''
				}
			},
			mute: {
				type: 'button',
				position: { top: 90, left: 150 },
				width: 70,
				fontColor: '#fff',
				hover: '#bb0'
				// onSelect: ''
			},
			sound: {
				type: 'slider',
				position: { top: 115, right: 20 },
				width: 200,
				height: 30,
				fontColor: '#fff',
				hover: '#bb0'
				// onSelect: ''
			}
		}
		const vrMenuContent = {
			info: Areas[this.state.areasArray[this.state.areaNo]].name,
			line: '',
			prev: '<path>M 10 32 L 54 10 L 54 54 Z</path>',
			mute: '<path>M55.326 55.236A38.88 38.88 90 0066.75 27.66 38.88 38.88 90 0055.326.084L51.084 4.326A32.88 32.88 90 0160.75 27.66 32.88 32.88 90 0151.09 51ZM46.842 46.752A27 27 90 0054.75 27.66 27 27 90 0046.842 8.568L42.6 12.81A21 21 90 0148.75 27.66 21 21 90 0142.6 42.51ZM34.902.96A3 3 90 0136.6 3.66V51.66A3 3 90 0131.728 54L17.55 42.66H3.6A3 3 90 01.6 39.66V15.66A3 3 90 013.6 12.66H17.55L31.728 1.32A3 3 90 0134.902.96</path>',
			// mute: '<path>M 33.585 17.75 A 2.5 2.5 90 0 1 35 20 V 60 A 2.5 2.5 90 0 1 30.94 61.95 L 19.125 52.5 H 7.5 A 2.5 2.5 90 0 1 5 50 V 30 A 2.5 2.5 90 0 1 7.5 27.5 H 19.125 L 30.94 18.05 A 2.5 2.5 90 0 1 33.585 17.75 M 30 25.2 L 21.56 31.95 A 2.5 2.5 90 0 1 20 32.5 H 10 V 47.5 H 20 A 2.5 2.5 90 0 1 21.56 48.05 L 30 54.8 Z M 69.27 28.23 A 2.5 2.5 90 0 1 69.27 31.77 L 61.035 40 L 69.27 48.23 A 2.5 2.5 90 0 1 65.73 51.77 L 57.5 43.535 L 49.27 51.77 A 2.5 2.5 90 0 1 45.73 48.23 L 53.965 40 L 45.73 31.77 A 2.5 2.5 90 0 1 49.27 28.23 L 57.5 36.465 L 65.73 28.23 A 2.5 2.5 90 0 1 69.27 28.23</path>',
			sound: 80,
			next: '<path>M 54 32 L 10 10 L 10 54 Z</path>'
		}

		this.vrMenu = new CanvasUI(vrMenuContent, vrMenuConfig)
		this.vrMenu.panel.userMark= 'GUImenu'
		this.vrMenu.panel.position.set(0, 0.2, -0.1)
		this.controller1.attach(this.vrMenu.mesh)

		//thêm trình điều khiển
		this.controls.gamePad()
		//-------------------------------------------------------
		this.render()
	}

	WebGLrender() {
		const _THIS = this
		//them trinh dieu khien
		this.controls.pointer()
		this.controls.Keyboard()
		//-------------------------------
		this.render()
	}
}

const app = new Application()
export default app
