import { create } from 'redux-react-hook';
import { IStoreSchema } from './store.schema';
import { Actions } from './create-store';
import { Store, Action, AnyAction, Dispatch } from 'redux';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';

const { StoreContext: StoreContextOrig, useDispatch: useDispatchOrig, useMappedState: useMappedStateOrig } = create<
	IStoreSchema,
	AnyAction,
	Store<IStoreSchema, AnyAction>
>();

interface DispatchPropThunk<S, A extends Action = AnyAction> {
	dispatch: ThunkDispatch<S, void, A>;
}

export const StoreContext = StoreContextOrig;
export const useMappedState = useMappedStateOrig;
export const useDispatch = () => {
	const dispatch: Dispatch<Actions> | DispatchPropThunk<IStoreSchema, Actions> = useDispatchOrig();

	return <R>(action: Action<R> | ThunkAction<R, {}, {}, AnyAction>): R => dispatch(action as any);
};
