import * as THREE from '../three162/build/three.module.js'
import { Areas, Devices } from './data.js'
import { CanvasUI } from './canvas_gui/CanvasUI.js'
import SpriteUI from './sprite_canvas_gui/spriteUI.js'

class Action {
	constructor(app) {
		//tham chieu app duoc truyen tu class ActionMapping trong file actionMap.js
		this.app = app
		this.log = app.log
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
		console.log(_THIS.app.state)
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
			_THIS.log.info(
				`${JSON.stringify(_THIS.app.state.areaNo)}.[${area}] ${
					Areas[area].name
				}`
			)
		})
	}
	clearLabels() {
		const _THIS = this
		const labels = _THIS.app.state.labels
		Object.entries(labels).forEach((l) => {
			console.log('clear label', l)
			let group = _THIS.app.scene.getObjectByName('trackGroup')
			let label = group.getObjectByName(l.mesh.userMark)
			// let label = group.getObjectsByProperty('userMark',l)
			label ? label.removeFromParent() : ''
			// this.log.info('removed: ' + l)
		})
		_THIS.app.state.labels = []
	}
	putLabels(area) {
		const _THIS = this
		_THIS.clearLabels()
		let labels = Areas[area].labels
		if (labels.length == 0) return 0
		labels.forEach((device) => {
			const name = String(device.id)
			let content = { label: Devices[device.id].name },
				config = {
					panelSize: { width: 0.2, height: 0.1 },
					height: 170,
					opacity: 1,
					renderer: _THIS.app.renderer,
					scene: _THIS.app.scene,
					label: {
						type: 'button',
						position: { top: 98, left: 0 },
						width: 512,
						fontColor: '#fff',
						hover: '#bb0',
						backgroundColor: '#0000ffcc'
					}
				}

			const label = new CanvasUI(content, config)
			label.panel.userMark = device.id
			label.panel.userEvent = 'showInformation'
			label.panel.position.set(device.pos.x, device.pos.y, device.pos.z)
			_THIS.app.trackGroup.add(label.panel)
			_THIS.app.state.labels[name] = label
		})
	}
	moveForward() {
		this.log.info('move forward')
		this.app.camera.translateZ(-0.5)
		this.updateCam()
	}
	moveBackward() {
		this.log.info('move backward')
		this.app.camera.translateZ(0.5)
		this.updateCam()
	}
	moveUp() {
		this.log.info('move up')
		this.app.camera.translateY(0.5)
		this.updateCam()
	}
	moveDown() {
		this.log.info('move down')
		this.app.camera.translateY(-0.5)
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
