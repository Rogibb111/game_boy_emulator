// Simple model for an address to Gameboy memory.
// Each address is made up of 8 bits
// Currently only logs the address in different
// bases.

export default class Address {
    _val = null;
    
    constructor(address: number) {
        this._val = address;
    }

    getVal() {
        return this._val;
    }

    printHex() {
        console.log(this._val.toString(16));
    }

    printDec() {
        console.log(this._val.toString());
    }

    printBin() {
        console.log(this._val.toString(2));
    }

   // Convience AND operator for converting one address into another.
   // Takes in either another Address or an integer value and does
   // a bitwise and to this address value.
   AND(address: number): Address;
   AND(address: Address): Address;
   AND(address: any): Address {
       const numAnd = address.getVal && address.getVal() || address;
       return new Address(this._val & numAnd);
   }

   // Convience ADD operator for adding an offest to an address
   // Takes in either another Address or an integer value and 
   // does add to this address value 
   ADD(address: number): Address;
   ADD(address: Address): Address;
   ADD(address: any): Address {
       const numAdd = address.getVal && address.getVal() || address;
       return new Address(this._val + numAdd);
   }


}
