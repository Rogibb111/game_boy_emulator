import Address from './models/Address.js';
import Z80 from './Z80.js';
import MMU from './MMU.js';

class TIMER {
    _clock = {
        main: 0,
        sub: 0,
        div: 0
    };

    _reg = {
        div: 0,
        tima: 0,
        tma: 0,
        tac: 0,
    };

    inc() {
        // Increment by the last opcode's time
        this._clock.sub += Z80._r.m;

        // No opcode takes longer than 4 M-times,
        // so we need only to check for overflows once
        if(this._clock.sub >= 4) {
            this._clock.main++;
            this._clock.sub -= 4;

            //The DIV register increments at 1/16th
            //the rate, so keep a count of this
            this._clock.div++;
            if (this._reg.div == 16) {
                this._reg.div =  (this._reg.div + 1) & 255;
                this._clock.div = 0;
            }
        }

        // Check whether a step needs to be made in the timer
        this.check();
    }

    check() {
        if (this._reg.tac & 4) {
            if (this._reg.tac & 4) {
                let threshold = 0;
                switch(this._reg.tac & 3) {
                    case 0: 
                        threshold = 64; //4k
                        break;
                    case 1: 
                        threshold = 1;  //256k
                        break;
                    case 2:
                        threshold = 4;  //64k
                        break;
                    case 3:
                        threshold = 16; //16k
                        break;
                }

                if (this._clock.main >= threshold) {
                    this.step();
                }
            }
        }
    }

    step() {
        // Step the timer up by one
        this._clock.main = 0;
        this._reg.tima ++;

        if(this._reg.tima > 255) {
            // At overlfow, refill with the Modulo,
            this._reg.tima = this._reg.tma;

            // Flag a timer interrupt to the dispatcher
            MMU._if |= 4;
        }
    }

    rb(addr: Address) {
        switch(addr.getVal()) {
            case 0xFF04:
                return this._reg.div;
            case 0xFF05:
                return this._reg.tima;
            case 0xFF06:
                return this._reg.tma;
            case 0xFF07:
                return this._reg.tac;
        }
    }

    wb(addr: Address, val: number) {
        switch(addr.getVal()) {
            case 0xFF04:
                this._reg.div = 0;
                break;
            case 0xFF05:
                this._reg.tima = val;
                break;
            case 0xFF06:
                this._reg.tma = val;
                break;
            case 0xFF07:
                this._reg.tac = val & 7;
                break;
        }
    }
};

const instance = new TIMER();
export default instance;
