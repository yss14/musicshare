import React, { useState, useEffect, useCallback } from "react"
import { Share, ShareMember, Permission, UserStatus, Permissions } from "@musicshare/shared-types"
import { useDebounce } from "use-debounce/lib"
import {
	useRenameShare,
	useShareUsers,
	useInviteToShare,
	useRevokeInvitation,
	useUpdateShareMemberPermissions,
} from "@musicshare/react-graphql-client"
import { Input, message, Table, Button, Alert, Typography, Form } from "antd"
import Column from "antd/lib/table/Column"
import { EditableTagGroup } from "../../form/EditableTagGroup"
import styled from "styled-components"

const { Text } = Typography

const FormItemVertical = styled(Form.Item)`
	flex-direction: column;

	& .ant-col {
		text-align: left;
	}
`

interface IShareSettingsGeneralProps {
	share: Share
	isLibrary: boolean
	isOwner: boolean
}

export const ShareSettingsGeneral = ({ share, isLibrary, isOwner }: IShareSettingsGeneralProps) => {
	const canChangeName = isLibrary || isOwner
	const canEdit = !isLibrary && isOwner

	return (
		<Form>
			{canChangeName && <ChangeSongName share={share} />}
			<ShareUsers shareID={share.id} canEdit={canEdit} />
		</Form>
	)
}

const ChangeSongName: React.FC<{ share: Share }> = ({ share: { name, id, userPermissions } }) => {
	const [shareName, setShareName] = useState(name)
	const [inputBlured, setInputBlured] = useState(false)
	const [debouncedShareName] = useDebounce(shareName, 1000)
	const { mutate: renameShare } = useRenameShare({
		onError: (err) => {
			message.error(err.message)
		},
	})

	useEffect(() => {
		if (inputBlured) {
			renameShare({
				shareID: id,
				name: debouncedShareName,
			})
		}
	}, [debouncedShareName, id, renameShare, inputBlured])

	return (
		<FormItemVertical label="Name" validateStatus={shareName.trim().length <= 2 ? "error" : "success"}>
			<Input
				value={shareName}
				type="text"
				onChange={(e) => setShareName(e.target.value)}
				placeholder="Share name"
				onBlur={() => setInputBlured(true)}
				disabled={!userPermissions.includes(Permissions.SHARE_OWNER)}
			/>
		</FormItemVertical>
	)
}

const ShareUsers: React.FC<{ shareID: string; canEdit: boolean }> = ({ shareID, canEdit }) => {
	const { data: users, isLoading, error } = useShareUsers(shareID)
	const [email, setEMail] = useState("")
	const [invitationLink, setInvitationLink] = useState<string | null>(null)
	const [inviteError, setInviteError] = useState<string | null>(null)
	const { mutate: inviteToShare } = useInviteToShare({
		onSuccess: (invitationLink) => {
			if (invitationLink !== null) {
				setInvitationLink(invitationLink)
			}

			message.success(`User ${email} succesfully invited`)

			setEMail("")
		},
		onError: (err) => setInviteError(err.message),
	})
	const { mutate: revokeInvitation } = useRevokeInvitation({
		onSuccess: () => {
			setInvitationLink(null)

			message.success(`User invitation successfully revoked`)
		},
		onError: (err) => {
			message.error(err.message)
		},
	})
	const { mutate: updatePermissions } = useUpdateShareMemberPermissions({
		onError: (err) => {
			message.error(err.message)
		},
	})

	const onInviteClick = useCallback(() => {
		inviteToShare({
			input: {
				shareID,
				email,
			},
		})
	}, [inviteToShare, shareID, email])

	const onRevokeInvitationClick = useCallback(
		(userID: string) => {
			revokeInvitation({
				input: {
					shareID,
					userID,
				},
			})
		},
		[revokeInvitation, shareID],
	)

	const onPermissionsValueChange = useCallback(
		(user: ShareMember, permissions: string[]) => {
			if (permissions.every((perm) => Permissions.ALL.includes(perm as Permission))) {
				updatePermissions({
					permissions,
					userID: user.id,
					shareID: user.shareID,
				})
			}
		},
		[updatePermissions],
	)

	if (error) return <div>{error.message}</div>

	return (
		<>
			<FormItemVertical label="Members">
				<Table
					dataSource={users || []}
					pagination={false}
					loading={isLoading}
					scroll={{ y: 300 }}
					rowKey={(user) => user.id}
				>
					<Column title="Name" dataIndex="name" key="name" />
					<Column title="E-Mail" dataIndex="email" key="email" />
					{canEdit && <Column title="Status" dataIndex="status" key="status" width={100} />}
					{canEdit && (
						<Column
							title="Actions"
							key="actions"
							width={120}
							render={(_, user: ShareMember) => (
								<>
									{user.status === UserStatus.Pending && (
										<Button type="link" onClick={() => onRevokeInvitationClick(user.id)}>
											Revoke
										</Button>
									)}
								</>
							)}
						/>
					)}
					{canEdit && (
						<Column
							title="Permissions"
							key="permissions"
							render={(_, user: ShareMember) => {
								return (
									<EditableTagGroup
										values={user.permissions || []}
										placeholder="Permissions"
										datasource={Permissions.ALL}
										onValuesChange={(permissions) => onPermissionsValueChange(user, permissions)}
									/>
								)
							}}
						/>
					)}
				</Table>
			</FormItemVertical>
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
					message={inviteError.replace("GraphQL error: ", "")}
					type="error"
					closable
					onClose={() => setInviteError(null)}
				/>
			)}
			{canEdit && (
				<FormItemVertical label="E-Mail">
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
				</FormItemVertical>
			)}
		</>
	)
}
