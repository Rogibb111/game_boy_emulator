// Simple model for an address to Gameboy memory.
// Each address is made up of 8 bits
// Currently only logs the address in different
// bases.
import Word from '../data_sizes/Word.js';
import Byte from '../data_sizes/Byte.js';

export default class Address extends Word {
    // Constructor can take in either a number val, a plain Word 
    // instance, or 2 Byte instances. Passes to Word constructor
    // which only takes number or 2 Bytes instances.
    constructor(valOrByte: number | Word | Byte, byte2?: Byte) {
        if(valOrByte instanceof Word) {
            super(valOrByte.getVal());
        } else if (typeof valOrByte === 'number') {
            super(valOrByte);
        } else {
            super(valOrByte, byte2);
        }
    }

   // Convience AND operator for converting one address into another.
   // Takes in either another Address or an integer value and does
   // a bitwise and to this address value.
   AND(address: number): Address;
   AND(address: Address): Address;
   AND(address: any): Address {
       const numAnd = address.getVal && address.getVal() || address;
       return new Address(this.val & numAnd);
   }

   // Convience ADD operator for adding an offest to an address
   // Takes in either another Address or an integer value and 
   // does add to this address value 
   ADD(address: number): Address;
   ADD(address: Address): Address;
   ADD(address: any): Address {
       const numAdd = address.getVal && address.getVal() || address;
       return new Address(this.val + numAdd);
   }


}
