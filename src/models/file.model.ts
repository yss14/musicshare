import { ObjectType, Field } from "type-graphql";

@ObjectType({ description: 'This represents file meta data for a song' })
export class File {
	@Field()
	public readonly container!: string;

	@Field()
	public readonly blob!: string;

	@Field()
	public readonly fileExtension!: string;

	@Field()
	public readonly originalFilename!: string;
}