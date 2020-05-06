import MMU from '../MMU.js';
import Address from '../models/data_types/Address.js';
import Registers from '../models/Registers.js';
import Instruction from '../models/data_types/Instruction.js';
import Opcode from '../models/data_types/Opcode.js';
import Byte from '../models/data_sizes/Byte.js';
import { InstructionMetaData } from './InstructionMetaData.js';

const WORD_REGISTER_MAP = {
    0x01: ['b', 'c'],
    0x11: ['d', 'e'],
    0x21: ['h', 'l']
};

const BYTE_REGISTER_MAP = {
    0x06: 'b',
    0x0E: 'd',
    0x16: 'h',
    0x26: 'c',
    0x2E: 'e',
    0x36: 'l',
    0x3E: 'a'
};

const BYTE_HL_REGISTER_MAP = {
    0x70: 'b',
    0x71: 'c',
    0x72: 'd',
    0x73: 'e',
    0x74: 'h',
    0x75: 'l',
    0x77: 'a'
};

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
}

export const LD_RW_NW = {
    m: 3,
    t: 12,
    action: ({ _r , opcode1, operand1, operand2 }): void  => {
        const [upper, lower] = WORD_REGISTER_MAP[opcode1.getVal()];
    
        _r[lower] = MMU.rb(operand1);
        _r[upper] = MMU.rb(operand2);
    },
    bytes: 3
}

export const LD_RB_NB = {
    m: 2,
    t: 8,
    action: ({ _r, opcode1, operand1 }) => {
        const reg = BYTE_REGISTER_MAP[opcode1.getValue()];

        _r[reg] = operand1;
    },
    bytes: 2
};

export function LDH_C_A(_r: Registers) {
    MMU.wb(new Address(0xFF00).ADD(_r.c.getVal()), _r.a);

    _r.m = 2;
    _r.t = 8;
}

export function LD_HL_RB(_r: Registers, instruction: Instruction) {
    const addr: Address = new Address(_r.h, _r.l);
    const reg: string = BYTE_HL_REGISTER_MAP[instruction.getFirstByte().getVal()];

    MMU.wb(addr, _r[reg]);    
}
