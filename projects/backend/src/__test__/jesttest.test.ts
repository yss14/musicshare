const wait = (ms: number) => new Promise(resolve => setTimeout(() => resolve(), ms));

describe('A', () => {
	test('1', async () => {
		console.log('A1 started');
		await wait(1000);
		console.log('A1 finished');
	});

	test('2', async () => {
		console.log('A2 started');
		await wait(1000);
		console.log('A2 finished');
	});

	test('3', async () => {
		console.log('A3 started');
		await wait(1000);
		console.log('A3 finished');
	});

	test('4', async () => {
		console.log('A4 started');
		await wait(1000);
		console.log('A4 finished');
	});
});

describe('B', () => {
	test('1', async () => {
		console.log('B1 started');
		await wait(1000);
		console.log('B1 finished');
	});

	test('2', async () => {
		console.log('B2 started');
		await wait(1000);
		console.log('B2 finished');
	});

	test('3', async () => {
		console.log('B3 started');
		await wait(1000);
		console.log('B3 finished');
	});

	test('4', async () => {
		console.log('B4 started');
		await wait(1000);
		console.log('B4 finished');
	});
});