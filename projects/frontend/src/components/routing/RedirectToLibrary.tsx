import React from 'react'
import { IShare } from '../../graphql/types'
import { Redirect } from 'react-router-dom'

interface IRedirectToLibraryProps {
	shares: IShare[];
}

export const RedirectToLibrary: React.FC<IRedirectToLibraryProps> = ({ shares }) => {
	const libraryShare = shares.find(share => share.isLibrary === true)

	if (libraryShare) {
		return <Redirect to={`/shares/${libraryShare.id}`} />
	} else {
		return <Redirect to="/login" />
	}
}