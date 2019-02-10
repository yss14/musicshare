import { ISongUploadProcessingQueue } from "../../job-queues/SongUploadProcessingQueue";

export class SongUploadProcessingQueueMock implements ISongUploadProcessingQueue {
	// tslint:disable-next-line:no-empty
	public async enqueueUpload() { }
}