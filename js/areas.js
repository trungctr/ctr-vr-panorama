const root = '/ctr-3js-static'
const areas = {
	1: {
		name: 'Khu nhận mẫu ban đầu',
		voice: `${root}/asset/voices/f1_flip.jpg`,
		img: `${root}/asset/img/scene_1_flip.jpg`,
		machines: []
	},
	'3_1': {
		name: 'Khu vực hệ thống tự động hoàn toàn Roche 1/3',
		voice: `${root}/asset/voices/f1_flip.jpg`,
		img: `${root}/asset/img/scene_3_flip.jpg`,
		machines: ['1', '2', '3']
	},
	'3_2': {
		name: 'Khu vực hệ thống tự động hoàn toàn Roche 2/3',
		voice: `${root}/asset/voices/f1_flip.jpg`,
		img: `${root}/asset/img/scene_4_flip.jpg`,
		machines: []
	},
	'3_3': {
		name: 'Khu vực hệ thống tự động hoàn toàn Roche 3/3',
		voice: `${root}/asset/voices/f1_flip.jpg`,
		img: `${root}/asset/img/scene_5_flip.jpg`,
		machines: []
	},
	'4_1': {
		name: 'Khu vực hệ thống tự động toàn Abbott1/2',
		voice: `${root}/asset/voices/f1_flip.jpg`,
		img: `${root}/asset/img/scene_6_flip.jpg`,
		machines: ['4', '5', '6']
	},
	'4_2': {
		name: 'Khu vực hệ thống tự động toàn Abbott 2/2',
		voice: `${root}/asset/voices/f1_flip.jpg`,
		img: `${root}/asset/img/scene_7_flip.jpg`,
		machines: []
	},
	5: {
		name: 'Khu vực Elisa',
		voice: `${root}/asset/voices/f1_flip.jpg`,
		img: `${root}/asset/img/scene_8_flip.jpg`,
		machines: ['7']
	},
	6: {
		name: 'Phòng xét nghiệm sinh hóa và cặn nước tiểu',
		voice: `${root}/asset/voices/f1_flip.jpg`,
		img: `${root}/asset/img/scene_9_flip.jpg`,
		machines: []
	},
	7: {
		name: 'Phòng đọc kết quả Tế bào - Giải phẫu bệnh',
		voice: `${root}/asset/voices/f1_flip.jpg`,
		img: `${root}/asset/img/scene_10_flip.jpg`,
		machines: []
	},
	'8_1': {
		name: 'Phòng huyết học 1/2',
		voice: `${root}/asset/voices/f1_flip.jpg`,
		img: `${root}/asset/img/scene_11_flip.jpg`,
		machines: ['8', '9', '10', '11', '12', '13', '14', '15']
	},
	'8_2': {
		name: 'Phòng huyết học 2/2',
		voice: `${root}/asset/voices/f1_flip.jpg`,
		img: `${root}/asset/img/scene_12_flip.jpg`,
		machines: ['8', '9', '10', '11', '12', '13', '14', '15']
	},
	9: {
		name: 'Phòng tách chiết - Sinh học phân tử',
		voice: `${root}/asset/voices/f1_flip.jpg`,
		img: `${root}/asset/img/scene_16_flip.jpg`,
		machines: []
	},
	10: {
		name: 'Phòng PCR - Sinh học phân tử',
		voice: `${root}/asset/voices/f1_flip.jpg`,
		img: `${root}/asset/img/scene_14_flip.jpg`,
		machines: []
	},
	11: {
		name: 'Phòng sau PCR - Sinh học phân tử',
		voice: `${root}/asset/voices/f1_flip.jpg`,
		img: `${root}/asset/img/scene_15_flip.jpg`,
		machines: ['19', '20']
	},
	12: {
		name: 'Phòng tách chiết và giải trình tự GEN - sinh học phân tử',
		voice: `${root}/asset/voices/f1_flip.jpg`,
		img: `${root}/asset/img/scene_18_flip.jpg`,
		machines: []
	},
	13: {
		name: 'Phòng nuôi cấy tế bào, nhiễm sắc thể đồ - sinh học phân tử',
		voice: `${root}/asset/voices/f1_flip.jpg`,
		img: `${root}/asset/img/scene_17_flip.jpg`,
		machines: []
	},
	14: {
		name: 'Phòng vi sinh ký sinh trùng',
		voice: `${root}/asset/voices/f1_flip.jpg`,
		img: `${root}/asset/img/scene_13_flip.jpg`,
		machines: ['16', '17', '18']
	},
	15: {
		name: 'Kho lưu mẫu sau phân tích',
		voice: `${root}/asset/voices/f1_flip.jpg`,
		img: `${root}/asset/img/scene_13_flip.jpg`,
		machines: []
	}
}

export default areas
