import { IShareService, ShareNotFoundError } from "../../services/ShareService";
import { Share } from "../../models/ShareModel";

export class ShareServiceMock implements IShareService {
	constructor(
		private readonly shares: Share[]
	) { }

	public async getSharesByUser(userID: string): Promise<Share[]> {
		return this.shares.filter(share => share.userID === userID);
	}

	public async getShareByID(id: string): Promise<Share> {
		const share = this.shares.find(share => share.id === id);

		if (!share) {
			throw new ShareNotFoundError(id);
		}

		return share;
	}
}