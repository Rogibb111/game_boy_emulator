import GPU from './GPU.js';
import TIMER from './TIMER.js';
import Z80 from './Z80.js';
import MMU from './MMU.js';
import Aggregator from './logging/implementations/Aggregator.js';
import Console from './logging/displays/Console.js';
import { RST40 } from './instructions/JumpsAndSubroutines.js';


class GameBoy {

    _interval = null;

    constructor() {
        this.reset();
    	Aggregator.registerDisplay(new Console());
	}
    reset() {
        GPU.reset();
        MMU.reset();
        Z80.reset();
        const fileInput = <HTMLInputElement>document.getElementById('file-input');
        fileInput.addEventListener('change', handleRomSelect)
        fileInput.value = ''
    }

    frame() {
		const fclk = Z80._clock.t + 70224;
        do {
            Z80.executeCurrentInstruction(); 
            // Update the Timer
            TIMER.inc();

            Z80._r.m = 0;
            Z80._r.t = 0;

            GPU.step();

            // If IME is on, and some interrupts are enabled in IE, and 
            // an interrup flag is set, handle the interrupt
            if (Z80._r.ime && MMU._ie && MMU._if) {
                // Mask off ints that aren't enabled
                const ifired = MMU._ie.AND(MMU._if.getVal());

                if(ifired.AND(0x01).getVal()) {
                    MMU._if = MMU._if.AND(255 - 0x01);
                    RST40(Z80._r);
                }
            }

            Z80._clock.m += Z80._r.m;
            Z80._clock.t += Z80._r.t;

            // Update timer again, in case a RST occured
            TIMER.inc();
        } while (Z80._clock.t < fclk);
    }

    run = () => {
        if (!this._interval) {
            this._interval = setTimeout(this.frame, 1);
            document.getElementById('run').innerHTML = 'Pause';
        } else {
            clearInterval(this._interval);
            this._interval = null;
            document.getElementById('run').innerHTML = 'Run';
        }
    }
};

const instance: GameBoy = new GameBoy();

window.onload = function() {
    document.getElementById('reset').onclick = instance.reset;
    document.getElementById('run').onclick = instance.run;
}

export function handleRomSelect({ target }){
    const { files } = target;
    const rom = files[0];

    MMU.load(rom);
}


export default instance;
