import gql from "graphql-tag";
import { Mutation } from "react-apollo";
import { Nullable } from "../../types/Nullable";
import { IShareSong, shareSongKeys } from "../types";

export const UPDATE_SONG = gql`
	mutation UpdateSong($shareID: String!, $songID: String!, $song: SongUpdateInput!){
		updateSong(shareID: $shareID, songID: $songID, song: $song){
			${shareSongKeys}
		}
	}
`;

export interface ISongUpdateInput {
	title?: string;
	suffix?: string;
	year?: number;
	bpm?: number;
	releaseDate?: string;
	isRip?: boolean;
	artists?: string[];
	remixer?: string[];
	featurings?: string[];
	type?: string;
	genres?: string[];
	label?: string;
	tags?: string[];
}

export interface IUpdateSongVariables {
	shareID: string;
	songID: string;
	song: Nullable<ISongUpdateInput>;
}

export interface IUpdateSongData {
	updateSong: IShareSong;
}

export class UpdateSongMutation extends Mutation<IUpdateSongData, IUpdateSongVariables>{ }