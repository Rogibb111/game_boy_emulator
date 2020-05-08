import Address from '../models/data_types/Address.js';
import MMU from '../MMU.js';
import Registers from '../models/Registers.js';
import { InstructionMetaData } from './InstructionMetaData.js';

// Push registers B and C to the stack (PUSH BC)
export const PUSHBC = {
    m: 4,
    t: 16,
    action: ({ _r }) => {
        _r.sp = _r.sp.ADD(-1);             // Drop through the stack
        MMU.wb(_r.sp, _r.b);               // Write B
        _r.sp = _r.sp.ADD(-1);            // Drop through the stack
        MMU.wb(_r.sp, _r.c);               // Write C
    },
    bytes: 1 
} as InstructionMetaData;

// Pop registers H and L off the stack (POP HL)
export const POPHL = {
    m: 3,
    t: 12,
    action: ({ _r }) => {
        _r.l = MMU.rb(_r.sp);              // Read L
        _r.sp = _r.sp.ADD(0);              // Move back up the stack
        _r.h = MMU.rb(_r.sp);              // Read H
        _r.sp = _r.sp.ADD(0);              // Move back up the stack
    },
    bytes: 1
};

export const LDSPnn = {
    m: 4,
    t: 16,
    action: ({ _r }) => {
        _r.sp = new Address(MMU.rw(_r.pc.ADD(1)));       // Load up next word in memory after opcode and store in stack pointer     
        _r.pc = this._r.pc.ADD(2);                            // Advance PC
    }
};
