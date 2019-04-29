declare module 'mp3-duration' {
	function mp3Duration(source: string | Buffer): Promise<number>;

	export default mp3Duration;
}