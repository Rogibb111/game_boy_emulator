/*
 * Memory Bank: A class for simulating the different types
 * of memory in the GameBoy. It is used by creating a new
 * instance and passing in one of the bank-types from the 
 * exported enums. Then you can read and write to the 
 * bank using Addresses. 
 */

import Address from './Address';
import MBC from './MBC';
/*
 * An enum to represent all of the different types of memory.
 * Used as an argument to the MemoryBank class.
 */
export enum BankTypes {
    VRAM,
    WRAM,
    SRAM,
    ERAM,
    ZRAM,
    OAM,
    ROM0,
    ROM1
}

/*
 * A map used by the MemoryBank constructor to fill in some
 * of the properies of each memory type. These props are 
 * needed when conducting read and writes.
 */
const bankProps: Object = {
    [BankTypes.VRAM]: { bankSize: 8192, offset: 0x8000 },
    [BankTypes.ERAM]: { bankSize: 8192, offset: 0xA000 },
    [BankTypes.WRAM]: { bankSize: 8192, offset: 0xC000 },
    [BankTypes.SRAM]: { bankSize: 7679, offset: 0xE000 },
    [BankTypes.ZRAM]: { bankSize: 127, offset: 0xFF89 },
    [BankTypes.OAM]: { bankSize: 149, offset: 0xFE00 },
    [BankTypes.ROM0]: { bankSize: 16384, offset: 0x0000 },
    [BankTypes.ROM1]: { bankSize: 16384, offset: 0x4000 }
};

export default class MemoryBank {
	
    private _bank: ArrayBuffer | ArrayBuffer[]; // Either single bank or an array of banks
    private _offset: number; // The first address in memory that this bank starts to represent
    private _numOfBanks: number = 0; // For ERAM and ROM, detirmines the number of banks 
    private _mbc: MBC = null; // For ERAM and ROM, memory bank controller
    private _type: BankTypes; //Store the type of bank
    /*
     * Constructor can take in either just a bank-type for regular dedicated ram (working ram,
     * I/O registers, etc), a bank-type and size if its the ERAM, or a bank-type and a Uint8array
     * with Rom data. The last two are special cases because the can be manipulated by the MBC.
     * Because of that, they have multiple banks that either need to be initialized with typed
     * arrays, or with acutal rom data (in typed arrays);
     */
    constructor(bankType: BankTypes); // Most types
    constructor(bankType: BankTypes, size: number, mbc: MBC); // ERAM
    constructor(bankType: BankTypes, rom: Uint8Array, mbc: MBC); //ROM
    constructor(bankType: any, size?: any, rom?: any, mbc?: any) {
        const { bankSize, offset } = bankProps[bankType];

        switch(bankType) {
            case BankTypes.ERAM:
                this._numOfBanks = Math.ceil(size / bankSize);
                this._bank = new Array(this._numOfBanks);
                this._mbc = mbc;
                
                for (let bankNum = 0; bankNum < this._numOfBanks; bankNum += 1) {
                    this._bank[bankNum] = new Uint8Array(bankSize);
                }   
                break;
            case BankTypes.ROM0:
                this._bank = rom;
                break;
            case BankTypes.ROM1:
                this._numOfBanks = Math.ceil(rom.length / bankSize);
                this._bank = new Array(this._numOfBanks);
                this._mbc = mbc;
                
                for (let bankNum = 0; bankNum < this._numOfBanks; bankNum += 1) {
                    const start = (bankNum * bankSize) + offset;
                    const end = (start + bankSize);
                    
                    this._bank[bankNum] = rom.slice(start, end);
                }   
                break;
            default:
                this._bank = new Uint8Array(bankSize);
        }
        this._offset = offset;
        this._type = bankType;
    }

    getValue(address: Address): number {
        const bank = this.getBank();
        return bank[address.getVal() - this._offset];
    }
    
    setValue(address: Address, val: number): void {
        const bank = this.getBank();
        bank[address.getVal()-this._offset] = val;
    }

    private getBank(): Uint8Array {
        if (this._type === BankTypes.ROM1) {
            return this._bank[this._mbc.getActiveRom()];
        } else if (this._type === BankTypes.ERAM) {
            return this._bank[this._mbc.getActiveRam()];
        } else {
            return <Uint8Array>this._bank;
        }
    }
}
