export class Address {
    _address = null;
    
    constructor(address: number) {
        this._address = address;
    }

    printHex() {
        console.log(this._address.toString(16));
    }

    printDec() {
        console.log(this._address.toString());
    }

    printBin() {
        console.log(this._address.toString(2));
   }
}