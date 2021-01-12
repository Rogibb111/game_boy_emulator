import Address from '../models/data_types/Address.js';
import MMU from '../MMU.js';
import { InstructionMetaData } from './InstructionMetaData.js';

const POP_PUSH_MAP = {
    0xC: ['b', 'c'],
    0xD: ['d', 'e'],
    0XE: ['h', 'l'],
    0XF: ['a', 'f']
};
// Push r16 onto the stack one byte at a time
export const PUSH_RW = {
    m: 4,
    t: 16,
    action: function ({ _r, opcode1 }): void {
        const [upper, lower] = this.map[opcode1.getVal() >> 4];

        _r.sp = _r.sp.ADD(-1);             // Drop through the stack
        MMU.wb(_r.sp, _r[upper]);               // Write B
        _r.sp = _r.sp.ADD(-1);            // Drop through the stack
        MMU.wb(_r.sp, _r[lower]);               // Write C
    },
    map: POP_PUSH_MAP,
    bytes: 1 
} as InstructionMetaData;

// Pop registers H and L off the stack (POP HL)
export const POP_RW = {
    m: 3,
    t: 12,
    action: function ({ _r, opcode1 }) {
        const [upper, lower] = this.map[opcode1.getVal() >> 4];
        _r[lower] = MMU.rb(_r.sp);         // Read L
        _r.sp = _r.sp.ADD(1);              // Move back up the stack
        _r[upper] = MMU.rb(_r.sp);         // Read H
        _r.sp = _r.sp.ADD(1);              // Move back up the stack
    },
    map: POP_PUSH_MAP,
    bytes: 1
} as InstructionMetaData;

export const LDSPnn = {
    m: 3,
    t: 12,
    action: ({ _r, operand1, operand2 }) => {
        _r.sp = new Address(operand1, operand2);       // Load up next word in memory after opcode and store in stack pointer     
    },
    bytes: 3
};


