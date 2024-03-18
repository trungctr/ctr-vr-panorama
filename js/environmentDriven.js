/**
 * @method drive environment depend on compatibility}
 * @param main type=object - the main thread to run
 */
class ENV_driver {
	constructor(main) {
		this.log = main.log
		this.isOculus = main.isOculus
		this.currentSession = null
		this.xrSessionIsGranted = false
		this.main = main
		this.startButton = main.startButton
	}

	turnToVR() {
		const _THIS = this
		// showEnterVR(/*device*/)
		_THIS.isOculus = false
		async function onSessionStarted(session) {
			session.addEventListener('end', onSessionEnded)

			await _THIS.main.renderer.xr.setSession(session)
			_THIS.log.info('VR session started !!')
			_THIS.currentSession = session
		}

		function onSessionEnded(/*event*/) {
			_THIS.turnToWebGL()
			_THIS.currentSession.removeEventListener('end', onSessionEnded)
			_THIS.log.info('VR session ended !!')
			_THIS.currentSession = null
		}

		_THIS.startButton.style.backgroundColor = 'rgba(0,200,0,0.8)'
		_THIS.startButton.textContent = 'BẮT ĐẦU THAM QUAN'
		_THIS.startButton.onclick = function () {
			if (_THIS.currentSession === null) {
				// WebXR's requestReferenceSpace only works if the corresponding feature
				// was requested at session creation time. For simplicity, just ask for
				// the interesting ones as optional features, but be aware that the
				// requestReferenceSp_THISrns out to be unavailable.
				// ('local' is always available for immersive sessions and doesn't need to
				// be requested separately.)
				_THIS.main.VRrender()
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
				_THIS.currentSession.end()
			}
		}
	}

	turnToWebGL() {
		const _THIS = this
		_THIS.isOculus = false
		_THIS.startButton.style.background = 'rgba(0,0,255,0.8)'
		_THIS.startButton.textContent = 'BẮT ĐẦU THAM QUAN'
		_THIS.startButton.onclick = () => {
			_THIS.main.WebGLrender()
		}
		_THIS.log.info('Using WebGL')
	}

	VRNotAllowed(exception) {
		const _THIS = this
		_THIS.turnToWebGL()
		_THIS.log.error(
			'Exception when trying to call xr.isSessionSupported, turn to WebGL \n' +
				exception
		)
	}

	registerSessionGrantedListener() {
		const _THIS = this
		if ('xr' in navigator) {
			// WebXRViewer (based on Firefox) has a bug where addEventListener
			// throws a silent exception and aborts execution entirely.
			if (/WebXRViewer\//i.test(navigator.userAgent)) return

			navigator.xr.addEventListener('sessiongranted', () => {
				_THIS.xrSessionIsGranted = true
			})
		}
	}

	drive() {
		//code thread start here
		const _THIS = this
		_THIS.registerSessionGrantedListener()
		_THIS.log.info(`2. Env driven claim isOculus = ${_THIS.isOculus}`)
		if (_THIS.isOculus) {
			// turnToWebGL()
			navigator.xr
				.isSessionSupported('immersive-vr')
				.then(function (supported) {
					const condition = supported

					condition ? _THIS.turnToVR() : _THIS.turnToWebGL()

					if (condition && _THIS.xrSessionIsGranted) {
						_THIS.startButton.click()
					}
				})
				.catch((e) => _THIS.VRNotAllowed(e))

			return _THIS.startButton
		} else {
			if (window.isSecureContext === false && _THIS.isOculus) {
				var result = confirm(
					'WEBXR cần HTTPS Bạn có muốn chuyển sang HTTPS?'
				)
				if (result == true) {
					location.replace(
						document.location.href.replace(/^http:/, 'https:')
					)
				} else {
					_THIS.turnToWebGL()
				}
			} else {
				_THIS.log.error(
					'WEBXR NOT AVAILABLE: <a href="https://immersiveweb.dev/">https://immersiveweb.dev/</a>'
				)
			}
			_THIS.turnToWebGL()
			return 0
		}
	}
}

export default ENV_driver


