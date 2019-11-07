import { ISongService } from "./SongService";
import { IShareService } from "./ShareService";
import { flatten, uniq } from "lodash";

export interface ITagService {
	getTagsForShare(shareID: string): Promise<string[]>;
	getAggregatedTagsForUser(userID: string): Promise<string[]>;
}

interface ITagServiceArgs {
	songService: ISongService;
	shareService: IShareService;
}

export const TagService = ({ songService, shareService }: ITagServiceArgs): ITagService => {
	const getTagsForShare = async (shareID: string): Promise<string[]> => {
		const shareSongs = await songService.getByShare(shareID);

		return uniq(
			flatten(
				shareSongs.map(song => song.tags)
			)
		)
	}

	const getTagsForShares = async (shareIDs: string[]): Promise<string[]> => {
		return flatten(
			await Promise.all(
				shareIDs.map(getTagsForShare)
			)
		)
	}

	const getAggregatedTagsForUser = async (userID: string): Promise<string[]> => {
		const linkedLibraries = await shareService.getLinkedLibrariesOfUser(userID)
		const aggregatedTags = await getTagsForShares(linkedLibraries.map(linkedLibrary => linkedLibrary.id))

		return aggregatedTags
	}

	return { getTagsForShare, getAggregatedTagsForUser };
}