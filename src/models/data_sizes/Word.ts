import Byte from './Byte.js';

export default class Word {
    private data: number;

    constructor(data: number) {
    }

    getFirstByte(): Byte {
        return new Byte(this.data >> 8);
    }

    getLastByte(): Byte {
        return new Byte(this.data & 0xFF);
    }
}
