import { ObjectType, Field } from "type-graphql";

@ObjectType({ description: 'This represents file meta data for a song' })
export class File {
	@Field()
	container: string;

	@Field()
	blob: string;

	@Field()
	fileExtension: string;

	@Field()
	originalFilename: string;
}