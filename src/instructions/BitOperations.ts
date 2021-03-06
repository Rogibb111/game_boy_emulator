import Registers from '../models/Registers.js';
import TwoByteCodeInstruction from '../models/data_types/TwoByteCodeInstruction.js';
import Opcode from '../models/data_types/Opcode.js';
import { InstructionMetaData } from './InstructionMetaData.js';
import Byte from '../models/data_sizes/Byte.js';

let registerMap = ['b', 'c', 'd', 'e', 'h', 'l', 'hl', 'a'];
// Double the register map array because the 16bit instruction matrix uses
// the entire upper half of the opcode (0x0 - 0xF) to detirmine which register
// the instructions are going to affect, repeating when it gets to 0x8
registerMap = registerMap.concat(registerMap); 

export const BITu3r8 = {
    m: 2,
    t: 8,
    action: function ({ opcode2, _r }): void {
        const bitNum = this.map(opcode2);
        const reg = registerMap[opcode2.getVal() & 0xF];

        if ((_r[reg].getVal() & bitNum) === 0) {
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
        } else if (opVal >= 0x70 && opVal <= 0x77) {
            return 0x40;
        } else if (opVal >= 0x78 && opVal <= 0x7f) {
            return 0x80;
        }
    },
    n: 0,
    h: 1,
	z: '?',
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
        const result = new Byte(parseInt(byte.join(''), 2));

        if (!result.AND(255).getVal()) {
        	_r.setZ(1);
		}
		_r.setC(newCarry === '0' ? 0 : 1);

		_r[reg] = result;
    },
    map: ['b', 'c', 'd', 'e', 'h', 'l', null, 'a'],
    z: '?',
	n: 0,
	h: 0,
	c: '?',
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
		
		_r.setC(newCarry === '0' ? 0 : 1);

		_r.a = result;
	},
	z: 0,
	n: 0,
	h: 0,
	c: '?',
	bytes: 1
};


