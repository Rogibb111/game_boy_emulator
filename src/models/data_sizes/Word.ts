import Byte from './Byte.js';

export default class Word {
    protected val : number;

    constructor(val: number) {
    }

    getVal() {
        return this.val;
    }

    printHex() {
        console.log(this.val.toString(16));
    }

    printDec() {
        console.log(this.val.toString());
    }

    printBin() {
        console.log(this.val.toString(2));
    }

    getFirstByte(): Byte {
        return new Byte(this.val >> 8);
    }

    getLastByte(): Byte {
        return new Byte(this.val & 0xFF);
    }
}
