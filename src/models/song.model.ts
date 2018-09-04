import { File } from './file.model';
import { ObjectType, Field, Float } from "type-graphql";
import { Share } from "./share.model";

@ObjectType({ description: 'This represents a song which can be part of a library or share' })
export class Song {
	@Field()
	id: string;

	@Field()
	title: string;

	@Field({ nullable: true })
	suffix?: string;

	@Field({ nullable: true })
	year?: number;

	@Field({ nullable: true })
	bpm?: number;

	@Field(type => Float)
	dateLastEdit: number;

	@Field({ nullable: true })
	releaseDate?: string;

	@Field()
	isRip: boolean;

	@Field(type => [String])
	artists: string[];

	@Field(type => [String])
	remixer: string[];

	@Field(type => [String])
	featurings: string[];

	@Field({ nullable: true })
	type: string;

	@Field(type => [String], { nullable: true })
	genres: string[];

	@Field({ nullable: true })
	label: string;

	@Field(() => Share)
	share: Share;

	@Field()
	needsUserAction: boolean;

	@Field(() => File)
	file: File;

	@Field()
	accessUrl: string;
}