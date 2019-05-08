import { Address } from "./models/Address";

class GPU {
    _canvas: CanvasRenderingContext2D = null;
    _scrn: ImageData = null;
    _mode = 0;
    _modeClock = 0;
    _line = 0;
    _tileset = [];
    _bgmap = 0;
    _scy = 0;
    _scx = 0;
    _vram = [];
    _bgtile = 0;
    _switchbg = 0;
    _switchobj = 0;
    _switchlcd = 0;
    _pal = {
        bg: [],
        obj0: [],
        obj1: []
    };
    _oam = [];
    _objdata = [];

    constructor() {
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
 
        }

        //Reset Sprite Memory (OAM)
        for (let k=0, n=0; k < 40; k +=1 , n += 4) {
            this._oam[n + 0] = 0;
            this._oam[n + 1] = 0;
            this._oam[n + 2] = 0;
            this._oam[n + 3] = 0;
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
    updateTile(addr: Address, val: number): void {
        //Get the "base address" for this tile row
        const baseAddr: Address = addr.AND( 0x1FFE);

        //Work out which tile and row has updated
        var tile = (baseAddr.getVal() >> 4) & 511;
        var y = (baseAddr.getVal() >> 1) & 7;

        var sx;
        for (var x = 0; x < 8; x += 1) {
            // Find bit index for this pixel
            sx = 1 << (7 - x);

            // Update tile set
            this._tileset[tile][y][x] = 
                ((this._vram[baseAddr] & sx) ? 1 : 0) +
                ((this._vram[baseAddr+1] & sx) ? 2 : 0);
        }
    }

    rb(addr): number { 
        switch(addr) {
            case 0xFF40:
                return  (this._switchbg  ? 0x01 : 0x00) |
                        (this._switchobj ? 0x02 : 0x00) |
                        (this._bgmap     ? 0x08 : 0x00) |
                        (this._bgtile    ? 0x10 : 0x00) |
                        (this._switchlcd ? 0x80 : 0x00);
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

    wb(addr, val): void {
        switch(addr) {
            //LCD Control
            case 0xFF40:
                this._switchbg   = (val & 0x01) ? 1 : 0;
                this._switchobj  = (val & 0x02) ? 1 : 0;
                this._bgmap      = (val & 0x05) ? 1 : 0;
                this._bgtile     = (val & 0x10) ? 1 : 0;
                this._switchlcd  = (val & 0x80) ? 1 : 0;
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
                    switch((val >> (i * 2)) * 3) {
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
                    switch((val >> (k * 2)) * 3) {
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
                    switch((val >> (j * 2)) * 3) {
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
                    this._line++;

                    if(this._line == 143) {
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
                    this._line += 1;

                    if(this._line > 153) {
                        // Restart scanning modes
                        this._mode = 2;
                        this._line = 0;
                    }
                }
                break;
            }
        }
    }

    renderScan(): void {
        // Scanline data, for use by sprite renderer
        var scanrow = [];

        if (this._switchbg) {
            // VRAM offset for the tile map
            var mapoffs = this._bgmap ? 0x1C00 : 0x1800;

            // Which line of tiles to use in the map
            mapoffs += ((this._line + this._scy) & 255) >> 3;

            // Which tile to start with in the map line
            var lineoffs = (this._scx >> 3);

            // Which line of pixels to use in the tiles
            var y = (this._line + this._scy) & 7;

            // Where in the tile line to start
            var x = this._scx & 7;

            // Where to render on the canvas
            var canvasoffs = this._line * 180 * 4;

            // Read tile index from the background map
            var color;
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
                if (obj.y <= this._line && (obj.y + 8) > this._line) {
                    // Palette to use for this sprite
                    var pal = obj.pal ? this._pal.obj1 : this._pal.obj0;

                    // Where to render on the canvas
                    var canvsoffs = (this._line * 160 + obj.x) * 4;

                    // Data for this line of the sprite
                    var tilerow;

                    if (obj.yflip) {
                        tilerow = this._tileset[obj.tile][7 - (this._line - obj.y)];
                    } else {
                        tilerow = this._tileset[obj.tile][this._line - obj.y];
                    }

                    var colorobj;

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

    buildobjdata(addr, val): void {
        var obj = addr >> 2;
        if (obj < 40) {
            switch (addr & 3) {
                // Y-coordinate
                case 0:
                    this._objdata[obj].y = val - 16;
                    break;
                // X-coordinate
                case 1:
                    this._objdata[obj].x = val - 8;
                    break;
                // Data tile
                case 2:
                    this._objdata[obj].tile = val;
                    break;
                // Options    
                case 3:
                    this._objdata[obj].palette = (val & 0x10) ? 1 : 0;
                    this._objdata[obj].xflip = (val & 0x20) ? 1 : 0;
                    this._objdata[obj].yflip = (val & 0x30) ? 1 : 0;
                    this._objdata[obj].prio = (val & 0x80) ? 1 : 0;
                    break;
            }
        }
    }
}

const instance: GPU = new GPU();
export default instance;
