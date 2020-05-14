import Address from '../models/data_types/Address.js';
import MMU from '../MMU.js';
import { InstructionMetaData } from './InstructionMetaData.js';

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
    const conditionMet = this.map[opcode1.getVal()](_r.f);

        if (conditionMet) {
            _r.pc = _r.pc.ADD(operand1.getVal());
        }

        if (conditionMet) {
            this.m = 3;
            this.m = 12;
        }
    },
    map: {
        0x20: (flag: number) => !!(flag & 0x80 ^ 0x80),
        0x28: (flag: number) => !(flag & 0x80 ^ 0x80),
        0x30: (flag: number) => !!(flag & 0x10 ^ 0x10),
        0x38: (flag: number) => !(flag & 0x10 ^ 0x10)
    },
    bytes: 2
} as InstructionMetaData;

export const CALL_NW = {
    m: 6,
    t: 24,
    action: function ({ _r, operand1, operand2 }): void {
        const address: Address = new Address(operand1, operand2);
        
        _r.sp = _r.sp.ADD(-2);
        MMU.ww(_r.sp, _r.pc.ADD(this.bytes));
        
        this.pc = address;
        this.bytes = 0;
    },
    bytes: 3
} as InstructionMetaData;
