import MMU from 'MMU';
import Address from 'models/Address';
import Registers from 'models/Registers';
import * as Instructions  from 'instructions/index';
const _clock = {
    m: 0, 
    t: 0
};

const _r = {
    a: 0,
    b: 0,
    c: 0,
    d: 0,
    e: 0,
    l: 0,
    f: 0,
    h: 0,
    pc: new Address(0),
    sp: new Address(0),
    m: 0,
    t: 0,
    ime: 0
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
        0xF3: Instructions.DI,
        0xFB: Instructions.EI,
        0x3E: Instructions.LDAn,
        0x00: Instructions.NOP,
        0xE1: Instructions.POPHL,
        0xC5: Instructions.PUSHBC,
        0xD9: Instructions.RETI,
        0x31: Instructions.LDSPnn,
        0xAF: Instructions.XORA,
        0x21: Instructions.LDHLnn,
        0xCB: this._execute16BitInstruction
    };

    private _16BitInstructions = new Array(256);

    constructor() {
        for (let i = 0x40; i <= 0x7f; i++) {
            this. _16BitInstructions[i] = Instructions.BITu3r8;
        }
    }

    private _execute16BitInstruction(_r, instruction) {
        const second_operand = instruction & 0xFF;
        this. _16BitInstructions[second_operand](_r, instruction);
    }
    
    public reset() {
        this._clock = copy(_clock);
        this._r = copy(_r);
        this._r.pc = new Address(0);
        this._r.sp = new Address(0);
    }
};

const instance: Z80 = new Z80();
export default instance;
