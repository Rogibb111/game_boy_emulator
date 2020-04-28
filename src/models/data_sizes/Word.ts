import Byte from './Byte.js';

export default class Word {
    protected val : number;

    constructor(val: number);
    constructor(byte1: Byte, byte2: Byte);
    constructor(byte1OrVal: number | Byte, byte2?: Byte){
        if (typeof byte1OrVal === 'number') {
            this.val = byte1OrVal;
        } else {
            this.val = (byte1OrVal.getVal() << 8) + (byte2.getVal() & 0xFF);
        }
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
