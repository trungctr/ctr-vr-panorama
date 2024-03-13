import * as THREE from '../three146/build/three.module.js'
import { OrbitControls } from '../three146/examples/jsm/controls/OrbitControls.js'
import { XRControllerModelFactory } from '../three146/examples/jsm/webxr/XRControllerModelFactory.js'
import { CanvasUI } from '../canvas_gui/CanvasUI.js'
import ENV_driven from './environmentDriven.js'
import { Areas, Devices } from './data.js'
import GLOBAL_ENV from './global.js'

class App {
	constructor() {
		/**
		 * khởi tạo state
		 */
		const _THIS = this
		this.GLOBAL_ENV = GLOBAL_ENV
		this.state = {
			currentLabel: []
		}

		/*
		 * tạo vùng chứa ứng dụng trên DOM
		 */
		const container = document.createElement('div')
		document.body.appendChild(container)

		/*
		 * tạo camera ảo
		 */
		this.camera = new THREE.PerspectiveCamera(
			60,
			window.innerWidth / window.innerHeight,
			0.1,
			500
		)
		this.camera.position.set(0.001, 0, 0.001)
		this.camera.lookAt(1, 0, 1)

		/*
		 * tạo background cho ứng dụng
		 */
		this.scene = new THREE.Scene()
		// this.scene.background = new THREE.Color(0x000000)
		this.scene.background = new THREE.TextureLoader().load(Areas.A_3.img)
		this.scene.background.mapping = THREE.EquirectangularReflectionMapping

		/*
		 * tạo ánh sáng môi trường
		 */
		const ambient = new THREE.AmbientLight(0x404040, 4) // soft white light
		this.scene.add(ambient)

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

		if (this.GLOBAL_ENV.developing) {
			const axesHelper = new THREE.AxesHelper(100)
			axesHelper.setColors(0xff0000, 0x00ff00, 0x0000ff)
			axesHelper.updateMatrixWorld()
			this.scene.add(axesHelper)
		}

		//grid helper
		if (this.GLOBAL_ENV.developing) {
			const gridsHelper = new THREE.GridHelper(30, 30)
			gridsHelper.updateMatrixWorld()
			this.scene.add(gridsHelper)
		}

		/*
		 * thêm vào một hoặc nhiều đối tượng vào scene
		 */
		// track group
		this.trackGroup = new THREE.Group()

		//#ref  reference sphere
		const sphereGeometry = new THREE.SphereGeometry(100, 100, 10)
		const sphereMaterial = new THREE.MeshStandardMaterial({
			color: 0x000000,
			side: THREE.BackSide,
			wireframe: true,
			map: '',
			visible: false
		})
		if (this.GLOBAL_ENV.developing) {
			sphereMaterial.visible = true
		}
		this.refSphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
		this.refSphere.position.set(0, 0, 0)
		this.refSphere.name = 'snap'
		this.refSphere.castShadow = false
		this.trackGroup.add(this.refSphere)

		// add sprite labels
		let deviceList = Areas.A_3.devices
		let deviceInfo = Devices
		let deviceArray = Object.keys(deviceList)
		for (let i = 0; i < deviceArray.length; i++) {
			var canvas = document.createElement('canvas'),
				context = canvas.getContext('2d'),
				metrics = null,
				textHeight = 100,
				textWidth = 0,
				actualFontSize = 2

			context.font = 'normal ' + textHeight + 'px Arial'
			metrics = context.measureText(
				'__' + deviceInfo[deviceArray[i]].name + '__'
			)
			var textWidth = metrics.width

			canvas.width = textWidth
			canvas.height = textHeight + 0.5 * textHeight

			context.font = 'normal ' + textHeight + 'px Arial'
			context.textAlign = 'center'
			context.textBaseline = 'middle'
			context.fillStyle = '#fff'
			context.fillText(
				deviceInfo[deviceArray[i]].name,
				canvas.width / 2,
				canvas.height / 2
			)
			context.globalCompositeOperation = 'destination-over'
			context.fillStyle = '#0000ff'
			context.fillRect(0, 0, canvas.width, canvas.height)

			var texture = new THREE.Texture(canvas)
			texture.needsUpdate = true

			var smaterial = new THREE.SpriteMaterial({
				map: texture
				// alignment: THREE.SpriteAlignment.center
			})
			smaterial.transparent = true

			var textObject = new THREE.Mesh()
			var sprite = new THREE.Sprite(smaterial)
			textObject.textHeight = actualFontSize
			textObject.textWidth = (textWidth / textHeight) * textObject.textHeight
			if (textObject == '2d') {
				sprite.scale.set(
					textObject.textWidth / textWidth,
					textObject.textHeight / textHeight
				)
			} else {
				sprite.scale.set(
					(textWidth / textHeight) * actualFontSize,
					actualFontSize + 0.5 * actualFontSize,
					1
				)
			}

			// textObject.add(sprite)
			// textObject.position.set(
			// 	deviceList[deviceArray[i]].pos.x,
			// 	deviceList[deviceArray[i]].pos.y,
			// 	deviceList[deviceArray[i]].pos.z
			// )
			// this.trackGroup.add(textObject)
			sprite.add(textObject)
			sprite.position.set(
				deviceList[deviceArray[i]].pos.x,
				deviceList[deviceArray[i]].pos.y,
				deviceList[deviceArray[i]].pos.z
			)
			this.trackGroup.add(sprite)
		}

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
		// thêm của sổ ứng dụng vào vùng chứa được tạo trước đó
		container.appendChild(this.renderer.domElement)
		/*
		 * Quá trình kết xuất cần hiển thị cảnh nhiều lần
		 * để những thay đổi về vị trí camera và đối tượng trong cảnh được cập nhật liên tục
		 * chúng ta có thể thiết lập vòng lặp hoạt ảnh để thực hiện việc đó.
		 */
		this.renderer.setAnimationLoop(this.render.bind(_THIS))
	}

	resize() {
		this.camera.aspect = window.innerWidth / window.innerHeight
		this.camera.updateProjectionMatrix()
		this.renderer.setSize(window.innerWidth, window.innerHeight)
	}

	action() {}
	render() {
		this.renderer.render(this.scene, this.camera)
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
		this.controls = new OrbitControls(this.camera, this.renderer.domElement)
		// this.clock = new THREE.Clock()
		// this.controls.target.set(
		// 	this.refSphere.position.x,
		// 	this.refSphere.position.y,
		// 	this.refSphere.position.z
		// )
		// this.controls.update()

		//-------------------------------------------------------
		this.action()
		//-------------------------------
		this.render()
	}
}

export default App
