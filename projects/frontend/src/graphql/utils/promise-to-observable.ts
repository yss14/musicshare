import { Observable } from "apollo-link";

export const promiseToObservable = <T>(promise: Promise<T>) =>
	new Observable<T>((subscriber): any => {
		promise.then(
			(value) => {
				if (subscriber.closed) return;
				subscriber.next(value);
				subscriber.complete();
			},
			err => subscriber.error(err)
		);
		return subscriber;
	});