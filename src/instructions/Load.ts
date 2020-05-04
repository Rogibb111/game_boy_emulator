import MMU from '../MMU.js';
import Address from '../models/data_types/Address.js';
import Registers from '../models/Registers.js';
import Instruction from '../models/data_types/Instruction.js';
import Opcode from '../models/data_types/Opcode.js';
import Byte from '../models/data_sizes/Byte.js';

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

// Read a byte from absolute location into A (LD A, addr)
export function LD_A_NW(_r: Registers) {
    const addr: Address = new Address(MMU.rw(_r.pc));     // Get address from instr
    
    _r.pc = this._r.pc.ADD(2);                            // Advance PC
    _r.a = MMU.rb(addr);                                  // Read from address
    _r.m = 4;                                             // 4 M-times taken
    _r.t=16;                 
}

export function LD_HLD_A(_r: Registers) {
    const addr: Address = new Address(_r.h, _r.l);
    const newAddr: Address = addr.ADD(-1);
    
    _r.h = newAddr.getFirstByte();
    _r.l = newAddr.getLastByte();
    
    MMU.wb(addr, _r.a);
    _r.m = 2;
    _r.t = 8;
}

export function LD_RW_NW(_r: Registers, instruction: Instruction) {
    const opcode: Opcode = instruction.getFirstByte();
    const [upper, lower] = WORD_REGISTER_MAP[opcode.getVal()];
    
    _r[lower] = MMU.rb(_r.pc);
    _r[upper] = MMU.rb(_r.pc.ADD(1));
    _r.pc = _r.pc.ADD(2);
    _r.m = 3;
    _r.t = 12;
}

export function LD_RB_NB(_r: Registers, instruction: Instruction) {
    const opcode: Opcode = instruction.getFirstByte();
    const reg = BYTE_REGISTER_MAP[opcode.getVal()];
    const operand: Byte = instruction.getLastByte();

    _r[reg] = operand;
    _r.m = 2;
    _r.t = 8;
}

export function LDH_C_A(_r: Registers) {
    MMU.wb(new Address(0xFF00).ADD(_r.c.getVal()), _r.a);

    _r.m = 2;
    _r.t = 8;
}
