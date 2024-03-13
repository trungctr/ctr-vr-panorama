const GLOBAL_ENV = {
	version: '13.03.24.1256',
	isOculus: 'unknown',
	webGLcompatibility: false,
	developing: true,
	moveSpeed: 0.5,
	startButton: document.getElementById('start-button'),
	bgm: document.getElementById('BGM-speaker'),
	sfx: document.getElementById('SFX-speaker'),
	speak: document.getElementById('speak-speaker'),
	devLog: {
		error: (message) => {
			if (GLOBAL_ENV.developing) {
				document.getElementById('console').innerHTML +=
					'[ERROR] ' + String(message) + '<br>'
			}
		},
		info: (message) => {
			if (GLOBAL_ENV.developing) {
				document.getElementById('console').innerHTML +=
					'[INFO] '+String(message) + '<br>'
			}
		}
	}
}

/**
 * Hàm này để kiểm tra tương thích webGL và thiết bị
 */
;(() => {
	if (GLOBAL_ENV.developing) {
		document.getElementById('console').classList.remove('hide')
	}
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
	GLOBAL_ENV.isOculus = isOculus()
	GLOBAL_ENV.devLog.info('0.isOculus = ' + GLOBAL_ENV.isOculus)
	GLOBAL_ENV.devLog.info('1.Version = ' + GLOBAL_ENV.version)
})()

export default GLOBAL_ENV
