import { readFileSync } from 'fs';

const sleep = m => new Promise(r => setTimeout(r, m));

describe('When I load a game into the emulator', () => {
	let Gameboy = null;
	beforeAll(async () => {
		const data: Buffer = readFileSync('test/06-ld-r,r.gb');
		const rom: File = new File([new Uint8Array(data)], '06-ld-r,r.gb');
	
		document.body.innerHTML = `
			<div id="file-input"></div>
			<div id="run"></div>
			<div id="reset"></div>
			<canvas id="screen"></canvas>
		`;
		
		Gameboy = require('../dist/jsGB.js');
		Gameboy.handleRomSelect({ target: { files: [rom ] } });
		await sleep(3000);
	});

	test('It Should Run without errors', async () => {
		try {
			Gameboy.default.run();	
    		await sleep(3000);
		} catch (e) {
			fail(new Error(e));
		}
	});
});

