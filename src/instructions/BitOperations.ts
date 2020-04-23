function getBit(halfOp) {
    switch(halfOp) {
        case halfOp >= 0x40 && halfOp <= 0x47:
            return 0x01;
        case halfOp >= 0x48 && halfOp <= 0x4f:
            return 0x02;
        case halfOp >= 0x50 && halfOp <= 0x57:
            return 0x04;
        case halfOp >= 0x58 && halfOp <= 0x5f:
            return 0x08;
        case halfOp >= 0x60 && halfOp <= 0x67:
            return 0x10;
        case halfOp >= 0x68 && halfOp <= 0x6f:
            return 0x20;
        case halfOp >= 0x40 && halfOp <= 0x47:
            return 0x40;
        case halfOp >= 0x40 && halfOp <= 0x47:
            return 0x80;
    }
}

let registerMap = ['b', 'c', 'd', 'e', 'h', 'l', 'hl', 'a'];
registerMap = registerMap.concat(registerMap);

export function BITu3r8(_r, instruction) {
    const opcode = instruction >> 8;
    const bitNum = getBit(opcode & 0xFF);
    const reg = registerMap[opcode & 0xF];
    
    if ((_r[reg] & bitNum) === 0) {
        _r.f = _r.f | 0x80;
    }
    _r.f = (_r.f | 0x20) & 0xB0;

    _r.m = 2;
    _r.t = 8;
}


