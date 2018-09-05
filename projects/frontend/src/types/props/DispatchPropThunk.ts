import { Action, AnyAction } from "redux";
import { ThunkDispatch } from "redux-thunk";

// tslint:disable-next-line:interface-name
export interface DispatchPropThunk<S, A extends Action = AnyAction> {
	dispatch: ThunkDispatch<S, void, A>;
}