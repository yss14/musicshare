export interface ICreateBlockBlobRequestOptions {
	/**
	 * {LocationMode}  Specifies the location mode used to decide which location the request should be sent to.
	 */
	//locationMode?: StorageUtilities.LocationMode;
	/**
	 * {int} The server timeout interval, in milliseconds, to use for the request.
	 */
	timeoutIntervalInMs?: number
	/**
	 * {int} The timeout of client requests, in milliseconds, to use for the request.
	 */
	clientRequestTimeoutInMs?: number
	/**
	 * {int} The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
	 */
	maximumExecutionTimeInMs?: number
	/**
	 * {bool} Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
	 */
	useNagleAlgorithm?: boolean
	/**
	 * {string} A string that represents the client request ID with a 1KB character limit.
	 */
	clientRequestId?: string

	//accessConditions?: AccessConditions;

	snapshotId?: string // TODO: Not valid for most write requests...
	leaseId?: string

	//speedSummary?: common.streams.speedsummary.SpeedSummary;
	parallelOperationThreadCount?: number
	useTransactionalMD5?: boolean
	blockIdPrefix?: string
	metadata?: { [k: string]: string }
	storeBlobContentMD5?: boolean
	transactionalContentMD5?: string
	contentSettings?: {
		contentType?: string
		contentEncoding?: string
		contentLanguage?: string
		cacheControl?: string
		contentDisposition?: string
		contentMD5?: string
	}

	blockSize?: number
}
