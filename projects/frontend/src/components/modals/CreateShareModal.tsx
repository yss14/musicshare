import React, { useCallback, useState } from 'react'
import { useCreateShare } from '../../graphql/mutations/create-share-mutation'
import { Prompt } from './promt/Prompt'
import { useHistory } from 'react-router-dom'
import { IShare } from '../../graphql/types'

interface ICreateShareModalProps {
	onSubmit: () => void;
	onCancel: () => void;
}

export const CreateShareModal: React.FC<ICreateShareModalProps> = ({ onSubmit, onCancel }) => {
	const history = useHistory()
	const onShareCreated = useCallback((share: IShare) => {
		history.push(`/shares/${share.id}`)
		onSubmit()
	}, [history, onSubmit])
	const [createShare] = useCreateShare({
		onCompleted: data => onShareCreated(data.createShare),
	})
	const [name, setName] = useState('')

	const onCreateShare = useCallback(() => {
		createShare({
			variables: { name },
		})
	}, [createShare, name])

	return (
		<Prompt
			onChange={e => setName(e.target.value)}
			onSubmit={onCreateShare}
			onCancel={onCancel}
			title="Create new share"
			label="Share name"
			placeholder="Some new share"
			value={name}
			validationError={name.trim().length < 2 ? 'Min. 2 characters' : undefined}
		/>
	)
}