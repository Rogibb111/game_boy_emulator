import Registers from '../models/Registers.js';
import Byte from '../models/data_sizes/Byte.js';

// Add E to A, leaving result in A (ADD A, E)
export function ADDr_e (_r: Registers) {
    _r.a = _r.a.ADD( _r.e.getVal()); // Perform Addition
    _r.f = new Byte(0); // Clear flags
    if (!(_r.a.AND(255))) { // Check For Zero
        _r.setZ(1); // Set 0 code
    }
    if (_r.a.getVal() > 255) { // Check for carry
        _r.setC(1); // Set carry code
    }
    _r.a = _r.a.AND(255); // Mask to 8 bits
    _r.m =1; // 1 M-time taken
    _r.t = 4;
}

    // Compare B to A, setting flags (CP, A, B)
export function CPr_b(_r: Registers) {
        let i = _r.a.getVal(); // Temp Copy of A
        i -= _r.b.getVal(); // Subtract B
        _r.setN(1);  // Set Subtraction Flag
        if (!(i & 255)) { // Check for 0
            _r.setZ(1); // Set 0 code
        }
        if (i < 0) { // Check for underflow
            _r.setC(1); // Set Carry code
        }
        _r.m = 1; // 1 M-time take
}

// Bitwise XOR between the value in A and A, which gets stored in A
export function XORA(_r: Registers) {
    this._r.a ^= this._r.a;
    this._r.m = 1;
    this._r.t = 4;
}
