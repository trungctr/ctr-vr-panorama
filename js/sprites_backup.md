background-color: #ffffff80; <--- 80 is 50% opacity

/*r  g  b  a*/
# ff ff ff 80;

Converted values: 
100% — FF
99% — FC
98% — FA
97% — F7
96% — F5
95% — F2
94% — F0
93% — ED
92% — EB
91% — E8
90% — E6
89% — E3
88% — E0
87% — DE
86% — DB
85% — D9
84% — D6
83% — D4
82% — D1
81% — CF
80% — CC
79% — C9
78% — C7
77% — C4
76% — C2
75% — BF
74% — BD
73% — BA
72% — B8
71% — B5
70% — B3
69% — B0
68% — AD
67% — AB
66% — A8
65% — A6
64% — A3
63% — A1
62% — 9E
61% — 9C
60% — 99
59% — 96
58% — 94
57% — 91
56% — 8F
55% — 8C
54% — 8A
53% — 87
52% — 85
51% — 82
50% — 80
49% — 7D
48% — 7A
47% — 78
46% — 75
45% — 73
44% — 70
43% — 6E
42% — 6B
41% — 69
40% — 66
39% — 63
38% — 61
37% — 5E
36% — 5C
35% — 59
34% — 57
33% — 54
32% — 52
31% — 4F
30% — 4D
29% — 4A
28% — 47
27% — 45
26% — 42
25% — 40
24% — 3D
23% — 3B
22% — 38
21% — 36
20% — 33
19% — 30
18% — 2E
17% — 2B
16% — 29
15% — 26
14% — 24
13% — 21
12% — 1F
11% — 1C
10% — 1A
9% — 17
8% — 14
7% — 12
6% — 0F
5% — 0D
4% — 0A
3% — 08
2% — 05
1% — 03
0% — 00


//HUD with secondary ortho camera and scene
	if (!this.isOculus) {
			this.renderer.autoClear = false
		}

		this.sceneHUD = new THREE.Scene()
		const width = window.innerWidth
		const height = window.innerHeight
		this.cameraOrtho = new THREE.OrthographicCamera(
			width / -2,
			width / 2,
			height / 2,
			height / -2,
			0,
			1000
		)
		this.cameraOrtho.position.z = 100
		this.sceneHUD.add(this.cameraOrtho)
		this.cameraOrtho.updateProjectionMatrix()

		let spriteTL, spriteTR, spriteBL, spriteBR, spriteC
		function createHUDSprites(t) {
			t.colorSpace = THREE.SRGBColorSpace

			const material = new THREE.SpriteMaterial({ map: t })
			const width = material.map.image.width
			const height = material.map.image.height

			spriteTL = new THREE.Sprite(material)
			spriteTL.center.set(0.0, 1.0)
			spriteTL.scale.set(width, height, 1)
			_THIS.sceneHUD.add(spriteTL)

			spriteTR = new THREE.Sprite(material)
			spriteTR.center.set(1.0, 1.0)
			spriteTR.scale.set(width, height, 1)
			_THIS.sceneHUD.add(spriteTR)

			spriteBL = new THREE.Sprite(material)
			spriteBL.center.set(0.0, 0.0)
			spriteBL.scale.set(width, height, 1)
			_THIS.sceneHUD.add(spriteBL)

			spriteBR = new THREE.Sprite(material)
			spriteBR.center.set(1.0, 0.0)
			spriteBR.scale.set(width, height, 1)
			_THIS.sceneHUD.add(spriteBR)

			spriteC = new THREE.Sprite(material)
			spriteC.center.set(0.5, 0.5)
			spriteC.scale.set(width, height, 1)
			_THIS.sceneHUD.add(spriteC)

			updateHUDSprites()
		}

		function updateHUDSprites() {
			const width = window.innerWidth / 2
			const height = window.innerHeight / 2

			spriteTL.position.set(-width, height, 1) // top left
			spriteTR.position.set(width, height, 1) // top right
			spriteBL.position.set(-width, -height, 1) // bottom left
			spriteBR.position.set(width, -height, 1) // bottom right
			spriteC.position.set(0, 0, 1) // center
		}

		const textureLoader = new THREE.TextureLoader()
		textureLoader.load('./asset/textures/sprite0.png', (t) =>
			createHUDSprites(t)
		)

			render() {
		if (this.isOculus) {
			this.renderer.render(this.scene, this.camera)
		} else {
			this.renderer.clear()
			this.renderer.render(this.scene, this.camera)
			// this.renderer.clearDepth()
			// this.renderer.render(this.sceneHUD, this.cameraOrtho)
		}
	}
		//on resize
		this.cameraOrtho.left = -window.innerWidth / 2
		this.cameraOrtho.right = window.innerWidth / 2
		this.cameraOrtho.top = window.innerHeight / 2
		this.cameraOrtho.bottom = -window.innerHeight / 2
		this.cameraOrtho.updateProjectionMatrix()