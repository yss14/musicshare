import React from "react"
import { Redirect } from "react-router-dom"
import { Share } from "@musicshare/shared-types"

interface IRedirectToLibraryProps {
	shares: Share[]
}

export const RedirectToLibrary: React.FC<IRedirectToLibraryProps> = ({ shares }) => {
	const libraryShare = shares.find((share) => share.isLibrary === true)

	if (libraryShare) {
		return <Redirect to={`/shares/${libraryShare.id}`} />
	} else {
		return <Redirect to="/login" />
	}
}
