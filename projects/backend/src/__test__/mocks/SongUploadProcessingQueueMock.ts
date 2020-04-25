import { ISongUploadProcessingQueue } from "../../job-queues/SongUploadProcessingQueue"

export class SongUploadProcessingQueueMock implements ISongUploadProcessingQueue {
	public async enqueueUpload() {
		return ""
	}
}
