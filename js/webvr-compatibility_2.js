class WebXR {
	static isSupported(handler) {
		let xrSessionIsGranted = false
		function registerSessionGrantedListener() {
			if ('xr' in navigator) {
				// WebXRViewer (based on Firefox) has a bug where addEventListener
				// throws a silent exception and aborts execution entirely.
				if (/WebXRViewer\//i.test(navigator.userAgent)) return

				navigator.xr.addEventListener('sessiongranted', () => {
					xrSessionIsGranted = true
				})
			}
		}
		registerSessionGrantedListener()

		if ('xr' in navigator) {
			navigator.xr
				.isSessionSupported('immersive-vr')
				.then(function (supported) {
					return supported
				})
				.catch(() => {
					if (handler) {
						handler()
					} else {
						return false
					}
				})
		}
	}
	static checkHttps(handler) {
		if ('xr' in navigator) {
			if (window.isSecureContext === false) {
				var result = confirm(
					'WEBXR cần HTTPS Bạn có muốn chuyển sang HTTPS?'
				)
				if (result == true) {
					location.replace(
						document.location.href.replace(/^http:/, 'https:')
					)
				} else {
					if (handler) {
						handler()
					} else {
						return 0
					}
				}
			}
		}
	}
}

export default WebXR
