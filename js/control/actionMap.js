import Action from '../actions.js'
class ActionMapping{
	constructor(app) {
		//tham chieu app duoc truyen khi khoi tao instance trong cac file control
		this.actions = new Action(app)
	}

	activeAction(action, payload) {
		this.actions[action](payload)
	}
}
export default ActionMapping
