import Opcode from '../models/data_types/Opcode.js';
import Operand from '../models/data_types/Operand.js';
import Registers from '../models/Registers.js';

export interface ActionData {
    opcode1?: Opcode;
    opcode2?: Opcode;
    operand1?: Operand; 
    operand2?: Operand;
    _r: Registers;
}

export interface InstructionMetaData {
    m: number;
    t: number;
    action: { (data: ActionData): void };
    z?: 0 | 1;
    n?: 0 | 1;
    h?: 0 | 1;
    c?: 0 | 1;
    ime?: 0 | 1;
    bytes: number;
    map: object | Array<number | string> | {(opcode: Opcode): number};
}
