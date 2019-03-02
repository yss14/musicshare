export interface IFile {
	container: string;
	blob: string;
	originalFilename: string;
	fileExtension: string;
}

export const makeFileObject = (container: string, blob: string, originalFilename: string, fileExtension: string): IFile => ({
	container,
	blob,
	originalFilename,
	fileExtension
});