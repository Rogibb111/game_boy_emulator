import Nibble from './Nibble.js'; 

export default class Byte {
    protected val: number;

    constructor(val: number);
    constructor(nibble1: Nibble, nibble2: Nibble);
    constructor(nibble1OrVal: number | Nibble, nibble2?: Nibble){
        if (typeof nibble1OrVal === 'number') {
            this.val = nibble1OrVal;
        } else {
            this.val = (nibble1OrVal.getVal() << 4) + (nibble2.getVal() & 0xF);
        }
    }

    getVal() {
        return this.val;
    }

    getFirstNibble(): Nibble {
        return new Nibble(this.val >> 4);
    }

    getLastNibble(): Nibble {
        return new Nibble(this.val & 0xF);
    }

    ADD(val: number): Byte {
        return new Byte(this.val + val);
    }

    AND(val: number): Byte {
        return new Byte(this.val & val);
    }

    OR(val: number): Byte {
        return new Byte(this.val | val);
    }
}
