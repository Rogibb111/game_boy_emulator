import Z80 from './Z80.js';
import GPU from './GPU.js';
import KEY from './KEY.js';
import MemoryBank, { BankTypes } from './models/MemoryBank.js';
import Address from './models/data_types/Address.js';
import MBC from './models/MBC.js';
import Byte from './models/data_sizes/Byte.js';
import Word from './models/data_sizes/Word.js';
import Logger from './logging/implementations/Logger.js';
import LoggerInterface from './logging/interfaces/Logger.js';


const CART_TYPE_ADDR = new Address(0x0147);
const ERAM_SIZE_ADDR = new Address(0x0149);
// Size map is based in bytes. This is due to the Memorybank using bytes (not bits) for its bank sizes.
const ERAM_SIZE_MAP = [null, 2*1024, 8*1024, 32*1024, 128*1024, 64*1024];

class MMU extends Logger implements LoggerInterface {
    // Flag indicating BIOS is mapped in
    // BIOS is unmapped with the first instruction above 0x00FF
    _inbios = 1;

    // Memory regions (initialized at reset time)
    _bios = [
        0x31, 0xFE, 0xFF, 0xAF, 0x21, 0xFF, 0x9F, 0x32, 0xCB, 0x7C, 0x20, 0xFB, 0x21, 0x26, 0xFF, 0x0E,
        0x11, 0x3E, 0x80, 0x32, 0xE2, 0x0C, 0x3E, 0xF3, 0xE2, 0x32, 0x3E, 0x77, 0x77, 0x3E, 0xFC, 0xE0,
        0x47, 0x11, 0x04, 0x01, 0x21, 0x10, 0x80, 0x1A, 0xCD, 0x95, 0x00, 0xCD, 0x96, 0x00, 0x13, 0x7B,
        0xFE, 0x34, 0x20, 0xF3, 0x11, 0xD8, 0x00, 0x06, 0x08, 0x1A, 0x13, 0x22, 0x23, 0x05, 0x20, 0xF9,
        0x3E, 0x19, 0xEA, 0x10, 0x99, 0x21, 0x2F, 0x99, 0x0E, 0x0C, 0x3D, 0x28, 0x08, 0x32, 0x0D, 0x20,
        0xF9, 0x2E, 0x0F, 0x18, 0xF3, 0x67, 0x3E, 0x64, 0x57, 0xE0, 0x42, 0x3E, 0x91, 0xE0, 0x40, 0x04,
        0x1E, 0x02, 0x0E, 0x0C, 0xF0, 0x44, 0xFE, 0x90, 0x20, 0xFA, 0x0D, 0x20, 0xF7, 0x1D, 0x20, 0xF2,
        0x0E, 0x13, 0x24, 0x7C, 0x1E, 0x83, 0xFE, 0x62, 0x28, 0x06, 0x1E, 0xC1, 0xFE, 0x64, 0x20, 0x06,
        0x7B, 0xE2, 0x0C, 0x3E, 0x87, 0xF2, 0xF0, 0x42, 0x90, 0xE0, 0x42, 0x15, 0x20, 0xD2, 0x05, 0x20,
        0x4F, 0x16, 0x20, 0x18, 0xCB, 0x4F, 0x06, 0x04, 0xC5, 0xCB, 0x11, 0x17, 0xC1, 0xCB, 0x11, 0x17,
        0x05, 0x20, 0xF5, 0x22, 0x23, 0x22, 0x23, 0xC9, 0xCE, 0xED, 0x66, 0x66, 0xCC, 0x0D, 0x00, 0x0B,
        0x03, 0x73, 0x00, 0x83, 0x00, 0x0C, 0x00, 0x0D, 0x00, 0x08, 0x11, 0x1F, 0x88, 0x89, 0x00, 0x0E,
        0xDC, 0xCC, 0x6E, 0xE6, 0xDD, 0xDD, 0xD9, 0x99, 0xBB, 0xBB, 0x67, 0x63, 0x6E, 0x0E, 0xEC, 0xCC,
        0xDD, 0xDC, 0x99, 0x9F, 0xBB, 0xB9, 0x33, 0x3E, 0x3c, 0x42, 0xB9, 0xA5, 0xB9, 0xA5, 0x42, 0x4C,
        0x21, 0x04, 0x01, 0x11, 0xA8, 0x00, 0x1A, 0x13, 0xBE, 0x20, 0xFE, 0x23, 0x7D, 0xFE, 0x34, 0x20,
        0xF5, 0x06, 0x19, 0x78, 0x86, 0x23, 0x05, 0x20, 0xFB, 0x86, 0x20, 0xFE, 0x3E, 0x01, 0xE0, 0x50
    ];
    _rom0: MemoryBank;
    _rom1: MemoryBank;
    _wram: MemoryBank;
    _eram: MemoryBank; 
    _zram: MemoryBank;
    _sram: MemoryBank;
    _ie: Byte = new Byte(0);
    _if: Byte = new Byte(0);

    // MBC states
     _mbc: MBC; 
    
    // Copy of the ROM's cartridge-type value
    _carttype = 0;

	// Properties and Functions to Log
	properties = ['_inbios'];
	functions = [
		'rb',
		'load',
		'reset'
	];
    constructor() {
		super();
		this.setupLogging();
        this.reset();
    }

    // Read a byte from memory
    rb(addr: Address) : Byte {
        const addrVal = addr.getVal();
        //Look at opcode of instruction (first four bits)
        switch (addrVal & 0xF000) {
            // BIOS (256b)/ROM0
            case 0x0000:
                if (this._inbios) {
                    if (addrVal < 0x0100) {
                        return new Byte(this._bios[addrVal]);
                    } else if (Z80._r.pc.getVal() === 0x0100) {
                        this._inbios = 0;
                    }
                }
                return this._rom0.getValue(addr);
            // ROM0
            case 0x1000:
            case 0x2000:
            case 0x3000:
                return this._rom0.getValue(addr);

            //ROM (switched bank)
            case 0x4000:
            case 0x5000:
            case 0x6000:
            case 0x7000:
                return this._rom1.getValue(addr);
            
            // Graphics: VRAM (8k) 
            case 0x8000:
            case 0x9000:
                return GPU._vram.getValue(addr);

            // External RAM (8k)
            case 0xA000:
            case 0xB000:
                return this._eram.getValue(addr);

            // Working RAM (8k) 
            case 0xC000:
            case 0xD000:
                return this._wram.getValue(addr);
            // Working RAM shadow
            case 0xE000:
                return this._sram.getValue(addr);
            
            // Working RAM shadow, I/0, Zero-page RAM
            case 0xF000:
                switch (addrVal & 0x0F00) {
                    case 0x000:
                    case 0xD00:
                        return this._wram.getValue(addr);

                    // Graphics: object attribute memory
                    // OAM is 100 bytes, remaining bytes read as 0
                    case 0xE00:
                        if(addrVal < 0xFEA0) {
                            return GPU._oam.getValue(addr);
                        }                            
                        return new Byte(0);
                    case 0xF00:
                        if (addrVal === 0xFFFF ) {
                            return this._ie;
                        } else if (addrVal >= 0xFF80) {
                            return this._zram.getValue(addr);
                        } else if (addrVal >= 0xFF40) {
                            //GPU (64 registers)
                            return GPU.rb(addr);
                        }
                        else {
                            switch(addrVal & 0x00F0) {
                                //GPU (64 registers)
                                case 0x00:
                                    if (addrVal === 0xFF0F) {
                                        return this._if;
                                    }
                                    switch(addrVal & 0xF) {
                                        case 0:
                                            return KEY.rb();
                                        default:
                                            return new Byte(0);
                                    }
                                case 0x40:
                                case 0x50:
                                case 0x60:
                                case 0x70:
                                    return GPU.rb(addr);
                            }
                            return new Byte(0);
                        }

                }

        }
    }

    //Read a 16-bit word
    rw(addr: Address): Word {
        return new Word(this.rb(addr.ADD(1)), this.rb(addr));
    }

    wb(addr: Address, val: Byte) {
        const addrVal = addr.getVal();
        switch(addrVal & 0xF000) {
            // MBC1: External Ram Switch
            case 0x0000:
            case 0x1000:
                switch(this._carttype) {
                    case 2:
                    case 3:
                        this._mbc.setRamOn(val);
                }
                break;
            // MBC1: ROM bank
            case 0x2000:
            case 0x3000:
                switch(this._carttype) {
                    case 1:
                    case 2:
                    case 3:
                        this._mbc.setActiveRomBank(val);
                        break;
                }
                break;
            case 0x4000:
            case 0x5000:
                switch(this._carttype) {
                    case 1:
                    case 2:
                    case 3:
                        if(this._mbc.getMode()) {
                            // RAM mode: Set bank
                            this._mbc.setActiveRam(val); 
                        } else {
                            this._mbc.setActiveRomBankSet(val); 
                        }
                        break;
                }
                break;
            case 0x6000:
            case 0x7000:
                switch(this._carttype) {
                    case 2:
                    case 3:
                        this._mbc[1].mode = val.getVal() & 1;
                        break;
                }
                break;
            // Only the VRAM case is shown:
            case 0x8000:
            case 0x9000:
                GPU._vram.setValue(addr, val);
                if (addrVal < 0x97FF) {
					GPU.updateTile(addr, val);
				}
                break;
            // External RAM
            case 0xA000:
            case 0xB000:
                this._eram.setValue(addr, val);
                break;
            case 0xF000:
                switch(addrVal & 0x0F00) {
                    case 0xE00:
                        if (addrVal < 0xFEA0) {
                            GPU._oam.setValue(addr.AND(0xFF), val);
                        }
                        GPU.buildobjdata(addr, val);
                        break;
                        // Zero-page
                    case 0xF00:
                        if (addrVal >= 0xFF80) {
                            this._zram.setValue(addr, val);
                        } else {
                            // I/O 
                            switch(addrVal & 0x00F0) {
                                case 0x40:
                                case 0x50:
                                case 0x60:
                                case 0x70:
                                    GPU.wb(addr, val);
                                    break;
                            }
                        }
                        break;
                }
                break;
        }       
    }
    ww(addr: Address, val: Word): void { 
        this.wb(addr, val.getLastByte());
        this.wb(addr.ADD(1), val.getFirstByte());
    }
    /*
     * Load rom: this pulls in the Rom as an array-buffer from game file. The onload
     * callback is called when the game as loaded to said array-buffer. Then the rom 
     * is split up into two seperate banks, one bank for the first 16k of the rom (
     * the static rom bank) and one bank for the rest of the rom (which is controlled
     * by the MBC). It grabs the cartridge type from the loaded rom as well as the size 
	 * of the eRam, and create the Memory Bank Controller using the cartridge type. This
	 * is then used by the Rom and Ram classes to get info for any operations they might 
	 * carry out. The eRam is also constructed here with size dictated by the cartridge
	 * (or not if the cartridge says the size is 0).
     */ 
    load(rom) {
        const reader = new FileReader();

        reader.onload = () => {
            // Read game ROM from file and pull out the cartridge type from buffer for MBC
            const result: ArrayBuffer = <ArrayBuffer>reader.result;
            const header: Uint8Array = new Uint8Array(result.slice(0, 0x014F)); 
			const mbc: MBC = new MBC(header[CART_TYPE_ADDR.getVal()]);
			const eramSize = ERAM_SIZE_MAP[header[ERAM_SIZE_ADDR.getVal()]];
            
            this._rom0 = new MemoryBank(BankTypes.ROM0, new Uint8Array(result.slice(0, 16384)), mbc);
            this._rom1 = new MemoryBank(BankTypes.ROM1, new Uint8Array(result.slice(16385, -1)), mbc);
			this._zram = new MemoryBank(BankTypes.ZRAM);
			this._mbc = mbc;
			if (eramSize) {
				this._eram = new MemoryBank(BankTypes.ERAM, eramSize, mbc);
			}
        }

        reader.readAsArrayBuffer(rom);
    }

    reset() {
        this._rom0 = null;
        this._rom1 = null;
        this._wram = null;
        this._eram = null;
        this._zram = null;
        this._sram = null;
        this._inbios = 1 ;

        //initialize MBC internal data
        this._mbc = null;
    }
};

const instance: MMU = new MMU();
export default instance;
