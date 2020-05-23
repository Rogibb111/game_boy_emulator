import Address from '../models/data_types/Address.js';
import MMU from '../MMU.js';
import Registers from '../models/Registers.js';
import { InstructionMetaData } from './InstructionMetaData.js';

// Push r16 onto the stack one byte at a time
export const PUSH_RW = {
    m: 4,
    t: 16,
    action: function ({ _r }): void {
        _r.sp = _r.sp.ADD(-1);             // Drop through the stack
        MMU.wb(_r.sp, _r.b);               // Write B
        _r.sp = _r.sp.ADD(-1);            // Drop through the stack
        MMU.wb(_r.sp, _r.c);               // Write C
    },
    map: {

    },
    bytes: 1 
} as InstructionMetaData;

// Pop registers H and L off the stack (POP HL)
export const POPHL = {
    m: 3,
    t: 12,
    action: ({ _r }) => {
        _r.l = MMU.rb(_r.sp);              // Read L
        _r.sp = _r.sp.ADD(1);              // Move back up the stack
        _r.h = MMU.rb(_r.sp);              // Read H
        _r.sp = _r.sp.ADD(1);              // Move back up the stack
    },
    bytes: 1
};

export const LDSPnn = {
    m: 4,
    t: 16,
    action: ({ _r, operand1, operand2 }) => {
        _r.sp = new Address(operand1, operand2);       // Load up next word in memory after opcode and store in stack pointer     
    },
    bytes: 3
};


