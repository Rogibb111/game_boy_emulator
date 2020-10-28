import MMU from './MMU.js';
import Address from './models/data_types/Address.js';
import Registers from './models/Registers.js';
import * as Instructions  from './instructions/index.js';
import Byte from './models/data_sizes/Byte.js';
import Opcode from './models/data_types/Opcode.js';
import { InstructionMetaData } from './instructions/InstructionMetaData.js';
import Word from './models/data_sizes/Word.js';
import { RL_r8 } from './instructions/index.js';
import Logger from './logging/implementations/Logger.js';
import LoggerInterface from './logging/interfaces/Logger.js';

const flags = ['h', 'z', 'n', 'c'];

function createClock(): { m: number, t: number }  {
	return {
    	m: 0, 
    	t: 0
	};
}

function setFlagBit(val: 0 | 1, pos: number, reg: Byte): Byte {
    const valStr = val.toString();
    let regStr = reg.getVal().toString(2);
	regStr = Array(5 - regStr.length).join("0") + regStr;
    const newRegVal = regStr.substring(0,pos) + valStr + regStr.substring(pos+1);
    
    return new Byte(Number('0b' + newRegVal));
}

function createRegisters(): Registers {
	return {
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
		setZ: function (val: 0 | 1): void { this.f = setFlagBit(val, 0, this.f);  },
		setN: function (val: 0 | 1): void { this.f = setFlagBit(val, 1, this.f);  },
		setH: function (val: 0 | 1): void { this.f = setFlagBit(val, 2, this.f);  },
		setC: function (val: 0 | 1): void { this.f = setFlagBit(val, 3, this.f);  }
	} as Registers;
}

function copy(object: Object) {
    return JSON.parse(JSON.stringify(object));
}

class Z80 extends Logger implements LoggerInterface {
    /*----------------------------*\
    ||    Internal      State     ||
    \*----------------------------*/

    public _clock = createClock();

    public _r: Registers = createRegisters();

    public _map = {
        0x83: Instructions.ADDr_e,
        0x86: Instructions.ADD_A_HL,
        0xB8: Instructions.CPr_b,
        0xBE: Instructions.CP_A_HL,
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
        0xD9: Instructions.RETI,
        0x31: Instructions.LDSPnn,
        0xFA: Instructions.LD_A_NW,
        0xA8: Instructions.XOR_A_RB,
		0xA9: Instructions.XOR_A_RB,
		0xAA: Instructions.XOR_A_RB,
		0xAB: Instructions.XOR_A_RB,
		0xAC: Instructions.XOR_A_RB,
		0xAD: Instructions.XOR_A_RB,
		0xAF: Instructions.XOR_A_RB,
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
        0x1E: Instructions.LD_RB_NB,
        0x26: Instructions.LD_RB_NB,
        0x2E: Instructions.LD_RB_NB,
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
		0xF2: Instructions.LDH_A_C,
        0xE0: Instructions.LDH_NW_A,
        0xF0: Instructions.LDH_A_NW,
		0x20: Instructions.JR_cc_e8, 
        0x28: Instructions.JR_cc_e8,
        0x30: Instructions.JR_cc_e8,
        0x38: Instructions.JR_cc_e8,
        0x18: Instructions.JR_EB,
        0xC1: Instructions.POP_RW,
        0xD1: Instructions.POP_RW,
        0xE1: Instructions.POP_RW,
        0xF1: Instructions.POP_RW,
        0xC5: Instructions.PUSH_RW,
        0xD5: Instructions.PUSH_RW,
        0xE5: Instructions.PUSH_RW,
        0xF5: Instructions.PUSH_RW,
        0xC9: Instructions.RET,
        0x17: Instructions.RLA,
        0x90: Instructions.SUB_A_RB,
        0x91: Instructions.SUB_A_RB,
        0x92: Instructions.SUB_A_RB,
        0x93: Instructions.SUB_A_RB,
        0x94: Instructions.SUB_A_RB,
        0x95: Instructions.SUB_A_RB,
        0x97: Instructions.SUB_A_RB,
        0xCB: null
    };

    private _16BitInstructions = new Array(256);
	
	// Properties and Functions to Log
	properties = [
		'_r'
	];
	functions = [
		'_execute16BitInstructions',
		'executeCurrentInstruction',
		'executeInstructionAction',
		'reset'
	];

    constructor() {
		super();
		this.setupLogging();
        const ldRbRbMap = Instructions.setLoadRegToRegVal(() => Instructions.LD_RB_RB);
        
        this._map = { ...this._map, ...ldRbRbMap };

        for (let i = 0x40; i <= 0x7f; i++) {
            this._16BitInstructions[i] = Instructions.BITu3r8;
        }
        if (Array.isArray(Instructions.RL_r8.map)) {
            Instructions.RL_r8.map.forEach((reg, index) => {
                if(reg) {
                    this._16BitInstructions[0x10 + index] = Instructions.RL_r8;
                }
            });
        }
    }

    public executeCurrentInstruction(): void {
        const opcode: Opcode = MMU.rb(this._r.pc);
        let metaData: InstructionMetaData;
		
		if (opcode.getVal() === 0xCB) {
			// TODO: These are representing the 1 m cycle switch to the 16bit instruction map
			// as well as executing the 16bit instruction. If interrupts can occur between
			// these two clock cycles, I will have to change this implementaton. 
			metaData = this._16BitInstructions[MMU.rb(this._r.pc.ADD(1)).getVal()];
		} else {
			metaData = { ...this._map[opcode.getVal()] };
		}

		flags.forEach((flag: string) => {
			const flagVal = metaData[flag];
			if (flagVal) {
				const flagFunc = this._r['set' + flag.toUpperCase()];
				if (flagVal === '?') {
					flagFunc(0);	
				} else {
					flagFunc(flagVal);
				}
			}
		});

		this.executeInstructionAction(metaData, opcode);

        this._r.pc = this._r.pc.ADD(metaData.bytes).AND(65535);
        this._clock.m += metaData.m;
        this._clock.t += metaData.t;
    }

	private executeInstructionAction(metaData: InstructionMetaData, opcode: Opcode): void {
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
	}
    
    public reset(): void {
        this._clock = createClock();
        this._r = createRegisters();
        this._r.pc = new Address(0);
        this._r.sp = new Address(0);
    }
};

const instance: Z80 = new Z80();
export default instance;
