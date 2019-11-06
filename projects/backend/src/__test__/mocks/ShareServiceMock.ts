import { IShareService, ShareNotFoundError } from "../../services/ShareService";
import { Share } from "../../models/ShareModel";

export class ShareServiceMock implements IShareService {
	constructor(
		private readonly shares: Share[]
	) { }

	public async getSharesOfUser(): Promise<Share[]> {
		throw 'Not implemented yet';
	}

	public async getShareByID(id: string): Promise<Share> {
		const share = this.shares.find(share => share.id === id);

		if (!share) {
			throw new ShareNotFoundError(id);
		}

		return share;
	}

	public async addUser(): Promise<void> {
		throw 'Not implemented yet';
	}

	public async getLinkedLibrariesOfUser(userID: string): Promise<Share[]> {
		throw 'Not implemented yet';
	}

	public async create(): Promise<Share> {
		throw 'Not implemented yet';
	}
}