import Pointer from './pointerControl.js'
import Keyboard from './keyboardControl.js'

class Control {
	constructor(app) {
		this.app = app
	}
	pointer() {
		const pointer = new Pointer(this.app)
		pointer.listen()
	}
	Keyboard() {
		const keyboard = new Keyboard(this.app)
		keyboard.listen()
	}
}

export default Control