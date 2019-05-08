import Address from './Address';

export enum BankTypes {
	VRAM
}

const bankSizes: Object = {
	[BankTypes.VRAM]: 8192
};

export default class MemoryBank {
	
	private _bank: ArrayBuffer;
	private _type: BankTypes;
	
	constructor(type: BankTypes) {
		this._bank = new Uint8Array(bankSizes[type]);
		this._type = type;
	}

	getValue(address: Address): number {
		return this._bank[address.getVal()];
	}
}
