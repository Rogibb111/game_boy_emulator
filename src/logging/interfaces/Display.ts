export default interface Display {
    loggingProfile: [
		{ 
            class: string,
            logTypes: string[]
        }
	],
	logProperites: (classId: number, className: string, name: string, value: any) => null,
    logFunctions: (classId: number, className: string, name: string, start: Date, end: Date, args: any, ret: any) => null
}
