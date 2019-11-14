import React, { useCallback, useState } from 'react'
import { Modal } from 'antd'
import { useCreateShare } from '../../graphql/mutations/create-share-mutation'
import { Prompt } from './promt/Prompt'

interface ICreateShareModalProps {
	onSubmit: () => void;
	onCancel: () => void;
}

export const CreateShareModal: React.FC<ICreateShareModalProps> = ({ onSubmit, onCancel }) => {
	const [createShare] = useCreateShare({
		onCompleted: onSubmit,
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