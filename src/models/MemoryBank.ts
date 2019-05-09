import Address from './Address';

export enum BankTypes {
	VRAM,
	WRAM,
	SRAM,
	ERAM,
	ZRAM
}

const bankProps: Object = {
	[BankTypes.VRAM]: { size: 8192, offset: 0x8000 },
	[BankTypes.ERAM]: { size: 8192, offset: 0xA000 },
	[BankTypes.WRAM]: { size: 8192, offset: 0xC000 },
	[BankTypes.SRAM]: { size: 7679, offset: 0xE000 }
};

export default class MemoryBank {
	
	private _bank: ArrayBuffer;
    private _offset: number;
	
	constructor(type: BankTypes) {
        const { size, offset } = bankProps[type];
		this._bank = new Uint8Array(size);
        this._offset = offset;
	}

	getValue(address: Address): number {
		return this._bank[address.getVal() - this._offset];
    }
}
