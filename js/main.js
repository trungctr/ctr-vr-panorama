import App from './app.js'
import WebGL from './webgl-compatibility.js'

if (WebGL.isWebGLAvailable()) {
    document.addEventListener('DOMContentLoaded', function () {
			const app = new App()
			window.app = app
		})
} else {
	const warning = WebGLcheck.getWebGLErrorMessage()
	document.getElementById('start-button').style.background =
		'rgba(255,0,0,0.8)'
	document.getElementById('start-button').innerText =
		'TRÌNH DUYỆT KHÔNG TƯƠNG THÍCH'
}
