var _clock = {
    m: 0, 
    t: 0
};

var _r = {
    // 8-bit registers
    a: 0,
    b: 0,
    c: 0,
    d: 0,
    e: 0,
    l: 0,
    f: 0, //flag register
    // 16-bit registers
    pc: 0,
    sp: 0,
    // clock for last instructions
    m: 0,
    t: 0,
    // interupt master enable
    ime: 0
};

Z80 = {
    /*----------------------------*\
    ||    Internal      State     ||
    \*----------------------------*/

    _clock: JSON.parse(JSON.stringify(_clock)),

    _r: JSON.parse(JSON.stringify(_r)),

    reset: function() {
        Z80._clock = JSON.parse(JSON.stringify(_clock));
        Z80._r = JSON.parse(JSON.stringify(_r));
    },

    dispatcher: function() {
        Z80._map = [
            Z80._ops.NOP,
            Z80._ops.LDBCnn,
            Z80._ops.LDBCmA,
            Z80._ops.INCBC,
            Z80._ops.INCr_b,
        ];

        while(true)
        {
            var op = MMU.rb(Z80._r.pc++);              // Fetch instruction
            Z80._map[op]();                            // Dispatch
            Z80._r.pc &= 65535;                        // Mask PC to 16 bits
            Z80._clock.m += Z80._r.m;                  // Add time to CPU clock
            Z80._clock.t += Z80._r.t;
            Z80._r.m = 0;
            Z80._r.m = 0;

            GPU.step();

            // If IME is on, and some interrupts are enabled in IE, and 
            // an interrup flag is set, handle the interrupt
            if(Z80._r.ime && MMU._ie && MMU._if) {
                // Mask off ints that aren't enabled
                var ifired = MMU._ie & MMU._if;

                if(ifired & 0x01) {
                    MMU._if &= (255 - 0x01);
                    Z80._ops.RST40();
                }
            }

            Z80._clock.m += Z80._r.m;
            Z80._clock.t += Z80._r.t;
        }
    },

    /*----------------------------*\
    ||        Instructions        ||
    \*----------------------------*/

    // Add E to A, leaving result in A (ADD A, E)
    ADDr_e: function() {
        Z80._r.a += Z80._r.e; // Perform Addition
        Z80._r.f = 0; // Clear flags
        if (!(Z80._r.a & 255)) { // Check For Zero
            Z80._r.f |= 0x80; // Set 0 code
        }
        if (Z80._r.a > 255) { // Check for carry
            Z80._r.f |= 0x10; // Set carry code
        }
        Z80._r.a &= 255; // Mask to 8 bits
        Z80._r.m =1; // 1 M-time taken
        Z80._r.t = 4;
    },

    // Compare B to A, setting flags (CP, A, B)
    CPr_b: function() {
        var i = Z80._r.a; // Temp Copy of A
        i -= Z80._r.b; // Subtract B
        Z80._r.f |= 0x40; // Set Subtraction Flag
        if (!(i & 255)) { // Check for 0
            Z80._r.f |= 0x80; // Set 0 code
        }
        if (i < 0) { // Check for underflow
            Z80._r.f |= 0x10; // Set Carry code
        }
        Z80._r.m = 1; // 1 M-time take
        Z80._r.t = 4; 
    },

    // Disable IME
    DI: function() {
        Z80._r.ime = 0;
        Z80._r.m = 1;
        Z80._r.t = 4;
    },
    
    // Enable IME
    EI: function() {
        Z80._r.ime = 1;
        Z80._r.m = 1;
        Z80._r.t = 4;
    },

    // No-opertation (NOP)
    NOP: function() {
        Z80._r.m = 1; // 1 M-time take
        Z80._r.t = 4; 
    },

    // Push registers B and C to the stack (PUSH BC)
    PUSHBC: function() {
        Z80._r.sp--;                               // Drop through the stack
        MMU.wb(Z80._r.sp, Z80._r.b);               // Write B
        Z80._r.sp--;                               // Drop through the stack
        MMU.wb(Z80._r.sp, Z80._r.c);               // Write C
        Z80._r.m = 3;                              // 3 M-times taken
        Z80._r.t = 12;               
    },

    // Pop registers H and L off the stack (POP HL)
    POPHL: function() {
        Z80._r.l = MMU.rb(Z80._r.sp);              // Read L
        Z80._r.sp++;                               // Move back up the stack
        Z80._r.h = MMU.rb(Z80._r.sp);              // Read H
        Z80._r.sp++;                               // Move back up the stack
        Z80._r.m = 3;                              // 3 M-times taken
        Z80._r.t = 12;               
    },

    // Read a byte from absolute location into A (LD A, addr)
    LDAmm: function() {
        var addr = MMU.rw(Z80._r.pc);              // Get address from instr
        Z80._r.pc += 2;                            // Advance PC
        Z80._r.a = MMU.rb(addr);                   // Read from address
        Z80._r.m = 4;                              // 4 M-times taken
        Z80._r.t=16;                 
    },

    // Return from interrupt (called by handler)
    RETI: function() {
        // Restore interrupts
        Z80._r.ime = 1;

        // Jump to the address on the stack
        Z80._r.pc = MMU.rw(Z80._r.sp);
        Z80._r.sp += 2;

        Z80._r.m = 3;
        Z80._r.t = 12;
    },
    
    // Start vblank handler (0040h)
    RST40: function() {
        // Disable further interrupts
        Z80._r.ime = 0;

        // Save current SP on the stack
        Z80._r.sp -= 2;
        MMU.ww(Z80._r.sp, Z80._r.pc);

        // Jump to handler
        Z80._r.pc = 0x0040;
        Z80._r.m = 3;
        Z80._r.t = 12;
    }
};
