![Build](https://github.com/Rogibb111/GameBoy-Emulator-Browser/workflows/Build/badge.svg)
# Gameboy Emulator 
## A browser based GB emulator for the modern world

A small project that I have been working on to familarize myself with TypeScript and my next step in writing emulators. This Readme will currently serve as a place for me to track my progress. Fascination reading material.

* 5/4/20 - Have changed over the instructions to be Meta-Data instructions. This reduced the number of repeated logic was getting thrown in instructions. There are still some edge cases like jump instructions that modify some of the meta-data parameters, so a bunch of them still have to be edited in the action function. Want to look into seeing if I can use context and order of operations to simplify that. Need to make a ticket for it. Also have added some more instructions to get the BIOs working and some helper functions for setting flags in the CPU Registers. 

* 4/29/20 - Have added about 3 new instructions to the Z80 opcode map. Spent a bunch of time creating a small roadmap for myself using GitHub projects (I feel like a PM now with my fancy Kanban board).I also was able to get a GitHub action working to build the project whenever a PR gets put up and disable the merge button if the build fails. Not the most useful thing in the world, but does keep me from merging in bad typescript. Last and most painful was adding in all of the data models. There is a decent amount of redundancy in them for the time being, but I'm hoping that as I enter into the logging phase of this, I will be able to flush them out into more useful classes (As in different models will have different printouts). 

* 4/15/20 - Finished up the memory logic to wrap up work on the major systems. Did some minor error fixes with typing. Updated the module system to use ES2015 modules. Since modules don't work via loading from the file-system, needed to add small static node server to serve up files. Got button handlers fixed up as well. Started adding instructions to Z80 class. Wound up breaking them up into seperate files.

* 5/9/19 - All JavaScript files have been converted over to TypeScript. I have created MemoryBank instances for most of the ram, but have realized that my scheme doesn't work well with the Imran Nazar's ramoffset. Current thoughts are to read eram size from cartridge header and have the bank instance for eram take in the number of 8k banks to create. Then when reading and writing, we can pass in the rambank number for read and writes.

* 5/10/19 - Fixed most errors from linting. After looking over the MMU even more, I'm starting to think that I should be using the same scheme i use for handling ram banks with the roms banks as well. A: Better to use the same patter for similar operations and B: will probably help me debug. Now I need to come up with a good implementation.

* 5/11/19 - Added multuple bank support to the MemoryBank class. You can now pass in the size of the memory you are trying to emulate, and it will create the appropriate number of banks based off the bank size. It will now allow you set the active bank as well, so writes can occur in the right bank.
