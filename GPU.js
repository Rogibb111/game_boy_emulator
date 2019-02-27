GPU = {
    _canvas: {},
    _scrn: {},
    _mode: 0,
    _modeClock: 0,
    _line: 0,

    reset: function() {
        var c = document.getElementById('screen');
        if (c && c.getContext) {
            GPU._canvas = getContext('2d');
            if (GPU._canvas) {
                if (GPU._canvas.createImageData) {
                    GPU._scrn = GPU._canvas.getImageData(160, 144); 
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
                
            }
        }
    }
}
