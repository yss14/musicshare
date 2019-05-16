export interface ISong {
	title: string;
	suffix: string;
	year: number;
	bpm: number;
	releaseDate: string;
	isRip: boolean;
	artists: string[];
	remixer: string[];
	featurings: string[];
	type: string;
	genres: string[];
	labels: string[];
	duration: number;
}