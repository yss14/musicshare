import { create } from 'redux-react-hook';
import { IStoreSchema } from './store.schema';
import { Actions } from './create-store';
import { Store, AnyAction, Dispatch } from 'redux';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';

const { StoreContext: StoreContextOrig, useDispatch: useDispatchOrig, useMappedState: useMappedStateOrig } = create<
	IStoreSchema,
	AnyAction,
	Store<IStoreSchema, AnyAction>
>();

export const StoreContext = StoreContextOrig;
export const useMappedState = useMappedStateOrig;
export const useDispatch = () => {
	const dispatch = useDispatchOrig() as (Dispatch<Actions> & ThunkDispatch<IStoreSchema, void, Actions>);

	return <R>(action: Actions | ThunkAction<R, {}, {}, Actions>): R => dispatch(action as any); // TODO get rid of any
};
