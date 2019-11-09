import MMU from './MMU.js';
import Address from './models/Address.js';
import Registers from './models/Registers.js';

const _clock = {
    m: 0, 
    t: 0
};

const _r = {
    a: 0,
    b: 0,
    c: 0,
    d: 0,
    e: 0,
    l: 0,
    f: 0,
    h: 0,
    pc: new Address(0),
    sp: new Address(0),
    m: 0,
    t: 0,
    ime: 0
} as Registers;

function copy(object: Object) {
    return JSON.parse(JSON.stringify(object));
}

class Z80 {
    /*----------------------------*\
    ||    Internal      State     ||
    \*----------------------------*/

    _clock = copy(_clock);

    _r: Registers = copy(_r);

    reset() {
        this._clock = copy(_clock);
        this._r = copy(_r);
    }

    _map = [
        this.ADDr_e,
        this.CPr_b,
        this.DI,
        this.EI,
        this.LDAmm,
        this.NOP,
        this.POPHL,
        this.PUSHBC,
        this.RETI,
        this.RST40
    ];


    /*----------------------------*\
    ||        Instructions        ||
    \*----------------------------*/

    // Add E to A, leaving result in A (ADD A, E)
    ADDr_e() {
        this._r.a += this._r.e; // Perform Addition
        this._r.f = 0; // Clear flags
        if (!(this._r.a & 255)) { // Check For Zero
            this._r.f |= 0x80; // Set 0 code
        }
        if (this._r.a > 255) { // Check for carry
            this._r.f |= 0x10; // Set carry code
        }
        this._r.a &= 255; // Mask to 8 bits
        this._r.m =1; // 1 M-time taken
        this._r.t = 4;
    }

    // Compare B to A, setting flags (CP, A, B)
    CPr_b() {
        let i = this._r.a; // Temp Copy of A
        i -= this._r.b; // Subtract B
        this._r.f |= 0x40; // Set Subtraction Flag
        if (!(i & 255)) { // Check for 0
            this._r.f |= 0x80; // Set 0 code
        }
        if (i < 0) { // Check for underflow
            this._r.f |= 0x10; // Set Carry code
        }
        this._r.m = 1; // 1 M-time take
    }
    // Disable IME
    DI() {
        this._r.ime = 0;
        this._r.m = 1;
        this._r.t = 4;
    }
    
    // Enable IME
    EI() {
        this._r.ime = 1;
        this._r.m = 1;
        this._r.t = 4;
    }

    // No-opertation (NOP)
    NOP() {
        this._r.m = 1; // 1 M-time take
        this._r.t = 4; 
    }

    // Push registers B and C to the stack (PUSH BC)
    PUSHBC() {
        this._r.sp = this._r.sp.ADD(-1);                               // Drop through the stack
        MMU.wb(this._r.sp, this._r.b);               // Write B
        this._r.sp = this._r.sp.ADD(-1);;                               // Drop through the stack
        MMU.wb(this._r.sp, this._r.c);               // Write C
        this._r.m = 3;                              // 3 M-times taken
        this._r.t = 12;               
    }

    // Pop registers H and L off the stack (POP HL)
    POPHL() {
        this._r.l = MMU.rb(this._r.sp);              // Read L
        this._r.sp = this._r.sp.ADD(1);                               // Move back up the stack
        this._r.h = MMU.rb(this._r.sp);              // Read H
        this._r.sp = this._r.sp.ADD(1);                               // Move back up the stack
        this._r.m = 3;                              // 3 M-times taken
        this._r.t = 12;               
    }

    // Read a byte from absolute location into A (LD A, addr)
    LDAmm() {
        const addr: Address = new Address(MMU.rw(this._r.pc));              // Get address from instr
        this._r.pc = this._r.pc.ADD(2);                            // Advance PC
        this._r.a = MMU.rb(addr);                   // Read from address
        this._r.m = 4;                              // 4 M-times taken
        this._r.t=16;                 
    }

    // Return from interrupt (called by handler)
    RETI() {
        // Restore interrupts
        this._r.ime = 1;

        // Jump to the address on the stack
        this._r.pc = new Address(MMU.rw(this._r.sp));
        this._r.sp = this._r.sp.ADD(2);

        this._r.m = 3;
        this._r.t = 12;
    }
    
    // Start vblank handler (0040h)
    RST40() {
        // Disable further interrupts
        this._r.ime = 0;

        // Save current SP on the stack
        this._r.sp = this._r.sp.ADD(-2);
        MMU.ww(this._r.sp, this._r.pc.getVal());

        // Jump to handler
        this._r.pc = new Address(0x0040);
        this._r.m = 3;
        this._r.t = 12;
    }
};

const instance: Z80 = new Z80();
export default instance;

