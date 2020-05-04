import Registers from '../models/Registers.js';
import TwoByteCodeInstruction from '../models/data_types/TwoByteCodeInstruction.js';
import Opcode from '../models/data_types/Opcode.js';
import { InstructionMetaData } from './InstructionMetaData.js';

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

export const BITu3r8 = {
    m: 2,
    t: 8,
    action: ({ opcode2, _r }): void => {
        const bitNum = getBit(opcode2);
        const reg = registerMap[opcode2.getVal() & 0xF];

        if ((_r[reg] & bitNum) === 0) {
            _r.setZ(1);
        }
    },
    n: 0,
    h: 1,
    bytes: 2
} as InstructionMetaData;


