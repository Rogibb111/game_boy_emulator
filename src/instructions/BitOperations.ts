import Registers from '../models/Registers.js';
import TwoByteCodeInstruction from '../models/data_types/TwoByteCodeInstruction.js';
import Opcode from '../models/data_types/Opcode.js';

function getBit(opcode: Opcode) {
    const opVal = opcode.getVal();

    if (opVal >= 0x40 && opVal <= 0x47) {
            return 0x01;
    } else if (opVal >= 0x48 && opVal <= 0x4f) {
            return 0x02;
    } else if (opVal >= 0x50 && opVal <= 0x57) {
            return 0x04;
    } else if (opVal >= 0x58 && opVal <= 0x5f) {
            return 0x08;
    } else if (opVal >= 0x60 && opVal <= 0x67) {
            return 0x10;
    } else if (opVal >= 0x68 && opVal <= 0x6f) {
            return 0x20;
    } else if (opVal >= 0x40 && opVal <= 0x47) {
            return 0x40;
    } else if (opVal >= 0x40 && opVal <= 0x47) {
            return 0x80;
    }
}

let registerMap = ['b', 'c', 'd', 'e', 'h', 'l', 'hl', 'a'];
registerMap = registerMap.concat(registerMap);

export function BITu3r8(_r: Registers, instruction: TwoByteCodeInstruction) {
    const opcode: Opcode = instruction.getLastByte();
    const bitNum = getBit(opcode);
    const reg = registerMap[opcode.getVal() & 0xF];
    
    if ((_r[reg] & bitNum) === 0) {
        _r.f = _r.f.OR(0x80);
    }
    _r.f = _r.f.OR(0x20).AND(0xB0);

    _r.m = 2;
    _r.t = 8;
}


