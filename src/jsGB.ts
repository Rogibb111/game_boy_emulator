import GPU from './GPU';
import TIMER from './TIMER';
import Z80 from './Z80';

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
        fileInput.value = ''
    }

    frame() {
        var fclk = Z80._clock.t + 70224;
        do {
            Z80._map[MMU.rb(Z80._r.pc += 1)]();
            Z80._r.pc &= 65535;
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
                var ifired = MMU._ie & MMU._if;

                if(ifired & 0x01) {
                    MMU._if &= (255 - 0x01);
                    Z80._ops.RST40();
                }
            }

            Z80._clock.m += Z80._r.m;
            Z80._clock.t += Z80._r.t;

            // Update timer again, in case a RST occured
            TIMER.inc();
        } while (Z80._clock.t < fclk);
    }

    run() {
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