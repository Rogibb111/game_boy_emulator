# Gameboy Emulator 
## A browser based GB emulator for the modern world

A small project that I have been working on to familarize myself with TypeScript and my next step in writing emulators. This Readme will currently serve as a place for me to track my progress. Fascination reading material.

* 5/9/19 - All JavaScript files have been converted over to TypeScript. I have created MemoryBank instances for most of the ram, but have realized that my scheme doesn't work well with the Imran Nazar's ramoffset. Current thoughts are to read eram size from cartridge header and have the bank instance for eram take in the number of 8k banks to create. Then when reading and writing, we can pass in the rambank number for read and writes.

* 5/10/19 - Fixed most errors from linting. After looking over the MMU even more, I'm starting to think that I should be using the same scheme i use for handling ram banks with the roms banks as well. A: Better to use the same patter for similar operations and B: will probably help me debug. Now I need to come up with a good implementation.

* 5/11/19 - Added multuple bank support to the MemoryBank class. You can now pass in the size of the memory you are trying to emulate, and it will create the appropriate number of banks based off the bank size. It will now allow you set the active bank as well, so writes can occur in the right bank.
