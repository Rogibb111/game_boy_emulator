import Opcode from './Opcode.js';
import Word from '../data_sizes/Word.js';

export default class TwoByteInstruction extends Word {

    constructor(val: number) {
        super(val);
    }

    getFirstByte(): Opcode {
        return new Opcode(super.getFirstByte());
    }

    getLastByte(): Opcode {
        return new Opcode(super.getLastByte());
    }
}
