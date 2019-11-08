import { Field, registerEnumType, ArgsType } from "type-graphql";
import { MinLength } from "class-validator";

export enum SongSearchMatcher {
	Title = 'title',
	Artists = 'artists',
	Tags = 'tags',
	Genres = 'genres',
	Labels = 'labels',
}

registerEnumType(SongSearchMatcher, {
	name: 'SongSearchMatcher',
	description: 'Specifies Which properties are to be searched',
})

@ArgsType()
export class SongSearchInput {

	@Field()
	@MinLength(2)
	public readonly query!: string;

	@Field(type => [SongSearchMatcher], { nullable: true })
	public readonly matcher!: SongSearchMatcher[] | null;
}