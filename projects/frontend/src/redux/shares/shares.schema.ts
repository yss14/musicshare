import { Moment } from 'moment';

export interface IFile {
	readonly container: string;
	readonly blob: string;
	readonly fileExtension: string;
	readonly originalFilename: string;
}

export interface ISong {
	readonly id: string;
	readonly title: string;
	readonly suffix?: string;
	readonly year?: number;
	readonly bpm?: number;
	readonly dateLastEdit?: Moment;
	readonly releaseDate?: Moment;
	readonly isRip: boolean;
	readonly artists: string[];
	readonly remixer?: string[];
	readonly featurings?: string[];
	readonly type: string;
	readonly genres?: string[];
	readonly label?: string;
	readonly needsUserAction: boolean;
	readonly file?: IFile;
	readonly duration: number;
}

export interface IShareSchema {
	id: string;
	idHash: string;
	name: string;
	userID: string;
	isLibrary: boolean;
	songs: ISong[];
}

export type ISharesSchema = IShareSchema[];