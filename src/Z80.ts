import MMU from 'MMU';
import Address from 'models/data_types/Address';
import Registers from 'models/Registers';
import * as Instructions  from 'instructions/index';
import Byte from './models/data_sizes/Byte.js';
import Opcode from './models/data_types/Opcode.js';
import { InstructionMetaData } from './instructions/InstructionMetaData.js';
import Word from './models/data_sizes/Word.js';

const _clock = {
    m: 0, 
    t: 0
};

function setFlagBit(val: 0 | 1, pos: number, reg: Byte): Byte {
    const valStr = val.toString();
    const regStr = reg.getVal().toString(2);
    const newRegVal = regStr.substring(0,pos) + valStr + regStr.substring(pos+1);
    
    return new Byte(Number('0b' + newRegVal));
}

const _r = {
    a: new Byte(0),
    b: new Byte(0),
    c: new Byte(0),
    d: new Byte(0),
    e: new Byte(0),
    l: new Byte(0),
    f: new Byte(0),
    h: new Byte(0),
    pc: new Address(0),
    sp: new Address(0),
    m: 0,
    t: 0,
    ime: 0,
    setZ: (val: 0 | 1): void => { this.f = setFlagBit(val, 0, this.f);  },
    setN: (val: 0 | 1): void => { this.f = setFlagBit(val, 1, this.f);  },
    setH: (val: 0 | 1): void => { this.f = setFlagBit(val, 2, this.f);  },
    setC: (val: 0 | 1): void => { this.f = setFlagBit(val, 3, this.f);  }
} as Registers;

function copy(object: Object) {
    return JSON.parse(JSON.stringify(object));
}

class Z80 {
    /*----------------------------*\
    ||    Internal      State     ||
    \*----------------------------*/

    public _clock = copy(_clock);

    public _r: Registers = copy(_r);

    public _map = {
        0x83: Instructions.ADDr_e,
        0xB8: Instructions.CPr_b,
        0xFE: Instructions.CP_A_NB,
        0xCD: Instructions.CALL_NW,
        0x05: Instructions.DEC_RB, 
        0x15: Instructions.DEC_RB,
        0x25: Instructions.DEC_RB,
        0x0D: Instructions.DEC_RB,
        0x1D: Instructions.DEC_RB,
        0x2D: Instructions.DEC_RB,
        0x3D: Instructions.DEC_RB,
        0xF3: Instructions.DI,
        0xFB: Instructions.EI,
        0x00: Instructions.NOP,
        0xE1: Instructions.POPHL,
        0xC5: Instructions.PUSHBC,
        0xD9: Instructions.RETI,
        0x31: Instructions.LDSPnn,
        0xFA: Instructions.LD_A_NW,
        0xAF: Instructions.XORA,
        0x03: Instructions.INC_NW,
        0x13: Instructions.INC_NW,
        0x23: Instructions.INC_NW,
        0x04: Instructions.INC_RB, 
        0x0C: Instructions.INC_RB,
        0x14: Instructions.INC_RB,
        0x1C: Instructions.INC_RB,
        0x24: Instructions.INC_RB,
        0x2C: Instructions.INC_RB,
        0x3C: Instructions.INC_RB,
        0x0A: Instructions.LD_A_RW,
        0x1A: Instructions.LD_A_RW,
        0xEA: Instructions.LD_NW_A,
        0x01: Instructions.LD_RW_NW,
        0x11: Instructions.LD_RW_NW,
        0x21: Instructions.LD_RW_NW,
        0x06: Instructions.LD_RB_NB,
        0x0E: Instructions.LD_RB_NB,
        0x16: Instructions.LD_RB_NB,
        0x26: Instructions.LD_RB_NB,
        0x2E: Instructions.LD_RB_NB,
        0x36: Instructions.LD_RB_NB,
        0x3E: Instructions.LD_RB_NB,
        0x70: Instructions.LD_HL_RB,
        0x71: Instructions.LD_HL_RB,
        0x72: Instructions.LD_HL_RB,
        0x73: Instructions.LD_HL_RB,
        0x74: Instructions.LD_HL_RB,
        0x75: Instructions.LD_HL_RB,
        0x77: Instructions.LD_HL_RB,
        0x32: Instructions.LD_HLD_A,
        0x22: Instructions.LD_HLP_A,
        0xE2: Instructions.LDH_C_A,
        0xE0: Instructions.LDH_NW_A,
        0x20: Instructions.JR_cc_e8, 
        0x28: Instructions.JR_cc_e8,
        0x30: Instructions.JR_cc_e8,
        0x38: Instructions.JR_cc_e8,
        0x18: Instructions.JR_EB,
        0x90: Instructions.SUB_A_RB,
        0x91: Instructions.SUB_A_RB,
        0x92: Instructions.SUB_A_RB,
        0x93: Instructions.SUB_A_RB,
        0x94: Instructions.SUB_A_RB,
        0x95: Instructions.SUB_A_RB,
        0x97: Instructions.SUB_A_RB,
        0xCB: this._execute16BitInstruction
    };

    private _16BitInstructions = new Array(256);

    constructor() {
        const ldRbRbMap = Instructions.setLoadRegToRegVal(() => Instructions.LD_RB_RB);
        
        this._map = { ...this._map, ...ldRbRbMap };

        for (let i = 0x40; i <= 0x7f; i++) {
            this. _16BitInstructions[i] = Instructions.BITu3r8;
        }
    }

    private _execute16BitInstruction(_r, instruction): void {
        const second_operand = instruction & 0xFF;
        this. _16BitInstructions[second_operand](_r, instruction);
    }

    public executeCurrentInstruction(): void {
        const opcode: Opcode = MMU.rb(this._r.pc);
        const metaData: InstructionMetaData = { ...this._map[opcode.getVal()] };
        
        if (metaData.action) {
            switch(metaData.bytes - 1) {
                case 0: 
                    metaData.action({ 
                        _r: this._r,
                        opcode1: opcode 
                    });
                    break;
                case 1: 
                    const byte1: Byte = MMU.rb(this._r.pc.ADD(1));
                    metaData.action({ 
                        _r: this._r,
                        opcode1: opcode,
                        opcode2: byte1,
                        operand1: byte1 
                    });
                    break;
                case 2:
                    const word: Word = MMU.rw(this._r.pc.ADD(1));
                    metaData.action({
                        _r: this._r,
                        opcode1: opcode,
                        opcode2: word.getFirstByte(),
                        operand1: word.getFirstByte(),
                        operand2: word.getLastByte()
                    })
                    break;
                default:
            }
        }
        this._r.pc = this._r.pc.ADD(metaData.bytes).AND(65535);
        this._clock.m += metaData.m;
        this._clock.t += metaData.t;
    }
    
    public reset(): void {
        this._clock = copy(_clock);
        this._r = copy(_r);
        this._r.pc = new Address(0);
        this._r.sp = new Address(0);
    }
};

const instance: Z80 = new Z80();
export default instance;
