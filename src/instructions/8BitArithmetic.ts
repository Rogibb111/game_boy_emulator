// Add E to A, leaving result in A (ADD A, E)
export function ADDr_e (_r) {
    _r.a += _r.e; // Perform Addition
    _r.f = 0; // Clear flags
    if (!(_r.a & 255)) { // Check For Zero
        _r.f |= 0x80; // Set 0 code
    }
    if (_r.a > 255) { // Check for carry
        _r.f |= 0x10; // Set carry code
    }
    _r.a &= 255; // Mask to 8 bits
    _r.m =1; // 1 M-time taken
    _r.t = 4;
}

    // Compare B to A, setting flags (CP, A, B)
export function CPr_b(_r) {
        let i = _r.a; // Temp Copy of A
        i -= _r.b; // Subtract B
        _r.f |= 0x40; // Set Subtraction Flag
        if (!(i & 255)) { // Check for 0
            _r.f |= 0x80; // Set 0 code
        }
        if (i < 0) { // Check for underflow
            _r.f |= 0x10; // Set Carry code
        }
        _r.m = 1; // 1 M-time take
}

export function XORA() {
    this._r.a ^= this._r.a;
    this._r.m = 1;
    this._r.t = 4;
}
