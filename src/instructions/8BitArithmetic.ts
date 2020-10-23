import Registers from '../models/Registers.js';
import Byte from '../models/data_sizes/Byte.js';
import { InstructionMetaData } from './InstructionMetaData.js';
import Address from '../models/data_types/Address.js';
import MMU from '../MMU.js';


// TODO: This needs to be removed when Add r8, r8 gets created
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

// TODO: This needs to be removed when CP r8, r8 gets created
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


export const INC_RB = {
    m: 1,
    t: 4,
    action: function ({ _r, opcode1 }) {
        const reg: string = this.map[opcode1.getVal()];
        const result: Byte = _r[reg].ADD(1);

        _r.setN(0);

        if (!result.AND(255).getVal()) {
            _r.setZ(1);
        }
        if (result.getLastNibble().getVal() > 15) {
            _r.setH(1)
        }

        _r[reg] = result.AND(255);
    },
    map: {
        0x04: 'b',
        0x0C: 'c',
        0x14: 'd',
        0x1C: 'e',
        0x24: 'h',
        0x2C: 'l',
        0x3C: 'a',
    },
    bytes: 1
} as InstructionMetaData;

export const CP_A_NB = {
    m: 2,
    t: 8,
    action: ({ _r, operand1 }) => {
        const result: Byte = _r.a.ADD(-operand1.getVal());
        
        _r.setN(1);

        if (!result.AND(255).getVal()) {
            _r.setZ(1);
        }
        if (result.getLastNibble().getVal() > 15) {
            _r.setH(1)
        }
        if (operand1.getVal() > _r.a.getVal()) {
            _r.setC(1);
        }
    },
    bytes: 2
} as InstructionMetaData;

export const DEC_RB = {
    m: 1,
    t: 4,
    action: function ({ _r, opcode1 }) {
        const reg = this.map[opcode1.getVal()];
        const result = _r[reg].ADD(-1);

		_r[reg] = result;
        _r.setN(1);

        if (!result.AND(255).getVal()) {
            _r.setZ(1);
        }
        if (result.getLastNibble().getVal() > 15) {
            _r.setH(1)
        }
    },
    map: {
        0x05: 'b',
        0x15: 'd',
        0x25: 'h',
        0x0D: 'c',
        0x1D: 'e',
        0x2D: 'l',
        0x3D: 'a'
    },
    bytes: 1
} as InstructionMetaData;

export const SUB_A_RB = {
    m: 1,
    t: 4,
    action: function({ _r, opcode1 }) {
        const reg: string = this.map[opcode1.getVal() & 0xF];
        const result = _r.a.ADD(-_r[reg].getVal());

		_r.a = result;
        _r.setN(1);

        if (!result.AND(255).getVal()) {
            _r.setZ(1);
        }
        if (result.getLastNibble().getVal() > 15) {
            _r.setH(1)
        }
        if (_r[reg].getVal() > _r.a.getVal()) {
            _r.setC(1);
        }
    },
    map: ['b', 'c', 'd', 'e', 'h', 'l', null, 'a'],
    bytes: 1
} as InstructionMetaData;

export const CP_A_HL = {
    m: 2,
    t: 8,
    action: ({ _r }): void => {
        const addr: Address = new Address(_r.h, _r.l);
        const cmprVal: number = MMU.rb(addr).getVal();
        const result: Byte = _r.a.ADD(-cmprVal);
        
        _r.setN(1);

        if (!result.AND(255).getVal()) {
            _r.setZ(1);
        }
        if (result.getLastNibble().getVal() > 15) {
            _r.setH(1)
        }
        if (cmprVal > _r.a.getVal()) {
            _r.setC(1);
        }
    },
    bytes: 1
} as InstructionMetaData;

export const ADD_A_HL = {
    m: 2,
    t: 8,
    action: ({ _r }) => {
        const addr: Address = new Address(_r.h, _r.l);
        const addend: number = MMU.rb(addr).getVal();
        const result: Byte = _r.a.ADD(addend);

        _r.setN(0);

        if (!result.AND(255).getVal()) {
            _r.setZ(1);
        }
        if (result.getLastNibble().getVal() > 15) {
            _r.setH(1)
        }
        if (addend > _r.a.getVal()) {
            _r.setC(1);
        }

        _r.a = result.AND(0x255);
    },
    bytes: 1
} as InstructionMetaData;

export const XOR_A_RB = {
	m: 1,
	t: 4,
	action: function({ _r, opcode1 }) {
        const reg: string = this.map[opcode1.getVal() & 0xF - 8]; //grab the last nibble of the byte and - 8 from it. This is because the map is for values 9-F.
        const resultVal: number = _r.a.getVal() ^ _r[reg].getVal();
		const result = new Byte(resultVal); 

        if (!result.AND(255).getVal()) {
            _r.setZ(1);
        }
        _r.setN(0);
		_r.setH(0)
		_r.setC(0);
	},
	map: ['b', 'c', 'd', 'e', 'h', 'l', null, 'a'],
	bytes: 1
};
