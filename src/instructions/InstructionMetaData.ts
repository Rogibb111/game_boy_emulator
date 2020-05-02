import Opcode from '../models/data_types/Opcode.js';
import Operand from '../models/data_types/Operand.js';
import Byte from '../models/data_sizes/Byte.js';

type RegisterNames = 'a' | 'b' | 'c' | 'd' | 'e' | 'l' | 'h' | 'bc' | 'de' | 'hl';
export interface RegisterData {
    r1: Byte;
    r2: Byte;
}
export interface ActionData {
    opcode?: Opcode;
    operand1?: Operand; 
    operand2?: Operand;
    operand3?: Operand;
    registerData: RegisterData;
}

export interface InstructionMetaData {
    m: number;
    t: number;
    action: { (data: ActionData): void | RegisterData };
    r1?: RegisterNames;
    r2?: RegisterNames;
    z: 0 | 1;
    n: 0 | 1;
    h: 0 | 1;
    c: 0 | 1;
}
