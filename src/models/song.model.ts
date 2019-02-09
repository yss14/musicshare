import { File } from './file.model';
import { ObjectType, Field, Float } from "type-graphql";
import { Share } from "./share.model";
import { Nullable } from '../types/Nullable';
import { ISong } from './interfaces/ISong';

@ObjectType({ description: 'This represents a song which can be part of a library or share' })
export class Song implements Nullable<ISong>{
	@Field()
	public readonly id!: string;

	@Field()
	public readonly title!: string;

	@Field({ nullable: true })
	public readonly suffix!: string | null;

	@Field({ nullable: true })
	public readonly year!: number | null;

	@Field({ nullable: true })
	public readonly bpm!: number | null;

	@Field(type => Float)
	public readonly dateLastEdit!: number;

	@Field({ nullable: true })
	releaseDate!: string | null;

	@Field()
	public readonly isRip!: boolean;

	@Field(type => [String])
	public readonly artists!: string[];

	@Field(type => [String])
	public readonly remixer!: string[];

	@Field(type => [String])
	public readonly featurings!: string[];

	@Field({ nullable: true })
	public readonly type!: string | null;

	@Field(type => [String])
	public readonly genres!: string[];

	@Field({ nullable: true })
	public readonly label!: string | null;

	@Field(() => Share)
	public readonly share!: Share;

	@Field()
	public readonly requiresUserAction!: boolean;

	@Field(() => File)
	public readonly file!: File;

	@Field()
	public readonly accessUrl!: string;
}