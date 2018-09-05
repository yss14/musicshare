export interface IShareSchema {
	id: string;
	idHash: string;
	name: string;
	userID: string;
	isLibrary: boolean;
}

export type ISharesSchema = IShareSchema[];