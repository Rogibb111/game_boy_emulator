class Aggregator {
	logProperty(name: string, prop: string, value: any): void {
	}

	logBeforeFunc(name: string, funcName: string, args: any): void {
	}

	logAfterFunc(name: string, funcName: string, ret: any): void {
	}
}
const instance = new Aggregator();
export default instance;
