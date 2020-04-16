import MMU from '../MMU';
import Address from '../models/Address';

// Read a byte from absolute location into A (LD A, addr)
export function LDAn(_r) {
    const addr: Address = new Address(MMU.rw(_r.pc));              // Get address from instr
    _r.pc = this._r.pc.ADD(2);                            // Advance PC
    _r.a = MMU.rb(addr);                   // Read from address
    _r.m = 4;                              // 4 M-times taken
    _r.t=16;                 
}


export function LDHLnn(_r) {
    _r.l = MMU.rb(_r.pc);
    _r.h = MMU.rb(_r.pc.ADD(1));
    _r.pc = _r.pc.ADD(2);
    _r.m = 4
    _r.t = 16;
}
