import { Readable } from "stream";

export const streamToBuffer = (stream: Readable): Promise<Buffer> => {
	return new Promise<Buffer>((resolve, reject) => {
		let _data: any[] = [];

		stream.on('data', data => _data.push(data));
		stream.on('end', () => resolve(Buffer.concat(_data)));
		stream.on('error', (err) => reject(err));
	})
}