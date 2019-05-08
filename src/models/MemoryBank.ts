import Address from './Address';

export default class MemoryBank {
	private _bank: ArrayBuffer;

	constructor(size: number) {
		this._bank = new Uint8Array(size);
	}

	getValue(address: Address): number {
		return this._bank[address.getVal()];
	}
}
