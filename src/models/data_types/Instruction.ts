import Opcode from './Opcode.js';
import Word from '../data_sizes/Word.js';
import Operand from './Operand.js';

export default class Instruction extends Word {

    constructor(val: number) {
        super(val);
    }

    getFirstByte(): Opcode {
        return new Opcode(super.getFirstByte());
    }

    getLastByte(): Operand {
        return new Operand(super.getLastByte());
    }
}
