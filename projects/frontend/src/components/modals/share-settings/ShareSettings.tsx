import React, { useCallback, useMemo, useState } from "react"
import { QuestionCircleOutlined } from "@ant-design/icons"
import { Modal, Button, Popconfirm, message, Tabs } from "antd"
import { useLeaveShare, useDeleteShare } from "@musicshare/react-graphql-client"
import { Permissions, Share } from "@musicshare/shared-types"
import { useHistory } from "react-router-dom"
import { useLibraryID } from "../../../hooks/data/useLibraryID"
import { ShareSettingsGeneral } from "./ShareSettingsGeneral"
import { ShareSettingsMetaData } from "./ShareSettingsMetaData"

const { TabPane } = Tabs

type ShareSettingsTab = "general" | "metadata"

interface IShareSettingsProps {
	share: Share
	onClose: () => void
}

export const ShareSettings: React.FC<IShareSettingsProps> = ({ share, onClose }) => {
	const [tab, setTab] = useState<ShareSettingsTab>("general")
	const history = useHistory()
	const [deleteShare] = useDeleteShare({
		onSuccess: () => {
			message.success("Share successfully deleted")
			history.push("/")
			onClose()
		},
	})
	const [leaveShare] = useLeaveShare({
		onSuccess: () => {
			message.success("Share successfully left")
			history.push("/")
			onClose()
		},
	})
	const userLibraryID = useLibraryID()
	const isLibrary = share.id === userLibraryID
	const isOwner = useMemo(() => share.userPermissions.includes(Permissions.SHARE_OWNER), [share.userPermissions])

	const onLeaveDeleteClick = useCallback(() => {
		if (isOwner) {
			deleteShare({ shareID: share.id })
		} else {
			leaveShare({ input: { shareID: share.id } })
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
			title={`${isLibrary ? "Library" : "Share"} Settings`}
			okText="OK"
			cancelText={!isLibrary ? cancelButton : null}
			onCancel={onClose}
			onOk={onClose}
			visible={true}
			width="90%"
			style={{ maxWidth: "1200px" }}
			cancelButtonProps={{
				style: { border: "none", padding: "0px", display: isLibrary ? "none" : "inline-block" },
				onClick: (e) => e.preventDefault(),
			}}
		>
			<Tabs defaultActiveKey={tab} activeKey={tab} onChange={(tabKey) => setTab(tabKey as ShareSettingsTab)}>
				<TabPane tab="General" key="general">
					<ShareSettingsGeneral share={share} isLibrary={isLibrary} isOwner={isOwner} />
				</TabPane>
				{isLibrary && (
					<TabPane tab="Meta Data" key="metadata">
						<ShareSettingsMetaData />
					</TabPane>
				)}
			</Tabs>
		</Modal>
	)
}
