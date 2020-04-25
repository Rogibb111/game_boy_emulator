import Nibble from './Nibble.js'; 

export default class Byte {
    protected val: number;

    constructor(val: number) {
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
}
