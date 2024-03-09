// const root = '/ctr-3js-static'
const root = '.'
const areas = {
	A_1: {
		stt: 'start',
		name: 'Khu nhận mẫu ban đầu',
		voice: `${root}/asset/voices/F2.m4a`,
		img: `${root}/asset/img/scene_1.jpg`,
		devices: []
	},
	A_2: {
		stt: '3_1',
		name: 'Khu vực hệ thống tự động hoàn toàn Roche (1/3)',
		voice: `${root}/asset/voices/F3.m4a`,
		img: `${root}/asset/img/scene_3.jpg`,
		devices: ['M1']
	},
	A_3: {
		stt: '3_2',
		name: 'Khu vực hệ thống tự động hoàn toàn Roche (2/3)',
		voice: ``,
		img: `${root}/asset/img/scene_4.jpg`,
		devices: ['M1', 'M2', 'M3']
	},
	A_4: {
		stt: '3_3',
		name: 'Khu vực hệ thống tự động hoàn toàn Roche (3/3)',
		voice: ``,
		img: `${root}/asset/img/scene_5.jpg`,
		devices: ['M2', 'M3']
	},
	A_5: {
		stt: '4_1',
		name: 'Khu vực hệ thống tự động toàn Abbott (1/2)',
		voice: `${root}/asset/voices/F4.m4a`,
		img: `${root}/asset/img/scene_6.jpg`,
		devices: ['M4', 'M5', 'M6']
	},
	A_6: {
		stt: '4_2',
		name: 'Khu vực hệ thống tự động toàn Abbott (2/2)',
		voice: ``,
		img: `${root}/asset/img/scene_7.jpg`,
		devices: []
	},
	A_7: {
		stt: '5',
		name: 'Khu vực Elisa',
		voice: `${root}/asset/voices/F5.m4a`,
		img: `${root}/asset/img/scene_8.jpg`,
		devices: ['M7']
	},
	A_8: {
		stt: '6',
		name: 'Phòng xét nghiệm sinh hóa và cặn nước tiểu',
		voice: `${root}/asset/voices/F6.m4a`,
		img: `${root}/asset/img/scene_9.jpg`,
		devices: []
	},
	A_9: {
		stt: '7',
		name: 'Phòng đọc kết quả Tế bào - Giải phẫu bệnh',
		voice: `${root}/asset/voices/F7.m4a`,
		img: `${root}/asset/img/scene_10.jpg`,
		devices: []
	},
	A_10: {
		stt: '8_1',
		name: 'Phòng huyết học (1/2)',
		voice: `${root}/asset/voices/F8.m4a`,
		img: `${root}/asset/img/scene_11.jpg`,
		devices: ['M8', 'M9', 'M10', 'M11', 'M12', 'M13', 'M14', 'M15']
	},
	A_11: {
		stt: '8_2',
		name: 'Phòng huyết học (2/2)',
		voice: ``,
		img: `${root}/asset/img/scene_12.jpg`,
		devices: ['M8', 'M9', 'M10', 'M11', 'M12', 'M13', 'M14', 'M15']
	},
	A_12: {
		stt: '9',
		name: 'Phòng tách chiết - Sinh học phân tử',
		voice: `${root}/asset/voices/F12.m4a`,
		img: `${root}/asset/img/scene_16.jpg`,
		devices: []
	},
	A_13: {
		stt: '10',
		name: 'Phòng PCR - Sinh học phân tử',
		voice: `${root}/asset/voices/F10.m4a`,
		img: `${root}/asset/img/scene_14.jpg`,
		devices: []
	},
	A_14: {
		stt: '11',
		name: 'Phòng sau PCR - Sinh học phân tử',
		voice: `${root}/asset/voices/F11.m4a`,
		img: `${root}/asset/img/scene_15.jpg`,
		devices: ['M19', 'M20']
	},
	A_15: {
		stt: '12',
		name: 'Phòng nuôi cấy tế bào, nhiễm sắc thể đồ - sinh học phân tử',
		voice: `${root}/asset/voices/F13.m4a`,
		img: `${root}/asset/img/scene_17.jpg`,
		devices: []
	},
	A_16: {
		stt: '13',
		name: 'Phòng tách chiết và giải trình tự GEN - sinh học phân tử',
		voice: `${root}/asset/voices/F14.ogg`,
		img: `${root}/asset/img/scene_18.jpg`,
		devices: []
	},
	A_17: {
		stt: '14',
		name: 'Phòng vi sinh ký sinh trùng',
		voice: `${root}/asset/voices/F9.m4a`,
		img: `${root}/asset/img/scene_13.jpg`,
		devices: ['M16', 'M17', 'M18']
	},
	A_18: {
		stt: '15',
		name: 'Kho lưu mẫu sau phân tích',
		voice: `${root}/asset/voices/F15.m4a`,
		img: `${root}/asset/img/scene_19.jpg`,
		devices: []
	}
}

export default areas
