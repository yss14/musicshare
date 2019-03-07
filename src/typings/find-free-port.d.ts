declare module 'find-free-port' {
	type FindFreePortCallback = (err?: Error, port?: number) => void;

	function findFreePort(desiredPort: number, cb: FindFreePortCallback): void;
	function findFreePort(rangeStart: number, rangeEnd: number, cb: FindFreePortCallback): void;

	export = findFreePort;
}