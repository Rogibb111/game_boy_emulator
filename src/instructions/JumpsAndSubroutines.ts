import Address from '../models/data_types/Address.js';
import MMU from '../MMU.js';
import Instruction from '../models/data_types/Instruction.js';

const CONDITION_CODE_MAPS = {
    0x20: (flag) => !!(flag & 0x80 ^ 0x80),
    0x28: (flag) => !(flag & 0x80 ^ 0x80),
    0x30: (flag) => !!(flag & 0x10 ^ 0x10),
    0x38: (flag) => !(flag & 0x10 ^ 0x10)
};

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

export function JR_cc_e8(_r, instruction: Instruction) {
    const conditionMet = CONDITION_CODE_MAPS[instruction.getFirstByte().getVal()](_r.f);

    if (conditionMet) {
        _r.pc = _r.pc.ADD(instruction.getLastByte().getVal());
    }

    _r.m = conditionMet ? 3 : 2;
    _r.t = conditionMet ? 12 : 8;
}
