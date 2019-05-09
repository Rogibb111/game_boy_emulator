import Z80 from './Z80';
import GPU from './GPU';
import KEY from './KEY';
import MemoryBank, { BankTypes } from './models/MemoryBank';
import Address from './models/Address';


class MMU {
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
    _rom = Uint8Array = null;
    _wram: MemoryBank = new MemoryBank(BankTypes.WRAM);
    _eram: MemoryBank = new MemoryBank(BankTypes.ERAM);
    _zram: MemoryBank = new MemoryBank(BankTypes.ZRAM);
    _sram: MemoryBank = new MemoryBank(BankTypes.SRAM);
    _ie = 0;
    _if = 0;

    // MBC states
     _mbc = [];
    
    // Offset for second ROM bank
    _romoffs = 0x4000;

    // Offset for RAM bank
    _ramoffs = 0x000;

    // Copy of the ROM's cartridge-type value
    _carttype = 0;

    // Read a byte from memory
    rb(addr: Address) {
        const addrVal = addr.getVal();
        //Look at opcode of instruction (first four bits)
        switch (addrVal() & 0xF000) {
            // BIOS (256b)/ROM0
            case 0x0000:
                if (this._inbios) {
                    if (addrVal() < 0x0100) {
                        return this._bios[addrVal()];
                    } else if (Z80._r.pc === 0x0100) {
                        this._inbios = 0;
                    }
                }
                return this._rom.charCodeAt(addr);

            // ROM0
            case 0x1000:
            case 0x2000:
            case 0x3000:
                return this._rom.charCodeAt(addr);

            //ROM (switched bank)
            case 0x4000:
            case 0x5000:
            case 0x6000:
            case 0x7000:
                return this._rom.charCodeAt(this._romoffs + (addrVal() & 0x3FFF));
            
            // Graphics: VRAM (8k) 
            case 0x8000:
            case 0x9000:
                return GPU._vram.getValue(addr);

            // External RAM (8k)
            case 0xA000:
            case 0xB000:
                return this._eram.getValue(addr.ADD(this._ramoffs));

            // Working RAM (8k) 
            case 0xC000:
            case 0xD000:
                return this._wram.getValue(addr);
            // Working RAM shadow
            case 0xE000:
                return this._sram.getValue(addr);
            
            // Working RAM shadow, I/0, Zero-page RAM
            case 0xF000:
                switch (addrVal() & 0x0F00) {
                    case 0x000:
                    case 0xD00:
                        return this._wram.getValue(addr);

                    // Graphics: object attribute memory
                    // OAM is 100 bytes, remaining bytes read as 0
                    case 0xE00:
                        if(addrVal() < 0xFEA0) {
                            return GPU._oam.getValue(addr);
                        }                            
                        return 0;
                    case 0xF00:
                        if (addrVal() === 0xFFFF ) {
                            return this._ie;
                        } else if (addrVal() >= 0xFF80) {
                            return this._zram.getValue(addr);
                        } else if (addrVal() >= 0xFF40) {
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
                                            return 0;
                                    }
                                case 0x40:
                                case 0x50:
                                case 0x60:
                                case 0x70:
                                    return GPU.rb(addr);
                            }
                            return 0;
                        }

                }

        }
    }

    //Read a 16-bit word
    rw(addr: Address) {
        return this.rb(addr) + (this.rb(addr.ADD(1)) << 8);
    }

    wb(addr: Address, val: number) {
        const addrVal = addr.getVal();
        switch(addrVal & 0xF000) {
            // MBC1: External Ram Switch
            case 0x0000:
            case 0x1000:
                switch(this._carttype) {
                    case 2:
                    case 3:
                        this._mbc[1].ramon = ((val & 0x0F) == 0x0A) ? 1 : 0;
                }
                break;
            // MBC1: ROM bank
            case 0x2000:
            case 0x3000:
                switch(this._carttype) {
                    case 1:
                    case 2:
                    case 3:
                        // Set lower 5 bits of ROM bank (skipping #0)
                        val &= 0x1F;
                        if (!val) {
                            val = 1;
                        }
                        this._mbc[1].rombank = (this._mbc[1].rombank & 0x60) + val;

                        // Calculate ROM offset from bank
                        this._romoffs = this._mbc[1].rombank * 0x4000;
                        break;
                }
                break;
            case 0x4000:
            case 0x5000:
                switch(this._carttype) {
                    case 1:
                    case 2:
                    case 3:
                        if(this._mbc[1].mode) {
                            // RAM mode: Set bank
                            this._mbc[1].rambank = val & 3;
                            this._ramoffs = this._mbc[1].rambank * 0x2000;
                        } else {
                            // ROM mode: Set high bits of bank
                            this._mbc[1].rombank = (this._mbc[1].rombank & 0x1F) + ((val & 3) << 5);
                            this._romoffs = this._mbc[1].rombank * 0x4000;
                        }
                        break;
                }
                break;
            case 0x6000:
            case 0x7000:
                switch(this._carttype) {
                    case 2:
                    case 3:
                        this._mbc[1].mode = val & 1;
                        break;
                }
                break;
            // Only the VRAM case is shown:
            case 0x8000:
            case 0x9000:
                GPU._vram.setValue(addr, val);
                GPU.updateTile(addrVal, val);
                break;
            // External RAM
            case 0xA000:
            case 0xB000:
                this._eram[this._ramoffs + (addrVal & 0x1FFF)] = val;
                break;
            case 0xF000:
                switch(addrVal & 0x0F00) {
                    case 0xE00:
                        if(addrVal < 0xFEA0) {
                            GPU._oam[addrVal & 0xFF] = val;
                        }
                        GPU.buildobjdata(addrVal, val);
                        break;
                        // Zero-page
                    case 0xF00:
                        if(addrVal >= 0xFF80) {
                            this._zram[addrVal & 0x7F] = val;
                        } else {
                            // I/O 
                            switch(addrVal & 0x00F0) {
                                case 0x40:
                                case 0x50:
                                case 0x60:
                                case 0x70:
                                    GPU.wb(addrVal, val);
                                    break;
                            }
                        }
                        break;
                }
                break;
        }       
    }
    ww() { 
        /* Write 16-bit word to a given address */ 
    }

    load(rom) {
        const reader = new FileReader();

        reader.onload = () => {
            this._rom = reader.result;
        }

        reader.readAsBinaryString(rom);

        this._carttype = this._rom.charCodeAt(0x0147);
    }

    reset() {
        this._rom = null;
        this._wram = new MemoryBank(BankTypes.WRAM);
        this._eram = new MemoryBank(BankTypes.ERAM);
        this._zram = new MemoryBank(BankTypes.ZRAM);
        this._inbios = 1 ;

        //initialize MBC internal data
        this._mbc[0] = {};
        this._mbc[1] = {
            rombank: 0,     // Selected ROM bank
            rambank: 0,     // Selected RAM bank
            ramon: 0,       // RAM enable switch
            mode: 0         // ROM/RAM expansion mode
        };
        this._romoffs = 0x4000;
        this._ramoffs = 0x0000;
    }
};

const instance: MMU = new MMU();
export default instance;
