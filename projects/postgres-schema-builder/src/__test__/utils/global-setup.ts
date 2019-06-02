import * as dotenv from 'dotenv';

export default async () => {
	if (!process.env.IS_CI) {
		dotenv.config({
			path: `./test.env`
		});
	}
}