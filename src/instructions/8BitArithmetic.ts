import Registers from '../models/Registers.js';
import Byte from '../models/data_sizes/Byte.js';
import Instruction from '../models/data_types/Instruction.js';
import Byted from '../models/data_sizes/Byte.js';
import Opcode from '../models/data_types/Opcode.js';
import { InstructionMetaData } from './InstructionMetaData.js';

const INC_REGISTER_MAP = {
    0x04: 'b',
    0x0C: 'c',
    0x14: 'd',
    0x1C: 'e',
    0x24: 'h',
    0x2C: 'l',
    0x3C: 'a',
};

// Add E to A, leaving result in A (ADD A, E)
export function ADDr_e (_r: Registers) {
    _r.a = _r.a.ADD( _r.e.getVal()); // Perform Addition
    _r.f = new Byte(0); // Clear flags
    if (!(_r.a.AND(255))) { // Check For Zero
        _r.setZ(1); // Set 0 code
    }
    if (_r.a.getVal() > 255) { // Check for carry
        _r.setC(1); // Set carry code
    }
    _r.a = _r.a.AND(255); // Mask to 8 bits
    _r.m =1; // 1 M-time taken
    _r.t = 4;
}

    // Compare B to A, setting flags (CP, A, B)
export function CPr_b(_r: Registers) {
        let i = _r.a.getVal(); // Temp Copy of A
        i -= _r.b.getVal(); // Subtract B
        _r.setN(1);  // Set Subtraction Flag
        if (!(i & 255)) { // Check for 0
            _r.setZ(1); // Set 0 code
        }
        if (i < 0) { // Check for underflow
            _r.setC(1); // Set Carry code
        }
        _r.m = 1; // 1 M-time take
}

// Bitwise XOR between the value in A and A, which gets stored in A
export function XORA(_r: Registers) {
    this._r.a ^= this._r.a;
    this._r.m = 1;
    this._r.t = 4;
}

export function INC_RB(_r: Registers, instruction: Instruction) {
    const opcode: Opcode = instruction.getFirstByte();
    const reg: string = INC_REGISTER_MAP[opcode.getVal()];
    
    const val: Byte = _r[reg].ADD(1);
    
    if (!_r[reg].AND(255).getVal()) {
        _r.setZ(1);
    }
    if (_r[reg].getNibble().getVal() > 15) {
        _r.setH(1);
    }
    _r.setN(0);

    _r[reg] = val.AND(255);
}

export const CP_A_NB = {
    m: 2,
    t: 8,
    action: ({ _r, operand1 }) => {
        const result: Byte = _r.a.ADD(-operand1.getVal());
        
        _r.setN(1);

        if (!result.AND(255).getVal()) {
            _r.setZ(1);
        }
        if (result.getLastNibble().getVal() > 15) {
            _r.setH(1)
        }
        if (operand1.getVal() > _r.a.getVal()) {
            _r.setC(1);
        }
    },
    bytes: 2
} as InstructionMetaData;
