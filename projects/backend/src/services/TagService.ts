import { ISongService } from "./SongService";

export interface ITagService {
	getTagsForShare(shareID: string): Promise<string[]>;
}

interface ITagServiceArgs {
	songService: ISongService;
}

export const TagService = ({ songService }: ITagServiceArgs): ITagService => {
	const getTagsForShare = async (shareID: string): Promise<string[]> => {
		const shareSongs = await songService.getByShare(shareID);

		return Array.from(
			shareSongs.reduce((tagsSet: Set<string>, song) => {
				song.tags.forEach(tag => tagsSet.add(tag));

				return tagsSet;
			}, new Set<string>())
		);
	}

	return { getTagsForShare };
}