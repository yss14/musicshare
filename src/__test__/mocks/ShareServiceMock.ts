import { IShareService, ShareNotFoundError } from "../../services/ShareService";
import { Share } from "../../models/share.model";
import { User } from "../../models/user.model";

export class ShareServiceMock implements IShareService {
	constructor(
		private readonly shares: Share[]
	) { }

	public async getSharesByUser(user: User): Promise<Share[]> {
		return this.shares.filter(share => share.userID === user.id);
	}

	public async getShareByID(id: string): Promise<Share> {
		const share = this.shares.find(share => share.id === id);

		if (!share) {
			throw new ShareNotFoundError(id);
		}

		return share;
	}
}