import GPU from './GPU.js';
import TIMER from './TIMER.js';
import Z80 from './Z80.js';
import MMU from './MMU.js';
import { RST40 } from './instructions/JumpsAndSubroutines.js';

class GameBoy {

    _interval: number = null;

    constructor() {
        this.reset();
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
            const instruction = MMU.rb(Z80._r.pc);
            Z80._map[instruction >> 8](Z80._r, instruction);
            Z80._r.pc = Z80._r.pc.ADD(1).AND(65535);
            Z80._clock.m += Z80._r.m;
            Z80._clock.t += Z80._r.t;
            
            // Update the Timer
            TIMER.inc();

            Z80._r.m = 0;
            Z80._r.t = 0;

            GPU.step();

            // If IME is on, and some interrupts are enabled in IE, and 
            // an interrup flag is set, handle the interrupt
            if (Z80._r.ime && MMU._ie && MMU._if) {
                // Mask off ints that aren't enabled
                const ifired = MMU._ie & MMU._if;

                if(ifired & 0x01) {
                    MMU._if &= (255 - 0x01);
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
    instance.reset();
}

function handleRomSelect({ target }){
    const { files } = target;
    const rom = files[0];

    MMU.load(rom);
}


export default instance;
