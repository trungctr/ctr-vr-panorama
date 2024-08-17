import * as THREE from '../../three162/build/three.module.js'
import ActionMapping from './actionMap.js'

class Pointer {
	constructor(app) {
		//tham chieu app duoc truyen khi khoi tao instance trong file index.js
		this.selectedObject = app.state.selectedObject
		this.camera = app.camera
		this.group = app.scene.getObjectByName('trackGroup')
		this.scene = app.scene
		this.raycaster = new THREE.Raycaster()
		this.pointer = new THREE.Vector2()
		this.actions = new ActionMapping(app)
	}

	onPointerMove(event) {
		const _THIS = this
		if (this.selectedObject) {
			this.selectedObject.material.color.set('#fff')
			this.selectedObject = null
		}

		this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1
		this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1
		// console.log(this.pointer.x, this.pointer.y)
		this.raycaster.setFromCamera(this.pointer, this.camera)

		const intersects = this.raycaster.intersectObject(this.scene, true)

		if (intersects.length > 0) {
			const res = intersects.filter(function (res) {
				return res.object.userMark
			})[0]
			if (res) {
				console.log(
					'Hovered: ',
					res.object.userMark,
					': ',
					res.object.userEvent
				)
				this.selectedObject = res
			}
		}
	}
	onPointerActive() {
		if (this.selectedObject != null) {
			this.actions.activeAction(
				this.selectedObject.object.userEvent,
				this.selectedObject.object.userMark
			)
		}
	}
	listen() {
		document.onmousemove = (e) => this.onPointerMove(e)
		document.onclick = (e) => this.onPointerActive(e)
	}
}
export default Pointer
