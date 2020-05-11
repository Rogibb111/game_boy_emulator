import Address from '../models/data_types/Address.js';
import MMU from '../MMU.js';
import Instruction from '../models/data_types/Instruction.js';
import { InstructionMetaData } from './InstructionMetaData.js';

const CONDITION_CODE_MAPS = {
    0x20: (flag) => !!(flag & 0x80 ^ 0x80),
    0x28: (flag) => !(flag & 0x80 ^ 0x80),
    0x30: (flag) => !!(flag & 0x10 ^ 0x10),
    0x38: (flag) => !(flag & 0x10 ^ 0x10)
};

// Return from interrupt (called by handler)
export const RETI = {
    m: 3,
    t: 12,
    action: ({ _r }) => {
        _r.pc = new Address(MMU.rw(_r.sp));
        _r.sp = _r.sp.ADD(2);
    },
    ime: 1,
    bytes: 1
} as InstructionMetaData;

// Start vblank handler (0040h) 
// TODO: This instruction needs to be genericised.
export function RST40(_r) {
    // Disable further interrupts
    _r.ime = 0;

    // Save current SP on the stack
    _r.sp = this._r.sp.ADD(-2);
    MMU.ww(_r.sp, _r.pc.getVal());

    // Jump to handler
    _r.pc = new Address(0x0040);
    _r.m = 3;
    _r.t = 12;
}

export const JR_cc_e8 = {
    action: ({ opcode1, operand1,  _r }): void => {
    const conditionMet = CONDITION_CODE_MAPS[opcode1.getVal()](_r.f);

    if (conditionMet) {
        _r.pc = _r.pc.ADD(operand1.getVal());
    }

    _r.m = conditionMet ? 3 : 2;
    _r.t = conditionMet ? 12 : 8;
    },
    bytes: 2
} as InstructionMetaData;

export const CALL_NW = {
    
    action: ({ _r, operand1, operand2 }) => {
        
    },
    bytes: 3
}
