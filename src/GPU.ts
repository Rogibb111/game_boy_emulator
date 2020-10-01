import Address from './models/data_types/Address.js';
import Z80 from './Z80.js';
import MemoryBank, { BankTypes } from './models/MemoryBank.js';
import Byte from './models/data_sizes/Byte.js';
import Logger from './logging/implementations/Logger.js';
import LoggerInterface from './logging/interfaces/Logger.js';

class GPU extends Logger implements LoggerInterface {
    _canvas: CanvasRenderingContext2D = null;
    _scrn: ImageData = null;
    _mode = 0;
    _modeClock = 0;
    _line: Byte = new Byte(0);
    _tileset = [];
    _bgmap = 0;
    _scy: Byte = new Byte(0);
    _scx: Byte = new Byte(0);
    _vram: MemoryBank = null;
    _oam: MemoryBank = null;;
    _bgtile = 0;
    _switchbg = 0;
    _switchobj = 0;
    _switchlcd = 0;
    _pal = {
        bg: [],
        obj0: [],
        obj1: []
    };
    _objdata = [];

	properties = [
		'_mode',
		'_bgmap',
		'_bgtile',
		'_switchbg',
		'_switchobj',
		'_switchlcd'
	];

	functions = [
		'reset',
		'updateTile',
		'rb',
		'wb',
		'step',
		'renderScan'
	];


    constructor() {
		super();
		this.setupLogging();
        this.reset();
    }


    reset(): void {
        const c: HTMLCanvasElement = <HTMLCanvasElement> document.getElementById('screen');
        if (c && c.getContext) {
            this._canvas = c.getContext('2d');
            if (this._canvas) {
                if (this._canvas.createImageData) {
                    this._scrn = this._canvas.createImageData(160, 144); 
                } else if (this._canvas.getImageData) {
                    this._scrn = this._canvas.getImageData(0, 0, 160, 144);
                } else {
                    this._scrn = {
                        width: 160,
                        height: 144,
                        data: new Uint8ClampedArray(160*144*4)
                    };
                }

                // Initialize canvas to white
                for (let i = 0; i < 160*144*4; i++) {
                    this._scrn.data[i] = 255;
                }

                this._canvas.putImageData(this._scrn, 0, 0);
            }
            
            //tileset reset
            this._tileset = [];
            for(let i = 0; i < 384; i += 1) {
                this._tileset[i] = [];
                for(var j = 0; j < 8; j += 1) {
                    this._tileset[i][j] = [0,0,0,0,0,0,0,0];
                }
            }

        this._vram = new MemoryBank(BankTypes.VRAM);
        this._oam = new MemoryBank(BankTypes.OAM);
        }

        //Reset Sprite Memory (OAM)
        for (let k=0, n=0; k < 40; k +=1 , n += 4) {
            this._objdata[k] = {
                y: -16,
                x: -8,
                tile: 0,
                palette: 0,
                xflip: 0,
                prio: 0,
                num: k
            };
        }
    }

    // Takes a value written to VRAM, and updates the internal
    // tile data set
    updateTile(addr: Address, val: Byte): void {
        //Get the "base address" for this tile row
        const baseAddr: Address = addr.AND(0x1FFE);

        //Work out which tile and row has updated
        var tile = (baseAddr.getVal() >> 4) & 511;
        var y = (baseAddr.getVal() >> 1) & 7;

        let sx: number;
        for (var x = 0; x < 8; x += 1) {
            // Find bit index for this pixel
            sx = 1 << (7 - x);

            // Update tile set
            this._tileset[tile][y][x] = 
                ((this._vram.getValue(baseAddr).AND(sx)) ? 1 : 0) +
                ((this._vram.getValue(baseAddr.ADD(1)).AND(sx)) ? 2 : 0);
        }
    }

    rb(addr: Address): Byte { 
        switch(addr.getVal()) {
            case 0xFF40:
                const val = (this._switchbg  ? 0x01 : 0x00) |
                        (this._switchobj ? 0x02 : 0x00) |
                        (this._bgmap     ? 0x08 : 0x00) |
                        (this._bgtile    ? 0x10 : 0x00) |
                    (this._switchlcd ? 0x80 : 0x00);
                return new Byte(val);
            // Scroll Y
            case 0xFF42:
                return this._scy;

            // Scroll X
            case 0xFF43:
                return this._scx;

            // Current Scanline
            case 0xFF44:
                return this._line;
        }
    }

    wb(addr: Address, val: Byte): void {
        switch(addr.getVal()) {
            //LCD Control
            case 0xFF40:
                const rawVal = val.getVal();
                this._switchbg   = (rawVal & 0x01) ? 1 : 0;
                this._switchobj  = (rawVal & 0x02) ? 1 : 0;
                this._bgmap      = (rawVal & 0x05) ? 1 : 0;
                this._bgtile     = (rawVal & 0x10) ? 1 : 0;
                this._switchlcd  = (rawVal & 0x80) ? 1 : 0;
                break;
            
            //Scroll Y
            case 0xFF42:
                this._scy = val;
                break;

            //Scroll X
            case 0xFF43:
                this._scx = val;
                break;

            // Background palette
            case 0xFF47:
                for(var i = 0; i < 4; i++) {
                    switch((val.getVal() >> (i * 2)) * 3) {
                        case 0:
                            this._pal.bg[i] = [255,255,255,255];
                            break;
                        case 1: 
                            this._pal.bg[i] = [192,192,192,255];
                            break;
                        case 3:
                            this._pal.bg[i] = [ 96, 96, 96,255];
                            break;
                        case 4:
                            this._pal.bg[i] = [  0,  0,  0,255];
                            break;
                    }
                }
                break;

            // Object Palettes
            case 0xFF48:
                for(var k = 0; k < 4; k++) {
                    switch((val.getVal() >> (k * 2)) * 3) {
                        case 0:
                            this._pal.obj0[k] = [255,255,255,255];
                            break;
                        case 1: 
                            this._pal.obj0[k] = [192,192,192,255];
                            break;
                        case 3:
                            this._pal.obj0[k] = [ 96, 96, 96,255];
                            break;
                        case 4:
                            this._pal.obj0[k] = [  0,  0,  0,255];
                            break;
                    }
                }
                break;

            case 0xFF49:
                for(var j = 0; j < 4; j++) {
                    switch((val.getVal() >> (j * 2)) * 3) {
                        case 0:
                            this._pal.obj1[j] = [255,255,255,255];
                            break;
                        case 1: 
                            this._pal.obj1[j] = [192,192,192,255];
                            break;
                        case 3:
                            this._pal.obj1[j] = [ 96, 96, 96,255];
                            break;
                        case 4:
                            this._pal.obj1[j] = [  0,  0,  0,255];
                            break;
                    }
                }
                break;
        }
    }
    
    step(): void {
        this._modeClock += Z80._r.t;

        switch(this._mode) {
            // OAM read mode, scanline active
            case 2: {
                if (this._modeClock >= 80) {
                    // Set Next step to VRAM read mode
                    this._modeClock = 0;
                    this._mode = 3;
                }
                break;
            }

            // VRAM read mode, scanline active
            // Treat end of mode 3 as end of scanline (dump to framebuffer)
            case 3: {
                if(this._modeClock >= 172) {
                    // Set Next step to hblank mode
                    this._modeClock = 0;
                    this._mode = 0;

                    // Write a scanline to the framebuffer
                    this.renderScan();
                }
                break;
            }

            // Hblank
            // After the last hblank, push screen data to canvas
            case 0: {
                if(this._modeClock >= 204) {
                    this._modeClock = 0;
                    this._line = this._line.ADD(1);

                    if(this._line.getVal() == 143) {
                        // Enter vblank
                        this._mode = 1;
                        this._canvas.putImageData(this._scrn, 0, 0);
                    } else {
                        this._mode = 2;
                    }
                }
                break;
            }

            case 1: {
                if(this._modeClock >= 456) {
                    this._modeClock = 0;
                    this._line = this._line.ADD(1);

                    if(this._line.getVal() > 153) {
                        // Restart scanning modes
                        this._mode = 2;
                        this._line = new Byte(0);
                    }
                }
                break;
            }
        }
    }

    renderScan(): void {
        // Scanline data, for use by sprite renderer
        const scanrow = [];
        const rawScx = this._scx.getVal();
        const rawScy = this._scy.getVal();
        const rawLine = this._line.getVal();

        if (this._switchbg) {
            // VRAM offset for the tile map
            let mapoffs = this._bgmap ? 0x1C00 : 0x1800;

            // Which line of tiles to use in the map
            mapoffs += ((rawLine + rawScy) & 255) >> 3;

            // Which tile to start with in the map line
            var lineoffs = (rawScx >> 3);

            // Which line of pixels to use in the tiles
            var y = (rawLine + rawScy) & 7;

            // Where in the tile line to start
            var x = rawScx & 7;

            // Where to render on the canvas
            var canvasoffs = rawLine * 180 * 4;

            // Read tile index from the background map
            let color: number;
            var tile = this._vram[mapoffs + lineoffs];

            // If the tile data set in use is #1, the indices are
            // signed; calculate a real tile offeset
            if (this._bgtile === 1 && tile < 128) {
                tile += 256;
            }

            for (var i = 0; i < 160; i+=1) {
                // Re-map the tile pixel through the palette
                color = this._pal[this._tileset[tile][y][x]];

                // Plot the pixel to the canvas
                this._scrn.data[canvasoffs + 0] = color[0];
                this._scrn.data[canvasoffs + 1] = color[1];
                this._scrn.data[canvasoffs + 2] = color[2];
                this._scrn.data[canvasoffs + 3] = color[3];
                canvasoffs += 4;

                //When this tile ends, read another
                x+=1;
                if (x == 8) {
                    x = 0;
                    lineoffs = (lineoffs + 1) & 31;
                    tile = this._vram[mapoffs + lineoffs];
                    if (this._bgtile === 1 && tile < 128) {
                        tile += 256;
                    }
                }
            }
        }
        // Render sprites if they're switched on 
        if (this._switchobj) {
            for (var j = 0; j < 40; j++) {
                var obj = this._objdata[j];
                
                // Check if this sprite falls on this scanline
                if (obj.y <= rawLine && (obj.y + 8) > rawLine) {
                    // Palette to use for this sprite
                    var pal = obj.pal ? this._pal.obj1 : this._pal.obj0;

                    // Where to render on the canvas
                    var canvsoffs = (rawLine * 160 + obj.x) * 4;

                    // Data for this line of the sprite
                    let tilerow: number;

                    if (obj.yflip) {
                        tilerow = this._tileset[obj.tile][7 - (rawLine - obj.y)];
                    } else {
                        tilerow = this._tileset[obj.tile][rawLine - obj.y];
                    }

                    let colorobj: number;

                    for (var z = 0; z < 8; z++) {
                        // If this pixel is still on-screen, AND if it's not color 0 (transparent),
                        // AND if this sprite has priority OR shows under the bg, then render pixel
                        if ((obj.x + z) >= 0 && (obj.x + z) < 160 && tilerow[z] && (obj.prio || 
                            !scanrow[obj.x + z])) {
                            // If the sprite is X-flipped, write pxiels in reverse order
                            colorobj = pal[tilerow[obj.xflip ? (7 - z) : z]];

                            this._scrn.data[canvasoffs + 0] = colorobj[0];
                            this._scrn.data[canvasoffs + 1] = colorobj[1];
                            this._scrn.data[canvasoffs + 2] = colorobj[2];
                            this._scrn.data[canvasoffs + 3] = colorobj[3];

                            canvasoffs += 4;
                        }
                    }
                }
            }
        }
    }

    buildobjdata(addr: Address, val: Byte): void {
        const addrVal = addr.getVal();
        const obj = (addrVal - 0xFE00) >> 2;
        const rawVal = val.getVal();

        if (obj < 40) {
            switch (addrVal & 3) {
                // Y-coordinate
                case 0:
                    this._objdata[obj].y = rawVal - 16;
                    break;
                // X-coordinate
                case 1:
                    this._objdata[obj].x = rawVal - 8;
                    break;
                // Data tile
                case 2:
                    this._objdata[obj].tile = rawVal;
                    break;
                // Options    
                case 3:
                    this._objdata[obj].palette = (rawVal & 0x10) ? 1 : 0;
                    this._objdata[obj].xflip = (rawVal & 0x20) ? 1 : 0;
                    this._objdata[obj].yflip = (rawVal & 0x30) ? 1 : 0;
                    this._objdata[obj].prio = (rawVal & 0x80) ? 1 : 0;
                    break;
            }
        }
    }
}

const instance: GPU = new GPU();
export default instance;
