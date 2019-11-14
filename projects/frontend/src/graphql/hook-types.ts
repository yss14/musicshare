export interface IMutationOptions<TData = unknown> {
	onCompleted?: (data: TData) => any;
}
