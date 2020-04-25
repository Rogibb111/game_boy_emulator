import Address from '../models/data_types/Address';
import MMU from '../MMU.js';

// Push registers B and C to the stack (PUSH BC)
export function PUSHBC(_r) {
    _r.sp = _r.sp.ADD(-1);             // Drop through the stack
    MMU.wb(_r.sp, _r.b);               // Write B
    _r.sp = _r.sp.ADD(-1);;            // Drop through the stack
    MMU.wb(_r.sp, _r.c);               // Write C
    _r.m = 3;                          // 3 M-times taken
    _r.t = 12;               
}

// Pop registers H and L off the stack (POP HL)
export function POPHL(_r) {
    _r.l = MMU.rb(_r.sp);              // Read L
    _r.sp = _r.sp.ADD(1);              // Move back up the stack
    _r.h = MMU.rb(_r.sp);              // Read H
    _r.sp = _r.sp.ADD(1);              // Move back up the stack
    _r.m = 3;                          // 3 M-times taken
    _r.t = 12;               
}


export function LDSPnn(_r) {
    _r.sp = new Address(MMU.rw(_r.pc.ADD(1)));       // Load up next word in memory after opcode and store in stack pointer     
    _r.pc = this._r.pc.ADD(2);                            // Advance PC
    _r.m = 4;                              // 4 M-times taken
    _r.t=16;                 
}
