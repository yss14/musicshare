import findFreeTCPPort = require('find-free-port');

export const findFreePort = (): Promise<number> => new Promise<number>((resolve, reject) => {
	findFreeTCPPort(3000, 3100, (err, port) => {
		if (err) {
			reject(err);
		} else if (port) {
			resolve(port);
		} else {
			reject('Something went wrong');
		}
	});
})