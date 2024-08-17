import {
	Mesh,
	CanvasTexture,
	MeshBasicMaterial,
	PlaneGeometry,
	Matrix4,
	Raycaster,
	Scene,
	WebGLRenderer,
	Vector3,
	//three.module.js:49809 THREE.IcosahedronBufferGeometry has been renamed to THREE.IcosahedronGeometry.
	//IcosahedronBufferGeometry,
	IcosahedronGeometry,
	Color
} from '../../three162/build/three.module.js'

import { CanvasKeyboard } from './CanvasKeyboard.js'
import { CanvasColorPicker } from './CanvasColorPicker.js'
import { CanvasSlider } from './CanvasSlider.js'

/**
 * CanvasUI
 * @author Nicholas Lever
 * @refresh by TrungCTR
 * This is the class to make GUI in three js library, each GUI manager like a panel and it's elements
 * @constructor contain two parameters: content, configuration
 * @param {Object}content type = Object, this is the object containing content of each element in the panel
 * @param {Object}configuration type = Object, this is the object containing configuration of panel and each element in the panel, this Object must have 2 properties: renderer, scene
 * @example let myGUI  = new CanvasGUI(myContent, myConfig);
 * @example let myConfig = {panelSize: { width: 1, height: 1 }, renderer: app.renderer, scene: app.scene, width: 512, height: 512, opacity: 0.7, title: {type:'text', fontFamily: 'Arial', fontSize: 30, padding: 10, backgroundColor: '#000', fontColor:'#fff'}, content:{type:'text', fontFamily: 'Arial', fontSize: 16, padding: 20, backgroundColor: '#000', fontColor: '#fff'}, accept:{type:'button', fontFamily: 'Arial', fontSize:16, borderRadius:10, padding: 10}}
 * @example let myContent = {title:'this is the title', content:'This is the content', accept:'OK'}
 * @scene {Object} the scene of application that contain this panel
 * @renderer {Object} the renderer of application
 * @method setPosition(x,y,z) set the position of the panel; x,y,z is number
 * @method setRotation(x,y,z) set the rotation of the panel; x,y,z is number
 * @param {object}configuration defined by one or many children Object, each Object is one element
 * @param type text | button | image | shape | slider
 * @param hover  hex
 * @param active  hex
 * @param position  x, y, left, right, top, bottom
 * @param width pixels, will inherit from body if missing
 * @param height pixels, will inherit from body if missing
 * @param overflow fit | scroll | hidden
 * @param textAlign center | left | right
 * @param fontSize pixels
 * @param fontColor hex
 * @param fontFamily string
 * @param padding pixels
 * @param backgroundColor hex
 * @param borderRadius pixels
 * @param clipPath svg path -- note: all command in path must be in upper case
 * @param border width color style
 */
class CanvasUI {
	constructor(content, config) {
		const defaultConfig = {
			panelSize: { width: 1, height: 1 },
			width: 512,
			height: 512,
			opacity: 1,
			borderRadius: 0,
			body: {
				type: 'text',
				fontFamily: 'Arial',
				fontSize: 16,
				padding: 10,
				borderRadius: 10,
				fontColor: '#fff'
			}
		}
		this.defaultConfig = defaultConfig
		//get the config, if not any config defined use default config
		this.config =
			config === undefined
				? defaultConfig
				: this.merge(defaultConfig, config)
		//lặp qua các thuôc tính của config
		Object.entries(this.config).forEach(([name, value]) => {
			// ignore properties not use to define Graph
			if (!this.isCanvasUIObjectDefinition(value, name)) return
			// define dimensions of the element, make sure it ready to use
			const width =
				value.width !== undefined ? value.width : this.config.width
			const height =
				value.height !== undefined ? value.height : this.config.height

			// define position of element, make sure it ready to use
			const pos =
				value.position !== undefined ? value.position : { x: 0, y: 0 }
			// calculate position
			if (pos.left !== undefined && pos.x === undefined) pos.x = pos.left
			if (pos.top !== undefined && pos.y === undefined) pos.y = pos.top
			if (pos.right !== undefined && pos.x === undefined)
				pos.x = this.config.width - pos.right - width
			if (pos.bottom !== undefined && pos.y === undefined)
				pos.y = this.config.height - pos.bottom - height
			//if no position can use, put the element at 0,0
			if (pos.x === undefined) pos.x = 0
			if (pos.y === undefined) pos.y = 0

			value.position = pos
			// define type of element, make sure it ready to use
			if (value.type === undefined) value.type = 'text'
		})
		// make a empty can vas but not display yet
		const canvas = this.createOffscreenCanvas(
			this.config.width,
			this.config.height
		)
		this.context = canvas.getContext('2d')
		this.context.save()

		//define panel opacity
		const opacity =
			this.config.opacity !== undefined
				? this.config.opacity
				: defaultConfig.opacity

		const planeMaterial = new MeshBasicMaterial({
			transparent: true,
			opacity
		})

		//define panel size (1 unit = 1 meter)
		this.panelSize =
			this.config.panelSize !== undefined
				? this.config.panelSize
				: { width: 1, height: 1 }

		// define panel
		const planeGeometry = new PlaneGeometry(
			this.panelSize.width,
			this.panelSize.height
		)
		this.mesh = new Mesh(planeGeometry, planeMaterial)
		this.texture = new CanvasTexture(canvas)
		this.mesh.material.map = this.texture

		//define scene
		this.scene = this.config.scene

		//check if element have type = input text field
		const inputs = Object.values(this.config).filter((value) => {
			return value.type === 'input-text'
		})

		//if have input take field create the key board
		if (inputs.length > 0) {
			this.keyboard = new CanvasKeyboard(
				this.panelSize.width,
				this.config.renderer
			)
			const mesh = this.keyboard.mesh
			mesh.position.set(0, -0.3, 0.2)
			this.mesh.add(this.keyboard.mesh)
		}

		//check the content
		if (content === undefined) {
			//if no content set it to the default value
			this.content = { body: '' }
			this.config.body.type = 'text'
		} else {
			this.content = content
			//find all button element, in other way, this is can interact elements
			const btns = Object.values(this.config).filter((value) => {
				return (
					value.overflow === 'scroll' ||
					value.type === 'button' ||
					value.type === 'input-text' ||
					value.type === 'picker' ||
					value.type === 'slider'
				)
			})
			//behaver when found button element
			if (btns.length > 0) {
				//if no renderer make warning
				if (config === undefined || config.renderer === undefined) {
					console.warn(
						'CanvasUI: button, scroll or input-text in the config but no renderer'
					)
				} else {
					//if had a renderer defined, run the controller
					this.renderer = config.renderer
					this.initControllers()
				}
			}
		}
		this.pointerSelected = false
		// biến lưu các controller(tay cầm) khi được khởi tạo
		this.selectedElements = [undefined, undefined]
		// biến lưu trạng thái chọn của các controller
		this.selectPressed = [false, false]
		// biến lưu trạng thái cuộn của các controller
		this.scrollData = [undefined, undefined]
		// biến lưu trạng thái giao điểm của các controller
		this.intersects = [undefined, undefined]

		this.needsUpdate = true

		this.update()
	}

	isCanvasUIObjectDefinition(value, name) {
		if (typeof value !== 'object') return
		if (name === 'panelSize') return
		if (name === 'renderer') return
		if (name === 'scene') return
		return true
	}

	isCanvasUIMesh(elm, name) {
		if (typeof elm !== 'object') return
		if (name === 'panelSize') return
		if (name === 'body') return
		if (name === 'renderer') return
		if (name === 'scene') return
		return true
	}

	merge(...objects) {
		const isObject = (obj) => obj && typeof obj === 'object'

		return objects.reduce((prev, obj) => {
			Object.keys(obj).forEach((key) => {
				const pVal = prev[key]
				const oVal = obj[key]

				if (Array.isArray(pVal) && Array.isArray(oVal)) {
					// use this line to contact object rather than replace
					//prev[key] = pVal.concat(...oVal);

					// replace
					prev[key] = oVal
				} else if (isObject(pVal) && isObject(oVal)) {
					prev[key] = this.merge(pVal, oVal)
				} else {
					prev[key] = oVal
				}
			})

			return prev
		}, {})
	}

	getIntersectX(index) {
		const width = this.config.width || 512
		const intersect = this.intersects[index]
		if (intersect === undefined) return 0
		if (intersect.uv === undefined) return 0
		return intersect.uv.x * width
	}

	getIntersectY(index) {
		const height = this.config.height || 512
		const intersect = this.intersects[index]
		if (intersect === undefined) return 0
		if (intersect.uv === undefined) return 0
		return (1 - intersect.uv.y) * height
	}

	getIntersect(index) {
		const width = this.config.width || 512
		const height = this.config.height || 512
		const intersect = this.intersects[index]
		const pt = { x: 0, y: 0 }
		if (intersect === undefined) return pt
		if (intersect.uv === undefined) return pt
		pt.x = intersect.uv.x * width
		pt.y = (1 - intersect.uv.y) * height
		return pt
	}

	initControllers() {
		this.vec3 = new Vector3()
		this.mat4 = new Matrix4()
		this.raycaster = new Raycaster()

		const self = this
		// hàm xử lý khi selection chọn (trạng thái giống onclick)
		function onSelect(event) {
			const index = event.target === self.controller ? 0 : 1
			const elm = self.selectedElements[index]
			if (elm !== undefined) {
				switch (elm.type) {
					case 'button':
						self.select(index)
						break
					case 'picker':
						elm.picker.onSelect(self.getIntersect(index))
						if (elm.picker.needsUpdate) {
							self.needsUpdate = true
							elm.picker.needsUpdate = false
						}
						break
					case 'input-text':
						if (self.keyboard) {
							if (self.keyboard.visible) {
								self.keyboard.linkedUI = undefined
								self.keyboard.linkedText = undefined
								self.keyboard.linkedElement = undefined
								self.keyboard.visible = false
							} else {
								self.keyboard.linkedUI = self
								let name
								Object.entries(self.config).forEach(([prop, value]) => {
									if (value == elm) name = prop
								})
								const y =
									(0.5 -
										(elm.position.y +
											elm.height +
											self.config.body.padding) /
											self.config.height) *
									self.panelSize.height
								const h =
									Math.max(
										self.panelSize.width,
										self.panelSize.height
									) / 2
								self.keyboard.position.set(0, -h / 1.5 - y, 0.1)
								self.keyboard.linkedText = self.content[name]
								self.keyboard.linkedName = name
								self.keyboard.linkedElement = elm
								self.keyboard.visible = true
							}
						}
						break
					default:
				}
			}
		}
		/**khi selection bắt đầu chọn(mousedown)*/
		function onSelectStart(event) {
			const index = event.target === self.controller ? 0 : 1
			self.selectPressed[index] = true
			if (self.selectedElements[index] !== undefined) {
				const elm = self.selectedElements[index]
				if (elm.overflow == 'scroll') {
					self.scrollData[index] = {
						scrollY: elm.scrollY,
						rayY: self.getIntersectY(index)
					}
				}
			}
		}
		/**khi selection ngừng chọn (mouseup)*/
		function onSelectEnd(event) {
			const index = event.target === self.controller ? 0 : 1
			self.selectPressed[index] = false
			if (
				self.selectedElements[index] !== undefined &&
				self.selectedElements[index].overflow == 'scroll'
			) {
				self.scrollData[index] = undefined
			}
		}
		function onSqueeze(event) {
			console.log(event.type)
		}
		this.controller = this.renderer.xr.getController(0)
		this.controller.addEventListener('select', (e) => onSelect(e))
		this.controller.addEventListener('selectstart', (e) => onSelectStart(e))
		this.controller.addEventListener('squeeze', (e) => onSqueeze(e))
		this.controller.addEventListener('selectend', (e) => onSelectEnd(e))
		this.controller1 = this.renderer.xr.getController(1)
		this.controller1.addEventListener('select', (e) => onSelect(e))
		this.controller1.addEventListener('selectstart', (e) => onSelectStart(e))
		this.controller1.addEventListener('selectend', (e) => onSelectEnd(e))
		// chưa rõ mục đích tạo hai lưới này
		if (this.scene) {
			const radius = 0.015
			const geometry = new IcosahedronGeometry(radius)
			const material = new MeshBasicMaterial({ color: 0x0000aa })

			const mesh1 = new Mesh(geometry, material)
			mesh1.visible = false
			this.scene.add(mesh1)
			const mesh2 = new Mesh(geometry, material)
			mesh2.visible = false
			this.scene.add(mesh2)

			this.intersectMesh = [mesh1, mesh2]
		}
	}

	setClip(elm) {
		const context = this.context

		context.restore()
		context.save()

		if (elm.clipPath !== undefined) {
			const path = new Path2D(elm.clipPath)
			context.clip(path)
		} else {
			const pos = elm.position !== undefined ? elm.position : { x: 0, y: 0 }
			const borderRadius = elm.borderRadius || 0
			const width = elm.width || this.config.width
			const height = elm.height || this.config.height

			context.beginPath()

			if (borderRadius !== 0) {
				const angle = Math.PI / 2
				//start top left
				context.moveTo(pos.x + borderRadius, pos.y)
				context.arc(
					pos.x + borderRadius,
					pos.y + borderRadius,
					borderRadius,
					angle,
					angle * 2,
					true
				)
				context.lineTo(pos.x, pos.y + height - borderRadius)
				context.arc(
					pos.x + borderRadius,
					pos.y + height - borderRadius,
					borderRadius,
					0,
					angle,
					true
				)
				context.lineTo(pos.x + width - borderRadius, pos.y + height)
				context.arc(
					pos.x + width - borderRadius,
					pos.y + height - borderRadius,
					borderRadius,
					angle * 3,
					angle * 4,
					true
				)
				context.lineTo(pos.x + width, pos.y + borderRadius)
				context.arc(
					pos.x + width - borderRadius,
					pos.y + borderRadius,
					borderRadius,
					angle * 2,
					angle * 3,
					true
				)
				context.closePath()
				context.clip()
			} else {
				context.rect(pos.x, pos.y, width, height)
				context.clip()
			}
		}
	}
	/**set position for panel - public method*/
	setPosition(x, y, z) {
		if (this.mesh === undefined) return
		this.mesh.position.set(x, y, z)
	}
	/**set rotation for panel - public method */
	setRotation(x, y, z) {
		if (this.mesh === undefined) return
		this.mesh.rotation.set(x, y, z)
	}
	/**update content of a element in this panel */
	updateElement(name, content) {
		let elm = this.content[name]

		if (elm === undefined) {
			console.warn(`CanvasGUI.updateElement: No ${name} found`)
			return
		}

		if (typeof elm === 'object') {
			elm.content = content
		} else {
			elm = content
		}

		this.content[name] = elm

		this.needsUpdate = true
	}
	/**return this graphic mesh od this panel */
	get panel() {
		return this.mesh
	}

	getElementAtLocation(x, y) {
		const self = this
		const elms = Object.entries(this.config).filter(([name, elm]) => {
			if (this.isCanvasUIMesh(elm, name)) {
				const pos = elm.position
				const width =
					elm.width !== undefined ? elm.width : self.config.width
				const height =
					elm.height !== undefined ? elm.height : self.config.height
				return (
					x >= pos.x &&
					x < pos.x + width &&
					y >= pos.y &&
					y < pos.y + height
				)
			}
		})
		const elm = elms.length == 0 ? null : this.config[elms[0][0]]
		//console.log(`selected = ${elm}`);
		return elm
	}

	/**update config of a element in this panel */
	updateConfig(name, property, value) {
		let elm = this.config[name]

		if (elm === undefined) {
			console.warn(`CanvasUI.updateconfig: No ${name} found`)
			return
		}

		elm[property] = value

		this.needsUpdate = true
	}

	/**behaver when a button hovered */
	hover(index = 0, uv) {
		if (uv === undefined) {
			if (this.selectedElements[index] !== undefined) {
				this.selectedElements[index] = undefined
				this.needsUpdate = true
			}
		} else {
			const x = uv.x * (this.config.width || 512)
			const y = (1 - uv.y) * (this.config.height || 512)
			// console.log( `hover uv:${uv.x.toFixed(2)},${uv.y.toFixed(2)}>>texturePos:${x.toFixed(0)}, ${y.toFixed(0)}`);
			const elm = this.getElementAtLocation(x, y)
			if (elm === null) {
				if (this.selectedElements[index] !== undefined) {
					this.selectedElements[index] = undefined
					this.needsUpdate = true
				}
			} else if (this.selectedElements[index] !== elm) {
				this.selectedElements[index] = elm
				this.needsUpdate = true
			}
		}
	}

	/**behaver when a button or input-text selected*/
	select(index = 0) {
		if (this.selectedElements[index] !== undefined) {
			const elm = this.selectedElements[index]
			if (elm.onSelect) elm.onSelect.action(elm.onSelect.params)
			if (elm.type === 'input-text') {
				this.keyboard.mesh.visible = true
			} else {
				this.selectedElements[index] = undefined
			}
		}
	}

	scroll(index) {
		if (this.selectedElements[index] === undefined) {
			if (this.intersectMesh) this.intersectMesh[index].visible = false
			return
		}
		if (this.selectedElements[index].overflow !== 'scroll') return
		const elm = this.selectedElements[index]
		if (this.selectPressed[index]) {
			const scrollData = this.scrollData[index]
			if (scrollData !== undefined) {
				if (this.intersectMesh) {
					this.intersectMesh[index].visible = true
					this.intersectMesh[index].position.copy(
						this.intersects[index].point
					)
				}
				const rayY = this.getIntersectY(index)
				const offset = rayY - scrollData.rayY
				elm.scrollY = Math.min(
					Math.max(elm.minScrollY, scrollData.scrollY + offset),
					0
				)
				this.needsUpdate = true
			}
		} else {
			if (this.intersectMesh) this.intersectMesh[index].visible = false
		}
	}

	handleController(controller, index) {
		this.mat4.identity().extractRotation(controller.matrixWorld)

		this.raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld)
		this.raycaster.ray.direction.set(0, 0, -1).applyMatrix4(this.mat4)

		const intersects = this.raycaster.intersectObject(this.mesh)
		const elm = this.selectedElements[index]

		if (intersects.length > 0) {
			if (elm && elm.type === 'slider') {
				if (this.selectPressed[index]) {
					this.intersects[index] = intersects[0]
					elm.slider.setValueFromPos(this.getIntersectX(index))
					this.needsUpdate = true
				}
			} else {
				this.hover(index, intersects[0].uv)
				this.intersects[index] = intersects[0]
				this.scroll(index)
			}
		} else {
			this.hover(index)
			this.intersects[index] = undefined
			this.scroll(index)
		}
	}
	/**update this panel and all elements*/
	update() {
		if (this.mesh === undefined) return

		if (this.controller) this.handleController(this.controller, 0)
		if (this.controller1) this.handleController(this.controller1, 1)

		if (this.keyboard && this.keyboard.visible) this.keyboard.update()

		if (!this.needsUpdate) return

		let context = this.context

		context.clearRect(0, 0, this.config.width, this.config.height)

		const bgColor = this.config.backgroundColor
			||this.config.body.backgroundColor
			||'#FFFFFF00'
		const fontFamily = this.config.body.fontFamily
			? this.config.body.fontFamily
			: 'Arial'
		const fontColor = this.config.body.fontColor
			? this.config.body.fontColor
			: '#fff'
		const fontSize = this.config.body.fontSize
			? this.config.body.fontSize
			: 30
		this.setClip(this.config.body)
		context.fillStyle = bgColor
		context.fillRect(0, 0, this.config.width, this.config.height)

		const self = this

		Object.entries(this.content).forEach(([name, content]) => {
			const config =
				self.config[name] !== undefined
					? self.config[name]
					: self.config.body
			const display = config.display !== undefined ? config.display : 'block'

			if (display !== 'none') {
				const pos =
					config.position !== undefined ? config.position : { x: 0, y: 0 }
				const width =
					config.width !== undefined ? config.width : self.config.width
				const height =
					config.height !== undefined ? config.height : self.config.height

				if (
					config.type == 'button' &&
					!content.toLowerCase().startsWith('<path>')
				) {
					if (config.borderRadius === undefined) config.borderRadius = 6
					if (config.textAlign === undefined) config.textAlign = 'center'
				}

				self.setClip(config)

				if (config.type == 'picker') {
					if (config.picker === undefined) {
						const col = content !== undefined ? content : '#ff0000'
						config.picker = new CanvasColorPicker(
							pos.x,
							pos.y,
							width,
							height,
							col
						)
						if (config.onChange) config.picker.onChange = config.onChange
					}
					config.picker.update(context)
				} else if (config.type == 'slider') {
					if (config.slider === undefined) {
						const val = content !== undefined ? content : 0
						const range = {
							min: config.min ? config.min : 0,
							max: config.max ? config.max : 1
						}
						config.slider = new CanvasSlider(
							pos.x,
							pos.y,
							width,
							height,
							range,
							val
						)
						config.slider.canvasui = this
						if (config.onChange) config.slider.onChange = config.onChange
					}
					config.slider.update(context)
				} else {
					const svgPath = content.toLowerCase().startsWith('<path>')
					const hover =
						(self.selectedElements[0] !== undefined &&
							this.selectedElements[0] === config) ||
						(self.selectedElements[1] !== undefined &&
							this.selectedElements[1] === config)

					if (config.backgroundColor !== undefined) {
						if (
							hover &&
							config.type == 'button' &&
							config.hover !== undefined
						) {
							context.fillStyle = config.hover
						} else {
							context.fillStyle = config.backgroundColor
						}
						context.fillRect(pos.x, pos.y, width, height)
					}

					if (
						config.type == 'text' ||
						config.type == 'button' ||
						config.type == 'input-text'
					) {
						let stroke = false
						if (hover) {
							if (!svgPath && config.type == 'button') {
								context.fillStyle =
									config.fontColor !== undefined
										? config.fontColor
										: fontColor
							} else {
								context.fillStyle =
									config.hover !== undefined
										? config.hover
										: config.fontColor !== undefined
										? config.fontColor
										: fontColor
							}
							stroke = config.hover === undefined
						} else {
							context.fillStyle =
								config.fontColor !== undefined
									? config.fontColor
									: fontColor
						}

						if (svgPath) {
							const code = content
								.toUpperCase()
								.substring(6, content.length - 7)
							context.save()
							context.translate(pos.x, pos.y)
							const path = new Path2D(code)
							context.fill(path)
							context.restore()
						} else {
							self.wrapText(name, content)
						}

						if (stroke) {
							context.beginPath()
							context.strokeStyle = '#fff'
							context.lineWidth = 2
							context.rect(pos.x, pos.y, width, height)
							context.stroke()
						}
					} else if (config.type == 'img') {
						if (config.img === undefined) {
							this.loadImage(content)
								.then((img) => {
									console.log(`w: ${img.width} | h: ${img.height}`)
									config.img = img
									self.needsUpdate = true
									self.update()
								})
								.catch((err) => console.error(err))
						} else {
							const aspect = config.img.width / config.img.height
							const h = width / aspect
							context.drawImage(config.img, pos.x, pos.y, width, h)
						}
					}
				}
			}
		})

		this.needsUpdate = false
		this.texture.needsUpdate = true
	}

	loadImage(src) {
		return new Promise((resolve, reject) => {
			const img = new Image()
			img.addEventListener('load', () => resolve(img))
			img.addEventListener('error', (err) => reject(err))
			img.src = src
		})
	}

	createOffscreenCanvas(w, h) {
		const canvas = document.createElement('canvas')
		canvas.width = w
		canvas.height = h
		return canvas
	}

	fillRoundedRect(x, y, w, h, radius) {
		const ctx = this.context
		ctx.beginPath()
		ctx.moveTo(x + radius, y)
		ctx.lineTo(x + w - radius, y)
		ctx.quadraticCurveTo(x + w, y, x + w, y + radius)
		ctx.lineTo(x + w, y + h - radius)
		ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h)
		ctx.lineTo(x + radius, y + h)
		ctx.quadraticCurveTo(x, y + h, x, y + h - radius)
		ctx.lineTo(x, y + radius)
		ctx.quadraticCurveTo(x, y, x + radius, y)
		ctx.closePath()
		ctx.fill()
	}

	wrapText(name, txt) {
		//console.log( `wrapText: ${name}:${txt}`);
		const words = txt.split(' ')
		let line = ''
		const lines = []
		const config =
			this.config[name] !== undefined ? this.config[name] : this.config.body
		const width =
			config.width !== undefined ? config.width : this.config.width
		const height =
			config.height !== undefined ? config.height : this.config.height
		const pos =
			config.position !== undefined ? config.position : { x: 0, y: 0 }
		const padding =
			config.padding !== undefined
				? config.padding
				: this.config.body.padding !== undefined
				? this.config.body.padding
				: 10
		const paddingTop =
			config.paddingTop !== undefined ? config.paddingTop : padding
		const paddingLeft =
			config.paddingLeft !== undefined ? config.paddingLeft : padding
		const paddingBottom =
			config.paddingBottom !== undefined ? config.paddingBottom : padding
		const paddingRight =
			config.paddingRight !== undefined ? config.paddingRight : padding
		const rect = {
			x: pos.x + paddingLeft,
			y: pos.y + paddingTop,
			width: width - paddingLeft - paddingRight,
			height: height - paddingTop - paddingBottom
		}
		const textAlign =
			config.textAlign !== undefined
				? config.textAlign
				: this.config.body.textAlign !== undefined
				? this.config.body.textAlign
				: 'left'
		const fontSize =
			config.fontSize !== undefined
				? config.fontSize
				: this.config.body.fontSize !== undefined
				? this.config.body.fontSize
				: 30
		const fontFamily =
			config.fontFamily !== undefined
				? config.fontFamily
				: this.config.body.fontFamily !== undefined
				? this.config.body.fontFamily
				: 'Arial'
		const leading =
			config.leading !== undefined
				? config.leading
				: this.config.body.leading !== undefined
				? this.config.body.leading
				: 8
		const lineHeight = fontSize + leading

		const context = this.context

		context.textAlign = textAlign

		context.font = `${fontSize}px '${fontFamily}'`

		words.forEach(function (word) {
			let testLine = words.length > 1 ? `${line}${word} ` : word
			let metrics = context.measureText(testLine)
			if (metrics.width > rect.width && word.length > 1) {
				if (line.length == 0 && metrics.width > rect.width) {
					//word too long
					while (metrics.width > rect.width) {
						let count = 0
						do {
							count++
							testLine = word.substr(0, count)
							metrics = context.measureText(testLine)
						} while (
							metrics.width < rect.width &&
							count < word.length - 1
						)
						count--
						testLine = word.substr(0, count)
						lines.push(testLine)
						word = word.substr(count)
						if (count <= 1) break
						metrics = context.measureText(word)
					}
					if (word != '') lines.push(word)
				} else {
					lines.push(line)
					line = `${word} `
				}
			} else {
				line = testLine
			}
		})

		if (line != '') lines.push(line)

		const textHeight = lines.length * lineHeight
		let scrollY = 0

		if (textHeight > rect.height && config.overflow === 'scroll') {
			//Show a scroll bar
			if (config.scrollY === undefined) config.scrollY = 0
			const fontColor =
				config.fontColor !== undefined
					? config.fontColor
					: this.config.body.fontColor
			context.fillStyle = '#aaa'
			this.fillRoundedRect(pos.x + width - 12, pos.y, 12, height,config.borderRadius|| this.defaultConfig.body.borderRadius)
			context.fillStyle = '#666'
			const scale = rect.height / textHeight
			const thumbHeight = scale * height
			const thumbY = -config.scrollY * scale
			this.fillRoundedRect(
				pos.x + width - 12,
				pos.y + thumbY,
				12,
				thumbHeight,
				config.borderRadius || this.defaultConfig.body.borderRadius
			)
			context.fillStyle = fontColor
			scrollY = config.scrollY
			config.minScrollY = rect.height - textHeight
		}

		let y = scrollY + rect.y + fontSize / 2
		let x

		switch (textAlign) {
			case 'center':
				x = rect.x + rect.width / 2
				break
			case 'right':
				x = rect.x + rect.width
				break
			default:
				x = rect.x
				break
		}

		lines.forEach((line) => {
			if (y + lineHeight > 0) context.fillText(line, x, y)
			y += lineHeight
		})
	}
}

export { CanvasUI }



