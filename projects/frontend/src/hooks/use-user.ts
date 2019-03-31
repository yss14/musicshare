import { useMappedState } from "../redux/custom-store-hooks";

export const useUser = () => {
	const { user } = useMappedState(state => ({
		user: state.user,
	}));

	return user;
}