import * as THREE from '../three146/build/three.module.js'
import { OrbitControls } from '../three146/examples/jsm/controls/OrbitControls.js'
import { FirstPersonControls } from '../three146/examples/jsm/controls/FirstPersonControls.js'
import { DragControls } from '../three146/examples/jsm/controls/DragControls.js'
import { RGBELoader } from '../three146/examples/jsm/loaders/RGBELoader.js'
import { XRControllerModelFactory } from '../three146/examples/jsm/webxr/XRControllerModelFactory.js'
import { CanvasUI } from '../canvas_gui/CanvasUI.js'
import { EnvInit } from './webvr-compatibility.js'
import { Areas, Devices } from './data.js'

const GLOBAL_ENV = {
	version: '12.03.24.1837',
	device: 'Unknown',
	webGLcompatibility: false,
	developing: true,
	moveSpeed: 0.5,
	devicesHovered: true
}

function devLog(message) {
	if (GLOBAL_ENV.developing) {
		document.getElementById('console').innerHTML += message + '<br>'
	}
}
/**
 * Hàm này để kiểm tra tương thích webGL và thiết bị
 */
;(() => {
	function isWebGLAvailable() {
		try {
			const canvas = document.createElement('canvas')
			return !!(
				window.WebGLRenderingContext &&
				(canvas.getContext('webgl') ||
					canvas.getContext('experimental-webgl'))
			)
		} catch (e) {
			return false
		}
	}

	function isWebGL2Available() {
		try {
			const canvas = document.createElement('canvas')
			return !!(window.WebGL2RenderingContext && canvas.getContext('webgl2'))
		} catch (e) {
			return false
		}
	}
	if (isWebGLAvailable() || isWebGL2Available()) {
		GLOBAL_ENV.webGLcompatibility = true
	}

	function isOculus() {
		const toMatch = [/oculus/i, /meta/i]
		return toMatch.some((toMatchItem) => {
			return navigator.userAgent.match(toMatchItem)
		})
	}
	GLOBAL_ENV.device = isOculus()
	devLog('0.isOculus = ' + GLOBAL_ENV.device)
	devLog('1.Version = ' + GLOBAL_ENV.version)
})()

class App {
	static App = this
	constructor() {
		/*
		 * tạo vùng chứa ứng dụng trên DOM
		 */
		const container = document.createElement('div')
		document.body.appendChild(container)

		/*
		 * tạo camera ảo
		 */
		App.camera = new THREE.PerspectiveCamera(
			60,
			window.innerWidth / window.innerHeight,
			0.1,
			500
		)
		App.camera.position.set(0.001, 0, 0.001)
		App.camera.lookAt(1, 0, 1)

		/*
		 * tạo background cho ứng dụng
		 */
		App.scene = new THREE.Scene()
		// App.scene.background = new THREE.Color(0x000000)
		App.scene.background = new THREE.TextureLoader().load(Areas.A_3.img)
		App.scene.background.mapping = THREE.EquirectangularReflectionMapping

		/*
		 * tạo ánh sáng môi trường
		 */
		const ambient = new THREE.AmbientLight(0x404040, 4) // soft white light
		App.scene.add(ambient)

		/*
		 * nguồn sáng định hướng
		 */
		// const light = new THREE.DirectionalLight()
		// light.position.set(0.2, 1, 1)
		// App.scene.add(light)

		/**
		 * add develope helper (for development purposes)
		 */
		// axis helper, x red, y green, z blue
		if (GLOBAL_ENV.developing) {
			const axesHelper = new THREE.AxesHelper(100)
			axesHelper.setColors(0xff0000, 0x00ff00, 0x0000ff)
			axesHelper.updateMatrixWorld()
			App.scene.add(axesHelper)
		}

		//grid helper
		if (GLOBAL_ENV.developing) {
			const gridsHelper = new THREE.GridHelper(30, 30)
			gridsHelper.updateMatrixWorld()
			App.scene.add(gridsHelper)
		}

		/*
		 * thêm vào một hoặc nhiều đối tượng vào scene
		 */

		//box
		const geometry = new THREE.BoxGeometry(1, 1, 1)
		// const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
		const material = new THREE.MeshStandardMaterial({
			color: 0x00ff00,
			wireframe: true,
			visible: true
		})
		App.box = new THREE.Mesh(geometry, material)
		App.box.position.set(1, 0, 1)
		App.scene.add(App.box)

		// track group
		App.trackGroup = new THREE.Group()

		// panorama picture
		const sphereGeometry = new THREE.SphereGeometry(100, 10, 10)
		const sphereMaterial = new THREE.MeshStandardMaterial({
			color: 0x000000,
			side: THREE.BackSide,
			wireframe: true,
			map: '',
			visible: false
		})
		if (GLOBAL_ENV.developing) {
			sphereMaterial.visible = true
		}
		App.refSphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
		App.refSphere.position.set(0, 0, 0)
		App.refSphere.name = 'snap'
		App.refSphere.castShadow = false
		App.trackGroup.add(App.refSphere)

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
			if (GLOBAL_ENV.devicesHovered) {
				context.globalCompositeOperation = 'destination-over'
				context.fillStyle = '#0000ff'
				context.fillRect(0, 0, canvas.width, canvas.height)
			}
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
			// App.trackGroup.add(textObject)
			sprite.add(textObject)
			sprite.position.set(
				deviceList[deviceArray[i]].pos.x,
				deviceList[deviceArray[i]].pos.y,
				deviceList[deviceArray[i]].pos.z
			)
			App.trackGroup.add(sprite)
		}

		App.scene.add(App.trackGroup)
		/*
		 * tạo trình kết xuất bằng webGL
		 * antialias: true = bật khử răng cưa
		 */
		App.renderer = new THREE.WebGLRenderer({ antialias: true })
		// thiết lập tỉ lệ pixels; devicePixelRatio: dùng tỉ lệ của thiết bị
		App.renderer.setPixelRatio(window.devicePixelRatio)
		// thiết lập kích thước cửa sổ ứng dụng; đang thiết lập full màn hình
		App.renderer.setSize(window.innerWidth, window.innerHeight)
		// thêm của sổ ứng dụng vào vùng chứa được tạo trước đó
		container.appendChild(App.renderer.domElement)

		/*
		 * Quá trình kết xuất cần hiển thị cảnh nhiều lần
		 * để những thay đổi về vị trí camera và đối tượng trong cảnh được cập nhật liên tục
		 * chúng ta có thể thiết lập vòng lặp hoạt ảnh để thực hiện việc đó.
		 */
		App.renderer.setAnimationLoop(this.render.bind(App))
		//Theo dõi sự thay đổi kích thước cửa sổ và cập nhật kích thước vùng chứa
		window.addEventListener('resize', this.resize.bind(App))

		/**
		 * setup VR/XR
		 */

		if (GLOBAL_ENV.device && GLOBAL_ENV.webGLcompatibility) {
			App.renderer.xr.enabled = true
			App.renderer.xr.setReferenceSpaceType('local')

			let currentSession = null
			////////////////////////////////
			async function onSessionStarted(session) {
				session.addEventListener('end', onSessionEnded)
				await renderer.xr.setSession(session)
				currentSession = session
			}

			// currentSession.removeEventListener('end', onSessionEnded)

			// button.onclick = function () {
			if (currentSession === null) {
				const sessionInit = {
					optionalFeatures: [
						'local-floor',
						'bounded-floor',
						'hand-tracking',
						'layers'
					]
				}
				navigator.xr
					.requestSession('immersive-vr', sessionInit)
					.then(onSessionStarted)
			} else {
				currentSession.end()
			}
			// }
			////////////////////////////////
			const controllerModelFactory = new XRControllerModelFactory()

			// controller
			App.controller = App.renderer.xr.getController(0)
			App.scene.add(App.controller)

			App.controllerGrip = App.renderer.xr.getControllerGrip(0)
			App.controllerGrip.add(
				controllerModelFactory.createControllerModel(controllerGrip)
			)
			App.scene.add(App.controllerGrip)

			// controller
			App.controller1 = App.renderer.xr.getController(1)
			App.scene.add(App.controller1)

			App.controllerGrip1 = App.renderer.xr.getControllerGrip(1)
			App.controllerGrip1.add(
				controllerModelFactory.createControllerModel(App.controllerGrip1)
			)
			App.scene.add(App.controllerGrip1)

			//pointer linear
			const lineGeometry = new THREE.BufferGeometry().setFromPoints([
				new THREE.Vector3(0, 0, 0),
				new THREE.Vector3(0, 0, -1)
			])

			const line = new THREE.Line(lineGeometry)
			line.name = 'selectorLine'
			line.scale.z = 100

			App.controller.add(line.clone())
			App.controller1.add(line.clone())
		} else {
			//hàm điều khiển camera
			App.controls = new OrbitControls(App.camera, App.renderer.domElement)
			// App.clock = new THREE.Clock()
			App.controls.target.set(
				App.refSphere.position.x,
				App.refSphere.position.y,
				App.refSphere.position.z
			)
			App.controls.update()
		}
		function checkApp(App) {
			const geometry = new THREE.BoxGeometry(1, 1, 1)
			// const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
			const material = new THREE.MeshStandardMaterial({
				color: 0xffff00,
				wireframe: true,
				visible: true
			})
			App.box2 = new THREE.Mesh(geometry, material)
			App.box.position.set(2, 0, 2)
			App.scene.add(App.box2)
		}
		checkApp(App)
	}

	resize() {
		App.camera.aspect = window.innerWidth / window.innerHeight
		App.camera.updateProjectionMatrix()
		App.renderer.setSize(window.innerWidth, window.innerHeight)
		// App.controls.handleResize()
	}

	render() {
		document.onkeydown = (e) => {
			switch (e.code) {
				case 'KeyW' || 'ArrowUp':
					App.camera.translateZ(-GLOBAL_ENV.moveSpeed)
					break
				case 'KeyS' || 'ArrowDown':
					App.camera.translateZ(GLOBAL_ENV.moveSpeed)
					break
				case 'KeyD' || 'ArrowRight':
					App.camera.translateX(GLOBAL_ENV.moveSpeed)
					break
				case 'KeyA' || 'ArrowLeft':
					App.camera.translateX(-GLOBAL_ENV.moveSpeed)
					break
				case 'Space':
					App.camera.translateY(GLOBAL_ENV.moveSpeed)
					break
				case 'ControlLeft' || 'ControlRight':
					App.camera.translateY(-GLOBAL_ENV.moveSpeed)
					break
				default:
					return 0
			}
		}
		App.trackGroup.position.copy(App.camera.position)
		App.box.rotateY(0.01)
		App.box.rotateX(0.005)
		App.renderer.render(App.scene, App.camera)
	}
}

export default App
