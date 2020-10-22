import { readFileSync } from 'fs';

describe('When I load a game into the emulator', () => {
	let Gameboy = null;
	beforeAll(() => {
		const data: Buffer = readFileSync('test/06-ld-r,r.gb');
		const rom: File = new File([new Uint8Array(data)], '06-ld-r,r.gb');
		
		document.body.innerHTML = '<div id="file-input"></div><div id="run"></div>';
		
		Gameboy = require('../dist/jsGB.js');
		Gameboy.handleRomSelect({ target: { files: [rom ] } })
	}, 1000);

	test('It Should Run without errors', () => {
		try {
			Gameboy.default.run();
		} catch (e) {
			fail(new Error(e));
		}
	});
});

