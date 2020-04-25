import Nibble from './Nibble.js'; 

export default class Byte {
    private data: number;

    constructor(data: number) {
    }

    getFirstNibble(): Nibble {
        return new Nibble(this.data >> 4);
    }

    getLastNibble(): Nibble {
        return new Nibble(this.data & 0xF);
    }
}
