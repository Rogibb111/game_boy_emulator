// Disable IME
export function DI(_r) {
    _r.ime = 0;
    _r.m = 1;
    _r.t = 4;
}

// Enable IME
export function EI(_r) {
    _r.ime = 1;
    _r.m = 1;
    _r.t = 4;
}

// No-opertation (NOP)
export function NOP() {
    this._r.m = 1; // 1 M-time take
    this._r.t = 4; 
}