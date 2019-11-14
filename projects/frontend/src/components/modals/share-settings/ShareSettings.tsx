import React, { useState, useDebugValue, useEffect } from 'react'
import { Modal, Form, Input, Table, Button } from 'antd'
import { IShare, IUser } from '../../../graphql/types'
import { useDebounce } from 'use-debounce/lib'
import { useShareUsers } from '../../../graphql/queries/share-users-query'
import { ColumnProps } from 'antd/lib/table'
import Column from 'antd/lib/table/Column'

interface IShareSettingsProps {
	share: IShare;
	onClose: () => void;
}

export const ShareSettings: React.FC<IShareSettingsProps> = ({ share, onClose }) => {
	const canChangeName = share.userPermissions.includes('share:owner')
	const canInvite = share.userPermissions.includes('share:owner')

	return (
		<Modal
			okText="OK"
			cancelButtonProps={{ style: { display: 'none' } }}
			onOk={onClose}
			onCancel={onClose}
			visible={true}
			width={800}
		>
			<Form>
				{canChangeName && <ChangeSongName name={share.name} />}
				{canInvite && <ShareUsers shareID={share.id} />}
			</Form>
		</Modal>
	)
}

const ChangeSongName: React.FC<{ name: string }> = ({ name }) => {
	const [shareName, setShareName] = useState(name)
	const [debouncedShareName] = useDebounce(shareName, 1000)

	useEffect(() => {
		console.log('Change name')
	}, [debouncedShareName])

	return (
		<Form.Item
			label="Name"
			validateStatus={shareName.trim().length <= 2 ? 'error' : 'success'}
		>
			<Input
				value={shareName}
				type="text"
				onChange={e => setShareName(e.target.value)}
				placeholder="Share name"
			/>
		</Form.Item>
	)
}

const ShareUsers: React.FC<{ shareID: string }> = ({ shareID }) => {
	const { data: users, loading, error } = useShareUsers(shareID)
	const [email, setEMail] = useState('')

	if (loading) return <div>Loading</div>
	if (error) return <div>Error</div>

	return (
		<>
			<Form.Item label="Members">
				<Table dataSource={users || []} pagination={false}>
					<Column title="Name" dataIndex="name" key="name" />
					<Column title="E-Mail" dataIndex="email" key="email" />
					<Column title="Status" dataIndex="status" key="status" />
					<Column title="Permissions" dataIndex="permissions" key="permission" />
					<Column title="Actions" key="actions" render={(text, user: IUser) => (
						<>
							{user.status === 'pending' && <Button type="link">Revoke</Button>}
						</>
					)} />
				</Table>
			</Form.Item>
			<Form.Item label="E-Mail">
				<Input
					value={email}
					type="email"
					onChange={e => setEMail(e.target.value)}
					placeholder="example@domain.com"
					width={300}
				/>
				<Button type="dashed">Invite</Button>
			</Form.Item>
		</>
	)
}