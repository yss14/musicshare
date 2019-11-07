import { ObjectType, Field, createUnionType } from "type-graphql";

@ObjectType({ description: 'This represents file meta data for an uploaded song' })
export class FileUpload {
	@Field()
	public readonly container!: string;

	@Field()
	public readonly blob!: string;

	@Field()
	public readonly fileExtension!: string;

	@Field()
	public readonly originalFilename!: string;
}

export const FileSource = createUnionType({
	name: "FileSource",
	types: [FileUpload],
})

export type FileSource = typeof FileSource

export interface IFileSourceJSONType {
	data: FileSource[]; // need to wrap this into a property because of postgres json type problems with arrays
}

export const makeFileSourceJSONType = (sources: FileSource | FileSource[]): IFileSourceJSONType => ({
	data: Array.isArray(sources) ? sources : [sources],
})
