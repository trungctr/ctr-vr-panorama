import * as THREE from '../../three162/build/three.module.js'
import ActionMapping from './actionMap.js'

class Pointer {
	constructor(app) {
		//tham chieu app duoc truyen khi khoi tao instance trong file index.js
		this.selectedObject = app.state.selectedObject
		this.camera = app.camera
		this.group = app.scene.getObjectByName('trackGroup')
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

		const intersects = this.raycaster.intersectObject(this.group, true)

		if (intersects.length > 0) {
			const res = intersects.filter(function (res) {
				if (res.object.userMark) {
					return res && res.object
				}
			})[0]
			if (res && res.object) {
				console.log('Hovered: ', res.object.userMark, ': ', res.object.userEvent)
				this.selectedObject = res.object
				this.selectedObject.material.color.set('#ff0')
			}
		}
	}
	onPointerActive() {
		if (this.selectedObject != null)
		{
			this.actions.activeAction(this.selectedObject.userEvent, this.selectedObject.userMark)
		}
	}
	listen() {
		document.onmousemove=(e)=> this.onPointerMove(e)
		document.onclick=(e)=> this.onPointerActive(e)
	}
}
export default Pointer
