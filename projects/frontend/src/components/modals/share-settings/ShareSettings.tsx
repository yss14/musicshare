import React, { useState, useEffect, useCallback, useMemo } from "react"
import { QuestionCircleOutlined } from "@ant-design/icons"
import { Modal, Input, Table, Button, Alert, Popconfirm, Typography, message, Form } from "antd"
import { IShare } from "../../../graphql/types"
import { useDebounce } from "use-debounce/lib"
import { useShareUsers } from "../../../graphql/queries/share-users-query"
import Column from "antd/lib/table/Column"
import { useInviteToShare } from "../../../graphql/mutations/invite-to-share-mutation"
import { ApolloError } from "apollo-client"
import { useRevokeInvitation } from "../../../graphql/mutations/revoke-invitation-mutation"
import { useRenameShare } from "../../../graphql/mutations/rename-share-mutation"
import { useDeleteShare } from "../../../graphql/mutations/delete-share-mutation"
import { useLeaveShare } from "../../../graphql/mutations/leave-share-mutation"
import { Permissions, UserStatus, IShareMember } from "@musicshare/shared-types"
import { useHistory } from "react-router-dom"
import { useLibraryID } from "../../../graphql/client/queries/libraryid-query"

const { Text } = Typography

interface IShareSettingsProps {
	share: IShare
	onClose: () => void
}

export const ShareSettings: React.FC<IShareSettingsProps> = ({ share, onClose }) => {
	const history = useHistory()
	const [deleteShare] = useDeleteShare({
		onCompleted: () => {
			message.success("Share successfully deleted")
			history.push("/")
			onClose()
		},
	})
	const [leaveShare] = useLeaveShare({
		onCompleted: () => {
			message.success("Share successfully left")
			history.push("/")
			onClose()
		},
	})
	const userLibraryID = useLibraryID()
	const isLibrary = share.id === userLibraryID
	const isOwner = useMemo(() => share.userPermissions.includes(Permissions.SHARE_OWNER), [share.userPermissions])
	const canChangeName = isLibrary || isOwner
	const canInvite = !isLibrary && isOwner

	const onLeaveDeleteClick = useCallback(() => {
		if (isOwner) {
			deleteShare(share.id)
		} else {
			leaveShare(share.id)
		}
	}, [isOwner, share.id, deleteShare, leaveShare])

	const cancelButton = (
		<Popconfirm
			title={
				isOwner
					? "Are you sure? This action cannot be undone (and is very unstable at the moment)!"
					: "Are you sure? This action will remove all referenced songs from your library and cannot be undone!"
			}
			icon={<QuestionCircleOutlined style={{ color: "red" }} />}
			onConfirm={onLeaveDeleteClick}
		>
			<Button danger>{isOwner ? "Delete Share" : "Leave Share"}</Button>
		</Popconfirm>
	)

	return (
		<Modal
			title="Share Settings"
			okText="OK"
			cancelText={!isLibrary ? cancelButton : null}
			onCancel={onClose}
			onOk={onClose}
			visible={true}
			width={800}
			cancelButtonProps={{
				style: { border: "none", padding: "0px", display: isLibrary ? "none" : "inline-block" },
				onClick: (e) => e.preventDefault(),
			}}
		>
			<Form>
				{canChangeName && <ChangeSongName share={share} />}
				{canInvite && <ShareUsers shareID={share.id} />}
				{!isOwner && <div>{"You've missing the required permission to edit share settings"}</div>}
			</Form>
		</Modal>
	)
}

const ChangeSongName: React.FC<{ share: IShare }> = ({ share: { name, id } }) => {
	const [shareName, setShareName] = useState(name)
	const [inputBlured, setInputBlured] = useState(false)
	const [debouncedShareName] = useDebounce(shareName, 1000)
	const [renameShare] = useRenameShare()

	useEffect(() => {
		if (inputBlured) {
			renameShare({
				variables: {
					shareID: id,
					name: debouncedShareName,
				},
			})
		}
	}, [debouncedShareName, id, renameShare, inputBlured])

	return (
		<Form.Item label="Name" validateStatus={shareName.trim().length <= 2 ? "error" : "success"}>
			<Input
				value={shareName}
				type="text"
				onChange={(e) => setShareName(e.target.value)}
				placeholder="Share name"
				onBlur={() => setInputBlured(true)}
			/>
		</Form.Item>
	)
}

const ShareUsers: React.FC<{ shareID: string }> = ({ shareID }) => {
	const { data: users, loading, error, refetch } = useShareUsers(shareID)
	const [email, setEMail] = useState("")
	const [invitationLink, setInvitationLink] = useState<string | null>(null)
	const [inviteError, setInviteError] = useState<ApolloError | null>(null)
	const [inviteToShare] = useInviteToShare({
		onCompleted: (data) => {
			if (data.inviteToShare !== null) {
				setInvitationLink(data.inviteToShare)
			}

			message.success(`User ${email} succesfully invited`)

			setEMail("")
			refetch()
		},
		onError: setInviteError,
	})
	const [revokeInvitation] = useRevokeInvitation({
		onCompleted: () => {
			refetch()
			setInvitationLink(null)

			message.success(`User invitation successfully revoked`)
		},
	})

	const onInviteClick = useCallback(() => {
		inviteToShare({
			variables: {
				input: {
					shareID,
					email,
				},
			},
		})
	}, [inviteToShare, shareID, email])

	const onRevokeInvitationClick = useCallback(
		(userID: string) => {
			revokeInvitation({
				variables: {
					input: {
						shareID,
						userID,
					},
				},
			})
		},
		[revokeInvitation, shareID],
	)

	if (error) return <div>Error</div>

	return (
		<>
			<Form.Item label="Members">
				<Table
					dataSource={users || []}
					pagination={false}
					loading={loading}
					scroll={{ y: 300 }}
					rowKey={(user) => user.id}
				>
					<Column title="Name" dataIndex="name" key="name" />
					<Column title="E-Mail" dataIndex="email" key="email" />
					<Column title="Status" dataIndex="status" key="status" />
					<Column
						title="Actions"
						key="actions"
						render={(text, user: IShareMember) => (
							<>
								{user.status === UserStatus.Pending && (
									<Button type="link" onClick={() => onRevokeInvitationClick(user.id)}>
										Revoke
									</Button>
								)}
							</>
						)}
					/>
				</Table>
			</Form.Item>
			{invitationLink && (
				<Alert
					message={
						<>
							<span>Invitation link: </span>
							<Text code>{invitationLink}</Text>
						</>
					}
					type="success"
					closable
					onClose={() => setInvitationLink(null)}
				/>
			)}
			{inviteError && (
				<Alert
					message={inviteError.message.replace("GraphQL error: ", "")}
					type="error"
					closable
					onClose={() => setInviteError(null)}
				/>
			)}
			<Form.Item label="E-Mail">
				<Input
					value={email}
					type="email"
					onChange={(e) => setEMail(e.target.value)}
					placeholder="example@domain.com"
					width={300}
				/>
				<Button type="dashed" onClick={onInviteClick}>
					Invite
				</Button>
			</Form.Item>
		</>
	)
}
