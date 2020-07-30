export default interface Display {
  	loggingProfile: { 
       classType: string,
       logTypes: LogTypes[]
    }[],
	logProperties: (classId: number, className: string, name: string, value: any) => void,
  	logFunctions: (classId: number, className: string, name: string, start: Date, end: Date, args: any, ret: any) => void 
}

export enum LogTypes {
	functions,
	properties
}
