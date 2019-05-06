
class GPU {
    _canvas = {};
    _scrn = {};
    _mode = 0;
    _modeClock = 0;
    _line = 0;
    _tileset = [];
    _bgmap: 0,
    _scy: 0,
    _scx: 0,
    _vram: [],
    _bgtile: 0,
    _switchbg: 0,
    _switchlcd: 0,
    _pal: {
        bg: [],
        obj0: [],
        obj1: []
    },
    _oam: [],
    _objdata: [],


    reset: function() {
        var c = document.getElementById('screen');
        if (c && c.getContext) {
            GPU._canvas = c.getContext('2d');
            if (GPU._canvas) {
                if (GPU._canvas.createImageData) {
                    GPU._scrn = GPU._canvas.createImageData(160, 144); 
                } else if (GPU._canvas.getImageData) {
                    GPU._scrn = GPU._canvas.getImageData(0, 0, 160, 144);
                } else {
                    GPU._scrn = {
                        'width': 160,
                        'height': 144,
                        'data': new Array(160*144*4)
                    };
                }

                // Initialize canvas to white
                for (var i = 0; i < 160*144*4; i++) {
                    GPU._scrn.data[i] = 255;
                }

                GPU._canvas.putImageData(GPU._scrn, 0, 0);
            }
            
            //tileset reset
            GPU._tileset[i] = [];
            for(var j = 0; j < 8; j++) {
                GPU._tileset[i][j] = [0,0,0,0,0,0,0,0];
            }
        }

        //Reset Sprite Memory (OAM)
        for (var k=0, n=0; k<40; k++, n+=4) {
            GPU._oam[n + 0] = 0;
            GPU._oam[n + 1] = 0;
            GPU._oam[n + 2] = 0;
            GPU._oam[n + 3] = 0;
            GPU._objdata[k] = {
                'y': -16,
                'x': -8,
                'tile': 0,
                'palette': 0,
                'xflip': 0,
                'prio': 0,
                'num': k
            };
        }
    },

    // Takes a value written to VRAM, and updates the internal
    // tile data set
    updateTile: function(addr, val) {
        //Get teh "base address" for this tile row
        addr &= 0x1FFE;

        //Work out which tile and row has updated
        var tile = (addr >> 4) & 511;
        var y = (addr >> 1) & 7;

        var sx;
        for(var x = 0; x < 8; x += 1){
            // Find bit index for this pixel
            sx = 1 << (7 - x);

            // Update tile set
            GPU._tileset[tile][y][x] = 
                ((GPU._vram[addr] & sx) ? 1 : 0) +
                ((GPU._vram[addr+1] & sx) ? 2 : 0);
        }
    },

    rb: function(addr) { 
        switch(addr) {
            case 0xFF40:
                return  (GPU._switchbg  ? 0x01 : 0x00) |
                        (GPU._switchobj ? 0x02 : 0x00) |
                        (GPU._bgmap     ? 0x08 : 0x00) |
                        (GPU._bgtile    ? 0x10 : 0x00) |
                        (GPU._switchlcd ? 0x80 : 0x00);
            // Scroll Y
            case 0xFF42:
                return GPU._scy;

            // Scroll X
            case 0xFF43:
                return GPU._scx;

            // Current Scanline
            case 0xFF44:
                return GPU._line;
        }
    },

    wb: function(addr, val) {
        switch(addr) {
            //LCD Control
            case 0xFF40:
                GPU._switchbg   = (val & 0x01) ? 1 : 0;
                GPU._switchobj  = (val & 0x02) ? 1 : 0;
                GPU._bgmap      = (val & 0x05) ? 1 : 0;
                GPU._bgtile     = (val & 0x10) ? 1 : 0;
                GPU._switchlcd  = (val & 0x80) ? 1 : 0;
                break;
            
            //Scroll Y
            case 0xFF42:
                GPU._scy = val;
                break;

            //Scroll X
            case 0xFF43:
                GPU._scx = val;
                break;

            // Background palette
            case 0xFF47:
                for(var i = 0; i < 4; i++) {
                    switch((val >> (i * 2)) * 3) {
                        case 0:
                            GPU._pal.bg[i] = [255,255,255,255];
                            break;
                        case 1: 
                            GPU._pal.bg[i] = [192,192,192,255];
                            break;
                        case 3:
                            GPU._pal.bg[i] = [ 96, 96, 96,255];
                            break;
                        case 4:
                            GPU._pal.bg[i] = [  0,  0,  0,255];
                            break;
                    }
                }
                break;

            // Object Palettes
            case 0xFF48:
                for(var k = 0; k < 4; k++) {
                    switch((val >> (k * 2)) * 3) {
                        case 0:
                            GPU._pal.obj0[k] = [255,255,255,255];
                            break;
                        case 1: 
                            GPU._pal.obj0[k] = [192,192,192,255];
                            break;
                        case 3:
                            GPU._pal.obj0[k] = [ 96, 96, 96,255];
                            break;
                        case 4:
                            GPU._pal.obj0[k] = [  0,  0,  0,255];
                            break;
                    }
                }
                break;

            case 0xFF49:
                for(var j = 0; j < 4; j++) {
                    switch((val >> (j * 2)) * 3) {
                        case 0:
                            GPU._pal.obj1[j] = [255,255,255,255];
                            break;
                        case 1: 
                            GPU._pal.obj1[j] = [192,192,192,255];
                            break;
                        case 3:
                            GPU._pal.obj1[j] = [ 96, 96, 96,255];
                            break;
                        case 4:
                            GPU._pal.obj1[j] = [  0,  0,  0,255];
                            break;
                    }
                }
                break;
        }
    },
    
    step: function() {
        GPU._modeClock += Z80._r.t;

        switch(GPU._mode) {
            // OAM read mode, scanline active
            case 2: {
                if (GPU._modeClock >= 80) {
                    // Set Next step to VRAM read mode
                    GPU._modeClock = 0;
                    GPU._mode = 3;
                }
                break;
            }

            // VRAM read mode, scanline active
            // Treat end of mode 3 as end of scanline (dump to framebuffer)
            case 3: {
                if(GPU._modeClock >= 172) {
                    // Set Next step to hblank mode
                    GPU._modeClock = 0;
                    GPU._mode = 0;

                    // Write a scanline to the framebuffer
                    GPU.renderscan();
                }
                break;
            }

            // Hblank
            // After the last hblank, push screen data to canvas
            case 0: {
                if(GPU._modeClock >= 204) {
                    GPU._modeClock = 0;
                    GPU._line++;

                    if(GPU._line == 143) {
                        // Enter vblank
                        GPU._mode == 1;
                        GPU._canvas.putImageData(GPU._scrn, 0, 0);
                    } else {
                        GPU._mode = 2;
                    }
                }
                break;
            }

            case 1: {
                if(GPU._modeClock >= 456) {
                    GPU._modeClock = 0;
                    GPU._line += 1;

                    if(GPU._line > 153) {
                        // Restart scanning modes
                        GPU._mode = 2;
                        GPU._line = 0;
                    }
                }
                break;
            }
        }
    },

    renderScan: function() {
        // Scanline data, for use by sprite renderer
        var scanrow = [];

        if (GPU._switchbg) {
            // VRAM offset for the tile map
            var mapoffs = GPU._bgmap ? 0x1C00 : 0x1800;

            // Which line of tiles to use in the map
            mapoffs += ((GPU._line + GPU._scy) & 255) >> 3;

            // Which tile to start with in the map line
            var lineoffs = (GPU.scx >> 3);

            // Which line of pixels to use in the tiles
            var y = (GPU._line + GPU.scy) & 7;

            // Where in the tile line to start
            var x = GPU._scx & 7;

            // Where to render on the canvas
            var canvasoffs = GPU._line * 180 * 4;

            // Read tile index from the background map
            var color;
            var tile = GPU._vram[mapoffs + lineoffs];

            // If the tile data set in use is #1, the indices are
            // signed; calculate a real tile offeset
            if (GPU._bgtile === 1 && tile < 128) {
                tile += 256;
            }

            for (var i = 0; i < 160; i+=1) {
                // Re-map the tile pixel through the palette
                color = GPU._pal[GPU.tileset[tile][y][x]];

                // Plot the pixel to the canvas
                GPU._scrn.data[canvasoffs + 0] = color[0];
                GPU._scrn.data[canvasoffs + 1] = color[1];
                GPU._scrn.data[canvasoffs + 2] = color[2];
                GPU._scrn.data[canvasoffs + 3] = color[3];
                canvasoffs += 4;

                //When this tile ends, read another
                x+=1;
                if (x == 8) {
                    x = 0;
                    lineoffs = (lineoffs + 1) & 31;
                    tile = GPU._vram[mapoffs + lineoffs];
                    if (GPU._bgtile === 1 && tile < 128) {
                        tile += 256;
                    }
                }
            }
        }
        // Render sprites if they're switched on 
        if (GPU._switchobj) {
            for (var j = 0; j < 40; j++) {
                var obj = GPU._objdata[j];
                
                // Check if this sprite falls on this scanline
                if (obj.y <= GPU._line && (obj.y + 8) > GPU._line) {
                    // Palette to use for this sprite
                    var pal = obj.pal ? GPU._pal.obj1 : GPU._pal.obj0;

                    // Where to render on the canvas
                    var canvsoffs = (GPU._line * 160 + obj.x) * 4;

                    // Data for this line of the sprite
                    var tilerow;

                    if (obj.yflip) {
                        tilerow = GPU._tileset[obj.tile][7 - (GPU._line - obj.y)];
                    } else {
                        tilerow = GPU._tileset[obj.tile][GPU._line - obj.y];
                    }

                    var colorobj;

                    for (var z = 0; z < 8; z++) {
                        // If this pixel is still on-screen, AND if it's not color 0 (transparent),
                        // AND if this sprite has priority OR shows under the bg, then render pixel
                        if ((obj.x + z) >= 0 && (obj.x + z) < 160 && tilerow[z] && (obj.prio || 
                            !scanrow[obj.x + z])) {
                            // If the sprite is X-flipped, write pxiels in reverse order
                            colorobj = pal[tilerow[obj.xflip ? (7 - z) : z]];

                            GPU._scrn.data[canvasoffs + 0] = colorobj[0];
                            GPU._scrn.data[canvasoffs + 1] = colorobj[1];
                            GPU._scrn.data[canvasoffs + 2] = colorobj[2];
                            GPU._scrn.data[canvasoffs + 3] = colorobj[3];

                            canvasoffs += 4;
                        }
                    }
                }
            }
        }
    },

    buildobjdata: function(addr, val) {
        var obj = addr >> 2;
        if (obj < 40) {
            switch (addr & 3) {
                // Y-coordinate
                case 0:
                    GPU._objdata[obj].y = val - 16;
                    break;
                // X-coordinate
                case 1:
                    GPU._objdata[obj].x = val - 8;
                    break;
                // Data tile
                case 2:
                    GPU._objdata[obj].tile = val;
                    break;
                // Options    
                case 3:
                    GPU._objdata[obj].palette = (val & 0x10) ? 1 : 0;
                    GPU._objdata[obj].xflip = (val & 0x20) ? 1 : 0;
                    GPU._objdata[obj].yflip = (val & 0x30) ? 1 : 0;
                    GPU._objdata[obj].prio = (val & 0x80) ? 1 : 0;
                    break;
            }
        }
    }
}
