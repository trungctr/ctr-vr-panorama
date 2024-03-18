import * as THREE from '../three162/build/three.module.js'
import { Areas, Devices } from './data.js'
import { CanvasUI } from './canvas_gui/CanvasUI.js'
import SpriteUI from './sprite_canvas_gui/spriteUI.js'
import GLOBAL_ENV from './global.js'

class Action {
	constructor(app) {
		//tham chieu app duoc truyen tu class ActionMapping trong file actionMap.js
		this.app = app
	}
	previousArea() {
		const _THIS = this
		let preAreaNo = _THIS.app.state.areaNo - 1
		if (_THIS.app.state.areaNo == 0) {
			preAreaNo = 17
		}
		const targetArea = _THIS.app.state.areasArray[preAreaNo]
		_THIS.app.state.areaNo = preAreaNo
		_THIS.handleArea(targetArea)
	}
	nextArea() {
		const _THIS = this
		let nextAreaNo = _THIS.app.state.areaNo + 1
		if (_THIS.app.state.areaNo == 17) {
			nextAreaNo = 0
		}
		const targetArea = _THIS.app.state.areasArray[nextAreaNo]
		_THIS.app.state.areaNo = nextAreaNo
		_THIS.handleArea(targetArea)
	}
	goToArea(place) {
		const _THIS = this
		const targetArea = _THIS.app.state.areasArray[place]
		_THIS.app.state.areaNo = Areas.indexOf(place)
		_THIS.handleArea(targetArea)
	}
	handleArea(area) {
		const _THIS = this
		const newBackground = new THREE.TextureLoader()
		newBackground.load(Areas[area].img, (background) => {
			_THIS.app.scene.background = background
			_THIS.app.scene.background.mapping =
				THREE.EquirectangularReflectionMapping
			_THIS.putLabels(area)
			_THIS.app.GLOBAL_ENV.devLog.info(
				`${JSON.stringify(_THIS.app.state.areaNo)}.[${area}] ${
					Areas[area].name
				}`
			)
		})
	}
	clearLabels() {
		const _THIS = this
		const labels = _THIS.app.state.labels
		if (labels.length > 0) {
			labels.forEach((l) => {
				let group = _THIS.app.scene.getObjectByName('trackGroup')
				let label = group.getObjectByName(l)
				// let label = group.getObjectsByProperty('userMark',l)
				label.removeFromParent()
				// _THIS.app.GLOBAL_ENV.devLog.info('removed: ' + l)
			})
			_THIS.app.state.labels = []
		}
	}
	putLabels(area) {
		const _THIS = this
		_THIS.clearLabels()
		let labels = Areas[area].labels
		if (labels.length == 0) return 0
		labels.forEach((device) => {
			let content = Devices[device.id].name,
				config = {
					panelSize: { width: 200, height: 100, actualSize: 2 },
					backgroundColor: '#0000ff',
					backgroundTransparent: 'cc',
					borderRadius: 6,
					opacity: 0.7,
					padding: 10,
					/*font here*/
					fontFamily: 'Arial',
					fontSize: 16,
					color: '#ffffff',

					/*user data*/
					userData: {
						userType: 'label',
						userMark: device.id,
						userEvent: 'showInformation'
					}
				}

			const label = new SpriteUI(content, config)
			label.position.set(device.pos.x, device.pos.y, device.pos.z)
			_THIS.app.trackGroup.add(label)
			_THIS.app.state.labels.push(device.id)
		})
	}
	moveForward() {
		GLOBAL_ENV.devLog.info('move forward')
		this.app.camera.translateY(0.5)
		this.updateCam()
	}
	moveBackward() {
		GLOBAL_ENV.devLog.info('move backward')
		this.app.camera.translateY(-0.5)
		this.updateCam()
	}
	moveUp() {
		GLOBAL_ENV.devLog.info('move up')
		this.app.camera.translateZ(0.5)
		this.updateCam()
	}
	moveDown() {
		GLOBAL_ENV.devLog.info('move down')
		this.app.camera.translateZ(-0.5)
		this.updateCam()
	}
	updateCam() {
		this.app.trackGroup.position.copy(this.app.camera.position)
		this.app.cameraControls.target.set(
			this.app.trackGroup.position.x + 0.001,
			this.app.trackGroup.position.y,
			this.app.trackGroup.position.z + 0.001
		)
		// this.app.cameraControls.update()
	}

	reRenderLabel(label) {}
	objectOnHover() {}
	showInformation(label) {
		console.log('showInformation', label)
	}
}

export default Action
