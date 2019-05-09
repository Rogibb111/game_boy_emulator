# Gameboy Emulator 
## A browser based GB emulator for the modern world

A small project that I have been working on to familarize myself with TypeScript and my next step in writing emulators. This Readme will currently serve as a place for me to track my progress. Fascination reading material.

* 5/9/19 - All JavaScript files have been converted over to TypeScript. I have created MemoryBank instances for most of the ram, but have realized that my scheme doesn't work well with the Imran Nazar's ramoffset. Current thoughts are to read eram size from cartridge header and have the bank instance for eram take in the number of 8k banks to create. Then when reading and writing, we can pass in the rambank number for read and writes.