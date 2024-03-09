// const root = '/ctr-3js-static'
const root = '..'
const devices = {
	M1: {
		name: 'Hệ thống Cobas 8100',
		voice: `${root}/asset/voices/M1.m4a`,
		text: `Hệ thống tiền phân tích tự động hoàn toàn Cobas 8100 góp phần giải quyết tối ưu về công suất và độ tin cậy của kết quả xét nghiệm.

Hệ thống được kết nối với 2 máy Cobas 8.000 gồm 4 module E602 phân tích miễn dịch công suất xử lý đạt tới 720 test/giờ, 1 module C702 và 1 module C502 phân tích hóa sinh công suất 2800 test/giờ.`,
	},
	M2: {
		name: 'Miễn dịch tự động Cobas e801',
		voice: `${root}/asset/voices/M2.m4a`,
		text: `Miễn dịch tự động Cobas e801
- Công suất: 300 test/h
- Hãng sản xuất: Roche-Thụy sỹ
- Cobas e801 có thể nạp thuốc thử liên tục, lên tới 5 hộp thuốc thử 1 lúc.`,
	},
	M3: {
		name: 'Hóa sinh tự động Cobas c702',
		voice: `${root}/asset/voices/M3.m4a`,
		text: `Hóa sinh tự động Cobas c702
- Công suất: 2000 test/h
- Hãng sản xuất: Roche-Thụy sỹ`,
	},
	M4: {
		name: 'Accelerator A3600',
		voice: `${root}/asset/voices/M4.m4a`,
		text: `Hệ thống tiền phân tích tự động hoàn toàn A3600
- Công suất xét nghiệm tại hệ thống có thể đạt tới 1000 test (tét) miễn dịch/ 1 giờ và 4400  hóa sinh/ 1 giờ. 

Hệ thống gồm 2 module hóa sinh, 5 module miễn dịch.
Các dịch vụ: đáp được gần như hầu hết các xét nghiệm về hóa sinh, miễn dịch, nội tiết - hormone phục vụ trong lâm sàng.
- Hóa sinh: 60 dịch vụ
- Miễn dịch - Nội tiết hóc môn: 80 dịch vụ`,
	},
	M5: {
		name: 'Abbott C16000',
		voice: `${root}/asset/voices/M5.m4a`,
		text: `Hóa sinh tự động Abbott C16000 
- Công suất: 1600 test/h
- Hãng sản xuất Abbott  - Mỹ 
- Kỹ thuật xét nghiệm miễn dịch Hóa phát quang tiên tiến nhất CHEMIFLEX  cho kết quả phân tích điện giải nhanh, chính xác. Mỗi con chíp có thể thực hiện được từ 45.000 đến 150.000 xét nghiệm mới phải thay thế`,
	},
	M6: {
		name: 'Abbott I2000',
		voice: `${root}/asset/voices/M6.m4a`,
		text: `Miễn dịch tự động Abbott I2000	
- Công suất: 2000 test/h
- Hãng sản xuất: Abbott-Mỹ
`,
	},
	M7: {
		name: 'Labumat',
		voice: `${root}/asset/voices/M7.m4a`,
		text: `Labumat
- Công suất: 180 test/h
- Hãng sản xuất: DiaSorin-Đức
`,
	},
	M8: {
		name: 'Urihight',
		voice: `${root}/asset/voices/M8.m4a`,
		text: `Urihight	
- Công suất: 200 test/h
- Hãng sản xuất: Stago-Pháp
`,
	},
	M9: {
		name: 'Miễn dịch tự động LIAISON XL',
		voice: `${root}/asset/voices/`,
		text: `Miễn dịch tự động LIAISON XL
- Công suất: 180 test/h
- Hãng sản xuất: DiaSorin-Đức
`,
	},
	M10: {
		name: 'Máy đông máu tự động STA R-MAX',
		voice: `${root}/asset/voices/M9.m4a`,
		text: `Máy đông máu tự động STA R-MAX	
- Công suất: 200 test/h
- Hãng sản xuất: Stago-Pháp
`,
	},
	M11: {
		name: 'Sysmex XN-1000',
		voice: `${root}/asset/voices/M10.m4a`,
		text: `Máy phân tích huyết học laser Sysmex XN-1000	
- Công suất: 100 test/h
- Hãng sản xuất: Sysmex-Nhật Bản`,
	},
	M12: {
		name: 'Máy nhóm máu tự động Ortho Vision',
		voice: `${root}/asset/voices/M11.m4a`,
		text: `Máy nhóm máu tự động Ortho Vision
- Công suất: 40 test/h
- Hãng sản xuất: Ortho Clinical-Thụy Sĩ`,
	},
	M13: {
		name: 'HbA1c Bio-Rad D100',
		voice: `${root}/asset/voices/M12.m4a`,
		text: `Máy xét nghiệm HbA1c Bio-Rad D100
- Công suất: 80 test/giờ
- Hãng sản xuất: Biorad - Pháp
`,
	},
	M14: {
		name: 'HbA1c Tosoh G11 HPLC',
		voice: `${root}/asset/voices/M13.m4a`,
		text: `Máy xét nghiệm HbA1c Tosoh G11 HPLC	
- Công suất: 60 test/h
- Hãng sản xuất: Tosoh-Nhật Bản`,
	},
	M15: {
		name: 'DxFLEX Flow Cytometer',
		voice: `${root}/asset/voices/M14.m4a`,
		text: `Máy phân tích tế bào dòng chảy DxFLEX Flow Cytometer
- Công suất: 60 mẫu/h, 1 lần đo liên tục 32 vị trí.
- Hãng sản xuất: Beckman Coulter-Mỹ`,
	},
	M16: {
		name: 'Máy điện di mao quản Capillarys 3',
		voice: `${root}/asset/voices/M15.m4a`,
		text: `Máy điện di mao quản Capillarys 3
- Công suất: 70 mẫu/h
- Hãng sản xuất: Sebia-Pháp`,
	},
	M17: {
		name: 'Máy panel dị ứng 60 dị nguyên Q Station',
		voice: `${root}/asset/voices/M16.m4a`,
		text: `Máy panel dị ứng 60 dị nguyên Q Station
- Có thể xét nghiệm cùng lúc 48 mẫu trong 1 lần chạy
- Thời gian xét nghiệm 48 mẫu/3-4 giờ
- Hãng sản xuất: Promotec - Hàn Quốc
`,
	},
	M18: {
		name: 'Hệ thống giải trình tự & phân tích ADN ABI 3500',
		voice: `${root}/asset/voices/M17.m4a`,
		text: `Hệ thống giải trình tự & phân tích ADN ABI 3500
- Công suất: 360 mẫu /24 giờ
- Hãng sản xuất: Applied Biosystem-Mỹ`,
	},
	M19: {
		name: 'Máy cấy máu tự động BacT/Alert 3D60',
		voice: `${root}/asset/voices/M18.m4a`,
		text: `Máy cấy máu tự động BacT/Alert 3D60	
- Công suất: 60 mẫu/lần chạy
- Hãng sản xuất: Biomerieux-Mỹ`,
	},
	M20: {
		name: 'Máy định danh vi khuẩn & kháng sinh đồ VITEK 2',
		voice: `${root}/asset/voices/M19.m4a`,
		text: `Máy định danh vi khuẩn & kháng sinh đồ VITEK 2
- Công suất: 60 mẫu/lần chạy, định danh trên 552 loài vi khuẩn
- Hãng sản xuất: Biomerieux-Mỹ`,
	},
	M21: {
		name: 'Hệ thống SHPT tự động Cobas 6800',
		voice: `${root}/asset/voices/M20.m4a`,
		text: `Hệ thống SHPT tự động Cobas 6800
- Công suất: 380 mẫu/8h
- Hãng sản xuất: Roche - Thụy sỹ
`,
	},
	M22: {
		name: 'Hệ thống SHPT tự động Alinity M',
		voice: `${root}/asset/voices/M21.m4a`,
		text: `Hệ thống SHPT tự động Alinity M
- Công suất: 384 mẫu/8h
- Hãng sản xuất: Abbott-Mỹ"`,
	},
	M23: {
		name: 'MG6200',
		voice: `${root}/asset/voices/`,
		text: 'this is a machine',
	},
	M24: {
		name: 'MGI FB 100',
		voice: `${root}/asset/voices/`,
		text: 'this is a machine',
	},
	M25: {
		name: 'SQAV',
		voice: `${root}/asset/voices/`,
		text: 'this is a machine',
	},
}

export default devices
