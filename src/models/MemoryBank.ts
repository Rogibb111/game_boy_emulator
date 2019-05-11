import Address from './Address';

export enum BankTypes {
    VRAM,
    WRAM,
    SRAM,
    ERAM,
    ZRAM,
    OAM
}

const bankProps: Object = {
    [BankTypes.VRAM]: { bankSize: 8192, offset: 0x8000 },
    [BankTypes.ERAM]: { bankSize: 8192, offset: 0xA000 },
    [BankTypes.WRAM]: { bankSize: 8192, offset: 0xC000 },
    [BankTypes.SRAM]: { bankSize: 7679, offset: 0xE000 },
    [BankTypes.ZRAM]: { bankSize: 127, offset: 0xFF89 },
    [BankTypes.OAM]: { bankSize: 149, offset: 0xFE00 }

};

export default class MemoryBank {
	
    private _bank: ArrayBuffer | ArrayBuffer[];
    private _offset: number;
    private _numOfBanks: number = 0;
    private _activeBank: number = 0;

    constructor(bankType: BankTypes);
    constructor(bankType: BankTypes, size: number);
    constructor(bankType: any, size?: any) {
        const { bankSize, offset } = bankProps[bankType];

        if (size) {
            this._numOfBanks = Math.ceil(size / bankSize);
            this._bank = new Array(this._numOfBanks);
            
            for (let x = 0; x < this._numOfBanks; x += 1) {
                this._bank[x] = new Uint8Array(bankSize);
            }
        } else {
            this._bank = new Uint8Array(bankSize);
        }
        
        this._offset = offset;
    }

    getValue(address: Address): number {
        const bank = this.getBank();
        return bank[address.getVal() - this._offset];
    }
    
    setValue(address: Address, val: number): void {
        const bank = this.getBank();
        bank[address.getVal()-this._offset] = val;
    }

    setActiveBank(actveBank: number): void {
        this._activeBank = actveBank;
    }

    private getBank(): Uint8Array {
        return this._numOfBanks ? this._bank[this._activeBank] : this._bank;
    }
}
