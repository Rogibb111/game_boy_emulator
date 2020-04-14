import Address from '../models/Address';
import MMU from '../MMU';

// Return from interrupt (called by handler)
export function RETI(_r) {
    // Restore interrupts
    _r.ime = 1;

    // Jump to the address on the stack
    _r.pc = new Address(MMU.rw(_r.sp));
    _r.sp = _r.sp.ADD(2);

    _r.m = 3;
    _r.t = 12;
}

// Start vblank handler (0040h)
export function RST40() {
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
