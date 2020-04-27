import Opcode from './Opcode.js';
import Word from '../data_sizes/Word.js';
import Operand from './Operand.js';
import Byte from '../data_sizes/Byte.js';

export default class Instruction extends Word {

    // Constructor can take in either a number val, a plain Word 
    // instance, or 2 Byte instances. Passes to Word constructor
    // which only takes number or 2 Bytes instances.
    constructor(valOrByte: number | Word | Byte, byte2?: Byte) {
        if(valOrByte instanceof Word) {
            super(valOrByte.getVal());
        } else if (typeof valOrByte === 'number') {
            super(valOrByte);
        } else {
            super(valOrByte, byte2);
        }
    }

    getFirstByte(): Opcode {
        return new Opcode(super.getFirstByte());
    }

    getLastByte(): Operand {
        return new Operand(super.getLastByte());
    }
}
