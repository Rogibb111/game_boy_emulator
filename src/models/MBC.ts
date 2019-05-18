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

    constructor(mbcType: MBCType) {
        this._type = mbcType;        
    }

    getActiveRom(): number {
        return this._activeRomBank;
    }

    getActiveRam(): number {
        return this._activeRamBank;
    }

    setActiveRomBankSet(val: number) {
        this._activeRomBank = (this._activeRomBank & 0x1F) + ((val & 3) << 5);
    }
    
    setActiveRomBank(val: number) {
        val &= 0x1F; // Isolate lowest five bits of value
        if (!val) {
            val = 1; // Default if value is 0
        }

        this._activeRomBank = (this._activeRomBank & 0x60) + val;
    }

    setActiveRam(val: number) {
        this._activeRamBank = val & 3;
    }

    setRamOn(val: number) {
        this._ramOn = ((val & 0x0F) == 0x0A) ? true : false;
    }

    getMode(): number {
        return this._mode;
    }

    setMode(val: number) {
        this._mode = val & 1;
    }
}
