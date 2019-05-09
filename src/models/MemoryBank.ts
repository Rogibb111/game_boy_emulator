import Address from './Address';

export enum BankTypes {
	VRAM
}

const bankProps: Object = {
	[BankTypes.VRAM]: { size: 8192, offset: 8000 }
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
