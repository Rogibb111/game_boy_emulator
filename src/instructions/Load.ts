import MMU from '../MMU.js';

function LDHLnn(_r) {
    _r.l = MMU.rb(_r.pc);
    _r.h = MMU.rb(_r.pc.ADD(1));
    _r.pc = _r.pc.ADD(2);
    _r.m = 4
    _r.t = 16;
}