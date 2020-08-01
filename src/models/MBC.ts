/*
 * Memory Bank Controller: This is the unit that decides
 * which bank is currently in the eram and rom1 addresable
 * memory ranges. Since the cartridge may have more memory
 * than what the processor can address, the mbc's job is  
 * to divy up that memory into chunks that can fit into 
 * open ranges in the processors addressable memory. It
 * then keeps track of which chunk(bank) is currently 
 * being addressed by that open range;
 */
import Byte from './data_sizes/Byte.js';
import Logger from '../logging/implementations/Logger.js';
import LoggerInterface from '../logging/interfaces/Logger.js';

export enum MBCType{
    MBC0,
    MBC1
}

export default class MBC {
    
    private _activeRomBank = 0;
    private _activeRamBank = 0;
    private _type: MBCType;
    private _mode = 0;
    private _ramOn = false;

	// Properties and Functions to Log
	properties = [
		'_activeRomBank',
		'_activeRamBank',
		'_type',
		'_mode',
		'_ramOn'
	];
	functions = [
		'getActiveRom',
		'getActiveRam',
		'setActiveRomBank',
		'setActiveRomBankSet',
		'setActiveRam',
		'setRamOn',
		'getMode',
		'setMode'
	];

    constructor(mbcType: MBCType) {
		//super();
		//this.setupLogging();
        this._type = mbcType;        
    }

    getActiveRom(): number {
        return this._activeRomBank;
    }

    getActiveRam(): number {
        return this._activeRamBank;
    }

    setActiveRomBankSet(val: Byte): void {
        this._activeRomBank = (this._activeRomBank & 0x1F) + ((val.getVal() & 3) << 5);
    }
    
    setActiveRomBank(val: Byte): void {
        let rawVal = val.AND(0x1F).getVal(); // Isolate lowest five bits of value
        if (!rawVal) {
            rawVal = 1; // Default if value is 0
        }

        this._activeRomBank = (this._activeRomBank & 0x60) + rawVal;
    }

    setActiveRam(val: Byte): void {
        this._activeRamBank = val.AND(3).getVal();;
    }

    setRamOn(val: Byte): void {
        this._ramOn = ((val.AND(0x0F)).getVal() == 0x0A) ? true : false;
    }

    getMode(): number {
        return this._mode;
    }

    setMode(val: number) {
        this._mode = val & 1;
    }
}
