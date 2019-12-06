export interface ITimestamped {
	timestamp: Date;
}

export interface ITimedstampedResult<T> extends ITimestamped {
	node: T;

}

export interface ITimedstampedResults<T> extends ITimestamped {
	nodes: T[];
}
