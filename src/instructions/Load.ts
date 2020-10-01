import MMU from '../MMU.js';
import Address from '../models/data_types/Address.js';
import { InstructionMetaData } from './InstructionMetaData.js';
import Word from '../models/data_sizes/Word.js';
import Operand from '../models/data_types/Operand.js';

// Read a byte from absolute location into A (LD A, addr)
export const LD_A_NW = {
    m: 4,
    t: 16,
    action: ({ _r, operand1, operand2 }) => {
        const addr = new Address(operand2, operand1);
        _r.a = MMU.rb(addr);
    },
    bytes: 3
} as InstructionMetaData;

export const LD_HLD_A = {
    m: 2,
    t: 8,
    action: ({ _r }): void => {        
        const addr: Address = new Address(_r.h, _r.l);
        const newAddr: Address = addr.ADD(-1);

        _r.h = newAddr.getFirstByte();
        _r.l = newAddr.getLastByte();

        MMU.wb(addr, _r.a);
    },
    bytes: 1
} as InstructionMetaData;

export const LD_RW_NW = {
    m: 3,
    t: 12,
    action: function ({ _r , opcode1, operand1, operand2 }): void {
        const [upper, lower] = this.map[opcode1.getVal()];

        _r[lower] = operand2.COPY();
        _r[upper] = operand1.COPY();
    },
    map: {
        0x01: ['b', 'c'],
        0x11: ['d', 'e'],
        0x21: ['h', 'l']
    },
    bytes: 3
} as InstructionMetaData; 

export const LD_RB_NB = {
    m: 2,
    t: 8,
    action: function ({ _r, opcode1, operand1 }): void {
        const reg = this.map[opcode1.getVal()];

        _r[reg] = operand1.COPY();
    },
    map: {
        0x06: 'b',
        0x0E: 'd',
        0x16: 'h',
        0x26: 'c',
        0x2E: 'e',
        0x36: 'l',
        0x3E: 'a'
    },
    bytes: 2
} as InstructionMetaData; 

export const LDH_C_A = {
    m: 2,
    t: 8,
    action: ({ _r }) => {
        MMU.wb(new Address(0xFF00).ADD(_r.c.getVal()), _r.a);
    },
    bytes: 1
} as InstructionMetaData;

export const LD_HL_RB = {
    m: 2,
    t: 8,
    action: function ({ _r, opcode1 }): void {
        const addr: Address = new Address(_r.h, _r.l);
        const reg: string = this.map[opcode1.getVal()];

        MMU.wb(addr, _r[reg]);    
    },
    map: {
        0x70: 'b',
        0x71: 'c',
        0x72: 'd',
        0x73: 'e',
        0x74: 'h',
        0x75: 'l',
        0x77: 'a'
    },
    bytes: 1
} as InstructionMetaData;

export const LDH_NW_A = {
    m: 3,
    t: 12,
    action:({ _r, operand1 }): void => {
        const address: Address = new Address(0xFF00).ADD(operand1.getVal());

        MMU.wb(address, _r.a);
    },
    bytes: 2
} as InstructionMetaData;

const upper = {
    4: ['b', 'c'],
    5: ['d', 'e'],
    6: ['h', 'l'],
    7: [null, 'a']
};

const lower = ['b', 'c', 'd', 'e', 'h', 'l', null, 'a'];

export function setLoadRegToRegVal(setFunc): Object {
    const map = {};
    Object.keys(upper).forEach((upperStr) => {
        upper[upperStr].forEach((upperVal, upperIndex) => {
            if(upperVal){
                lower.forEach((lowerVal, lowerIndex) => {
                    if(lowerVal) {
                        const lowerHalf = upperIndex ? lowerIndex + 8 : lowerIndex;
                        map[Number(upperStr) << 4 + lowerHalf] = setFunc(upperVal, lowerVal); 
                    }
                });
            }
        });
    });
    return map;
}

export const LD_RB_RB = {
    m: 1,
    t: 4,
    action: function ({ _r, opcode1 }): void {
        const [to, from] = this.map[opcode1.getVal()];

        _r[to] = _r[from];
    },
    map: setLoadRegToRegVal((regTo: string, regFrom: string) => [regTo, regFrom]),
    bytes: 1
} as InstructionMetaData;

export const LD_A_RW = {
    m: 2,
    t: 8,
    action: function({ _r, opcode1 }): void {
        const [upper, lower] = this.map[opcode1.getVal() >> 4];
        const address: Address = new Address(_r[upper], _r[lower]);

        _r.a = MMU.rb(address);
    },
    map: ['bc', 'de'],
    bytes: 1
} as InstructionMetaData;

export const LD_HLP_A = {
    m: 2,
    t: 8,
    action: ({ _r }): void => {
        const address = new Address(_r.h, _r.l);
        const newAddr = address.ADD(1);
        MMU.wb(address, _r.a);

        _r.h = newAddr.getFirstByte();
        _r.l = newAddr.getLastByte();
    },
    bytes: 1   
} as InstructionMetaData;

export const LD_NW_A = {
    m: 4,
    t: 16,
    action: ({ _r, opcode1, opcode2 }) => {
        const addr: Address = new Address(opcode1, opcode2);

        MMU.wb(addr, _r.a);
    },
    bytes: 3
} as InstructionMetaData;
