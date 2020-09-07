import React, { useCallback, useState } from "react"
import { Prompt } from "./promt/Prompt"
import { useHistory } from "react-router-dom"
import { message, Alert } from "antd"
import { useCreateShare } from "@musicshare/react-graphql-client"
import { Share } from "@musicshare/shared-types"

interface ICreateShareModalProps {
	onSubmit: () => void
	onCancel: () => void
}

export const CreateShareModal: React.FC<ICreateShareModalProps> = ({ onSubmit, onCancel }) => {
	const history = useHistory()
	const onShareCreated = useCallback(
		(share: Share) => {
			history.push(`/shares/${share.id}`)
			onSubmit()
			message.success("Share successfully created")
		},
		[history, onSubmit],
	)
	const [createShare] = useCreateShare({
		onSuccess: (data) => onShareCreated(data),
	})
	const [name, setName] = useState("")

	const onCreateShare = useCallback(() => {
		createShare({
			name,
		})
	}, [createShare, name])

	return (
		<Prompt
			onChange={(e) => setName(e.target.value)}
			onSubmit={onCreateShare}
			onCancel={onCancel}
			title="Create new share"
			label="Share name"
			placeholder="Some new share"
			value={name}
			validationError={name.trim().length < 2 ? "Min. 2 characters" : undefined}
			hint={<Alert type="info" message="A share makes your library available to all (future) share memebers." />}
		/>
	)
}
