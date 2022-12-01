import Env from './environment.js'
import WebGL from './webgl-compatibility.js'

if (WebGL.isWebGLAvailable())
{
	Env.START()
} else {
	const warning = WebGLcheck.getWebGLErrorMessage()
	document.getElementById('start-button').style.background =
		'rgba(255,0,0,0.8)'
	document.getElementById('start-button').innerText =
		'TRÌNH DUYỆT KHÔNG TƯƠNG THÍCH'
}
