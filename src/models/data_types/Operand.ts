import Byte from '../data_sizes/Byte.js';
import Nibble from '../data_sizes/Nibble.js';

export default class Operand extends Byte {
    // Constructor can take in either a number val, a plain Byte 
    // instance, or 2 Nibble instances. Passes to Byte constructor
    // which only takes number or 2 Bytes instances.
    constructor(valOrNibble: number | Byte | Nibble, nibble2?: Nibble) {
        if(valOrNibble instanceof Byte) {
            super(valOrNibble.getVal());
        } else if (typeof valOrNibble === 'number') {
            super(valOrNibble);
        } else {
            super(valOrNibble, nibble2);
        }
    }
}
