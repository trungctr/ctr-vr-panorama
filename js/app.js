import * as THREE from '../three162/build/three.module.min.js'
import { OrbitControls } from '../three162/addons/controls/OrbitControls.js'
import { XRControllerModelFactory } from '../three162/addons/webxr/XRControllerModelFactory.js'
import { Areas, Devices } from './data.js'
import GLOBAL_ENV from './global.js'
import Action from './actions.js'
import Control from './control/index.js'
class Application {
	constructor() {
		this.actions = new Action(this)
		this.controls = new Control(this)
		/**
		 * khởi tạo state
		 */
		const _THIS = this
		this.log = GLOBAL_ENV.devLog
		this.isOculus = GLOBAL_ENV.isOculus
		this.isDeveloping = GLOBAL_ENV.developing
		this.startButton = GLOBAL_ENV.startButton

		this.state = {
			areasArray: Object.keys(Areas),
			areaNo: 0,
			selectedObject: null,
			labels: []
		}
		/*
		 * tạo vùng chứa ứng dụng trên DOM
		 */
		const container = document.createElement('div')
		document.body.appendChild(container)

		/*
		 * tạo background cho ứng dụng
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

		//HUD group
		this.hudGroup = new THREE.Group()
		this.hudGroup.name = 'HUD'

		// origin box
		if (this.isDeveloping) {
			const boxGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1)
			const boxMaterial = new THREE.MeshStandardMaterial({
				color: 0x00ff00
			})
			const box = new THREE.Mesh(boxGeometry, boxMaterial)
			box.position.set(1, 0, 1)
			this.trackGroup.add(box)
		}

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

		// add sprite labels
		this.actions.putLabels(this.state.areasArray[this.state.areaNo])

		this.scene.add(this.trackGroup)
		/*
		 * tạo trình kết xuất bằng webGL
		 * antialias: true = bật khử răng cưa
		 */
		this.renderer = new THREE.WebGLRenderer({ antialias: true })
		// thiết lập tỉ lệ pixels; devicePixelRatio: dùng tỉ lệ của thiết bị
		this.renderer.setPixelRatio(window.devicePixelRatio)
		// thiết lập kích thước cửa sổ ứng dụng; đang thiết lập full màn hình
		this.renderer.setSize(window.innerWidth, window.innerHeight)
		if (!this.isOculus) {
			this.renderer.autoClear = false
		}
		// thêm của sổ ứng dụng vào vùng chứa được tạo trước đó
		container.appendChild(this.renderer.domElement)
		/*
		 * Quá trình kết xuất cần hiển thị cảnh nhiều lần
		 * để những thay đổi về vị trí camera và đối tượng trong cảnh được cập nhật liên tục
		 * chúng ta có thể thiết lập vòng lặp hoạt ảnh để thực hiện việc đó.
		 */
		//HUD
		this.sceneHUD = new THREE.Scene()
		const width = window.innerWidth
		const height = window.innerHeight
		this.cameraOrtho = new THREE.OrthographicCamera(
			width / -2,
			width / 2,
			height / 2,
			height / -2,
			0,
			1000
		)
		this.cameraOrtho.position.z = 100
		this.sceneHUD.add(this.cameraOrtho)
		this.cameraOrtho.updateProjectionMatrix()

		//HUD
		let spriteTL, spriteTR, spriteBL, spriteBR, spriteC
		function createHUDSprites(t) {
			t.colorSpace = THREE.SRGBColorSpace

			const material = new THREE.SpriteMaterial({ map: t })
			const width = material.map.image.width
			const height = material.map.image.height

			spriteTL = new THREE.Sprite(material)
			spriteTL.center.set(0.0, 1.0)
			spriteTL.scale.set(width, height, 1)
			_THIS.sceneHUD.add(spriteTL)

			spriteTR = new THREE.Sprite(material)
			spriteTR.center.set(1.0, 1.0)
			spriteTR.scale.set(width, height, 1)
			_THIS.sceneHUD.add(spriteTR)

			spriteBL = new THREE.Sprite(material)
			spriteBL.center.set(0.0, 0.0)
			spriteBL.scale.set(width, height, 1)
			_THIS.sceneHUD.add(spriteBL)

			spriteBR = new THREE.Sprite(material)
			spriteBR.center.set(1.0, 0.0)
			spriteBR.scale.set(width, height, 1)
			_THIS.sceneHUD.add(spriteBR)

			spriteC = new THREE.Sprite(material)
			spriteC.center.set(0.5, 0.5)
			spriteC.scale.set(width, height, 1)
			_THIS.sceneHUD.add(spriteC)

			updateHUDSprites()
		}

		function updateHUDSprites() {
			const width = window.innerWidth / 2
			const height = window.innerHeight / 2

			spriteTL.position.set(-width, height, 1) // top left
			spriteTR.position.set(width, height, 1) // top right
			spriteBL.position.set(-width, -height, 1) // bottom left
			spriteBR.position.set(width, -height, 1) // bottom right
			spriteC.position.set(0, 0, 1) // center
		}

		const textureLoader = new THREE.TextureLoader()
		textureLoader.load('./asset/textures/sprite0.png', (t) =>
			createHUDSprites(t)
		)
		//================================================================
		this.renderer.setAnimationLoop(this.render.bind(_THIS))
	}

	resize() {
		const width = window.innerWidth
		const height = window.innerHeight
		this.camera.aspect = window.innerWidth / window.innerHeight
		this.camera.updateProjectionMatrix()
		this.renderer.setSize(window.innerWidth, window.innerHeight)

		this.cameraOrtho.left = -width / 2
		this.cameraOrtho.right = width / 2
		this.cameraOrtho.top = height / 2
		this.cameraOrtho.bottom = -height / 2
		this.cameraOrtho.updateProjectionMatrix()
	}

	action() {
		this.trackGroup.position.copy(this.camera.position)
		if (!this.isOculus) {
			this.cameraControls.target.set(
				this.trackGroup.position.x + 0.001,
				this.trackGroup.position.y,
				this.trackGroup.position.z + 0.001
			)
			this.camera.lookAt(
				this.cameraControls.target.x,
				this.cameraControls.target.y,
				this.cameraControls.target.z
			)
		}
	}

	render() {
		if (this.isOculus) {
			this.renderer.render(this.scene, this.camera)
		} else {
			this.renderer.clear()
			this.renderer.render(this.scene, this.camera)
			this.renderer.clearDepth()
			this.renderer.render(this.sceneHUD, this.cameraOrtho)
		}
	}

	VRrender() {
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
		line.scale.z = 100

		this.controller.add(line.clone())
		this.controller1.add(line.clone())

		this.trackGroup.position.copy(this.camera.position)
		//-------------------------------------------------------
		this.action()
		//-------------------------------------------------------
		this.render()
	}

	WebGLrender() {
		const _THIS = this
		//Theo dõi sự thay đổi kích thước cửa sổ và cập nhật kích thước vùng chứa
		window.addEventListener('resize', this.resize.bind(_THIS))
		//hàm điều khiển camera
		this.cameraControls = new OrbitControls(
			this.camera,
			this.renderer.domElement
		)

		//-------------------------------------------------------
		this.action()
		//them trinh dieu khien
		this.controls.pointer()
		this.controls.Keyboard()
		//-------------------------------
		this.render()
	}
}

const app = new Application()
export default app
