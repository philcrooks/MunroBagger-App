const stub_munros = [
	{
		id: 1,
		smcId: "M240",
		name: "A' Bhuidheanach Bheag",
		height: 936,
		gridRef: {letters: "NN", eastings: "66069", northings: "77600"},
		latLng: {lat: 56.870399, lng: -4.198839},
		region: "Loch Ericht to Drumochter",
		meaning: "The little yellow place",
		weatherId: "350001",
		forecast: {
			data: {
				dataDate: "2017-02-05T17:00:00Z",
				days: [
					{D: "ESE", Gn: "27", Hn: "100", PPd: "87", S: "13", V: "VP", Dm: "-1", FDm: "-7", W: "24", U: "1", $: "Day"},
					{D: "SE", Gn: "51", Hn: "97", PPd: "61", S: "40", V: "VP", Dm: "-3", FDm: "-13", W: "6", U: "1", $: "Day"},
					{D: "SSE", Gn: "11", Hn: "97", PPd: "58", S: "9", V: "MO", Dm: "-2", FDm: "-6", W: "24", U: "1", $: "Day"}
				]
			},
			updated_at: "2017-02-05T18:15:52.713Z"
		}
	},
	{
		id: 2,
		smcId: "M144",
		name: "A' Chailleach (Fannaichs)",
		height: 997,
		gridRef: {letters: "NH", eastings: "13620", northings: "71414"},
		latLng: {lat: 57.693782, lng: -5.12873},
		region: "Loch Maree to Loch Broom",
		meaning: "The old woman",
		weatherId: "350024",
		forecast: {
			data: {
				dataDate: "2017-02-05T17:00:00Z",
				days: [
					{D: "SSW", Gn: "16", Hn: "100", PPd: "42", S: "7", V: "MO", Dm: "-1", FDm: "-6", W: "23", U: "1", $: "Day"},
					{D: "SE", Gn: "58", Hn: "90", PPd: "65", S: "47", V: "VG", Dm: "-1", FDm: "-12", W: "24", U: "1", $: "Day"},
					{D: "S", Gn: "18", Hn: "94", PPd: "34", S: "16", V: "GO", Dm: "-1", FDm: "-6", W: "24", U: "1", $: "Day"}
				]
			},
			updated_at: "2017-02-05T18:17:25.631Z"
		}
	},
	{
		id: 3,
		smcId: "M251",
		name: "A' Chailleach (Monadh Liath)",
		height: 930,
		gridRef: {letters: "NH", eastings: "68110", northings: "04178"},
		latLng: {lat: 57.109564, lng: -4.179285},
		region: "Speyside to Great Glen",
		meaning: "The old woman",
		weatherId: "350025",
		forecast: {
			data: {
				dataDate: "2017-02-05T17:00:00Z",
				days: [
					{D: "ESE", Gn: "18", Hn: "97", PPd: "43", S: "9", V: "VP", Dm: "-2", FDm: "-7", W: "24", U: "1", $: "Day"},
					{D: "SSE", Gn: "49", Hn: "96", PPd: "57", S: "38", V: "VP", Dm: "-3", FDm: "-13", W: "6", U: "1", $: "Day"},
					{D: "S", Gn: "13", Hn: "97", PPd: "58", S: "9", V: "GO", Dm: "-1", FDm: "-6", W: "24", U: "1", $: "Day"}
				]
			},
			updated_at: "2017-02-05T18:15:47.744Z"
		}
	},
	{
		id: 4,
		smcId: "M033",
		name: "A' Chralaig",
		height: 1120,
		gridRef: {letters: "NH", eastings: "09431", northings: "14797"},
		latLng: {lat: 57.18424, lng: -5.154842},
		region: "Glen Shiel to Loch Mullardoch",
		meaning: "The basket or creel",
		weatherId: "350029",
		forecast: {
			data: {
				dataDate: "2017-02-05T17:00:00Z",
				days: [
					{D: "E", Gn: "20", Hn: "100", PPd: "87", S: "11", V: "MO", Dm: "-3", FDm: "-6", W: "24", U: "1", $: "Day"},
					{D: "SE", Gn: "51", Hn: "94", PPd: "67", S: "40", V: "GO", Dm: "-4", FDm: "-14", W: "24", U: "1", $: "Day"},
					{D: "SSE", Gn: "16", Hn: "98", PPd: "58", S: "11", V: "MO", Dm: "-2", FDm: "-8", W: "24", U: "1", $: "Day"}
				]
			},
			updated_at: "2017-02-05T18:19:27.710Z"
		}
	},
	{
		id: 5,
		smcId: "M274",
		name: "A' Ghlas-bheinn",
		height: 918,
		gridRef: {letters: "NH", eastings: "00822", northings: "23105"},
		latLng: {lat: 57.25509, lng: -5.303687},
		region: "Glen Shiel to Loch Mullardoch",
		meaning: "The greenish-grey hill",
		weatherId: "350044",
		forecast: {
			data: {
				dataDate: "2017-02-05T17:00:00Z",
				days: [
					{D: "ENE", Gn: "11", Hn: "100", PPd: "68", S: "2", V: "VP", Dm: "-2", FDm: "-4", W: "24", U: "1", $: "Day"},
					{D: "SE", Gn: "58", Hn: "87", PPd: "64", S: "47", V: "VG", Dm: "-2", FDm: "-13", W: "24", U: "1", $: "Day"},
					{D: "SSE", Gn: "16", Hn: "95", PPd: "49", S: "13", V: "VG", Dm: "-1", FDm: "-6", W: "24", U: "1", $: "Day"}
				]
			},
			updated_at: "2017-02-05T18:16:11.699Z"
		}
	}
];

const stub_forecasts = [
	{
		id: 1,
		munro_id: 1,
		weatherid: "350001",
		data: {
			dataDate: "2017-02-06T13:00:00Z",
			days: [
				{D: "SE", Gn: "47", Hn: "100", PPd: "58", S: "40", V: "VP", Dm: "-2", FDm: "-12", W: "6", U: "1", $: "Day"},
				{D: "ENE", Gn: "11", Hn: "99", PPd: "52", S: "9", V: "MO", Dm: "-1", FDm: "-5", W: "24", U: "1", $: "Day"},
				{D: "SE", Gn: "31", Hn: "97", PPd: "64", S: "22", V: "VP", Dm: "-2", FDm: "-11", W: "24", U: "1", $: "Day"}
			]
		},
		updated_at: "2017-02-06T13:11:14.130Z"
	},
	{
		id: 2,
		munro_id: 2,
		weatherid: "350024",
		data: {
			dataDate: "2017-02-06T13:00:00Z",
			days: [
				{D: "SE", Gn: "47", Hn: "90", PPd: "84", S: "31", V: "VG", Dm: "0", FDm: "-11", W: "23", U: "1", $: "Day"},
				{D: "SW", Gn: "13", Hn: "95", PPd: "43", S: "11", V: "GO", Dm: "0", FDm: "-6", W: "23", U: "1", $: "Day"},
				{D: "SE", Gn: "29", Hn: "94", PPd: "7", S: "22", V: "MO", Dm: "-2", FDm: "-10", W: "7", U: "1", $: "Day"}
			]
		},
		updated_at: "2017-02-06T13:12:39.031Z"
	},
	{
		id: 3,
		munro_id: 3,
		weatherid: "350025",
		data: {
			dataDate: "2017-02-06T13:00:00Z",
			days: [
				{D: "SSE", Gn: "40", Hn: "96", PPd: "56", S: "31", V: "GO", Dm: "-2", FDm: "-11", W: "24", U: "1", $: "Day"},
				{D: "WNW", Gn: "11", Hn: "99", PPd: "56", S: "9", V: "VG", Dm: "-1", FDm: "-6", W: "7", U: "1", $: "Day"},
				{D: "SSE", Gn: "29", Hn: "98", PPd: "57", S: "20", V: "PO", Dm: "-3", FDm: "-10", W: "24", U: "1", $: "Day"}
			]
		},
		updated_at: "2017-02-06T13:11:08.405Z"
	},
	{
		id: 4,
		munro_id: 4,
		weatherid: "350029",
		data: {
			dataDate: "2017-02-06T13:00:00Z",
			days: [
				{D: "SSE", Gn: "40", Hn: "100", PPd: "64", S: "29", V: "MO", Dm: "-3", FDm: "-11", W: "24", U: "1", $: "Day"},
				{D: "WNW", Gn: "13", Hn: "94", PPd: "57", S: "11", V: "VG", Dm: "-2", FDm: "-7", W: "24", U: "1", $: "Day"},
				{D: "SE", Gn: "29", Hn: "96", PPd: "17", S: "20", V: "MO", Dm: "-3", FDm: "-12", W: "8", U: "1", $: "Day"}
			]
		},
		updated_at: "2017-02-06T13:14:53.120Z"
	},
	{
		id: 5,
		munro_id: 5,
		weatherid: "350044",
		data: {
			dataDate: "2017-02-06T13:00:00Z",
			days: [
				{D: "SE", Gn: "40", Hn: "86", PPd: "60", S: "25", V: "VG", Dm: "-1", FDm: "-8", W: "24", U: "1", $: "Day"},
				{D: "SE", Gn: "11", Hn: "92", PPd: "46", S: "9", V: "VG", Dm: "-1", FDm: "-5", W: "24", U: "1", $: "Day"},
				{D: "SE", Gn: "31", Hn: "92", PPd: "8", S: "22", V: "GO", Dm: "-2", FDm: "-10", W: "7", U: "1", $: "Day"}
			]
		},
		updated_at: "2017-02-06T13:11:33.998Z"
	}
];

module.exports = { munros: stub_munros, forecasts: stub_forecasts };