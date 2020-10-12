import Registers from '../models/Registers.js';
import TwoByteCodeInstruction from '../models/data_types/TwoByteCodeInstruction.js';
import Opcode from '../models/data_types/Opcode.js';
import { InstructionMetaData } from './InstructionMetaData.js';
import Byte from '../models/data_sizes/Byte.js';

let registerMap = ['b', 'c', 'd', 'e', 'h', 'l', 'hl', 'a'];
registerMap = registerMap.concat(registerMap);

export const BITu3r8 = {
    m: 2,
    t: 8,
    action: function ({ opcode2, _r }): void {
        const bitNum = this.map(opcode2);
        const reg = registerMap[opcode2.getVal() & 0xF];

        if ((_r[reg] & bitNum) === 0) {
            _r.setZ(1);
        }
    },
    map: function (opcode: Opcode): number {
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
    },
    n: 0,
    h: 1,
    bytes: 2
} as InstructionMetaData;

export const RL_r8 = {
    m: 2,
    t: 8,
    action: function ({ _r, opcode2 }): void {
        const reg: string = this.map[opcode2.AND(0x1).getVal()];

        const byte: string[] = _r[reg].getVal().toString(2).split("");
        const carry: string = (_r.f.AND(0x10).getVal() >> 4).toString(2);
        const newCarry: string = byte.shift();
        
        byte.push(carry);
        const result = new Byte(Number(byte.join('')));

		_r.setH(0);
		_r.setN(0);

        if (!result.AND(255).getVal()) {
        	_r.setZ(1);
		}
		_r.setC(newCarry === '0' ? 0 : 1);

		_r[reg] = result;
    },
    map: ['b', 'c', 'd', 'e', 'h', 'l', null, 'a'],
    bytes: 2
} as InstructionMetaData;

export const RLA = {
	m: 1,
	t: 4,
	action: ({ _r }): void => {
		const byte: string[] = _r.a.getVal().toString(2).split("");
        const carry: string = (_r.f.AND(0x10).getVal() >> 4).toString(2);
		const newCarry: string = byte.shift();
		
		byte.push(carry);
		const result = new Byte(parseInt(byte.join(''), 2));
		
		_r.setH(0);
		_r.setN(0);
		_r.setZ(0);
		_r.setC(newCarry === '0' ? 0 : 1);

		_r.a = result;
	},
	bytes: 1
};


