import Address from './data_types/Address.js';
import Byte from './data_sizes/Byte.js';

export default interface Registers {
    // 8-bit Registers
    a: Byte,
    b: Byte,
    c: Byte,
    d: Byte,
    e: Byte,
    l: Byte,
    h: Byte,
    // flag register
    f: Byte,
    // 16 bit registers
    pc: Address,
    sp: Address,
    // clock for last instructions
    m: number,
    t: number,
    // interupt master enable
    ime: number
}
