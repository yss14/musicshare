import React, { useState, useCallback } from "react"
import { Share } from "@musicshare/shared-types"
import { Divider } from "antd"
import { GenreSettings } from "./GenreSettings"
import { SongTypeSettings } from "./SongTypeSettings"

interface IShareSettingsMetaDataProps {
	share: Share
}

export const ShareSettingsMetaData = ({ share }: IShareSettingsMetaDataProps) => {
	return (
		<div style={{ minHeight: 300 }}>
			<Divider orientation="left">Genres</Divider>
			<GenreSettings />
			<Divider orientation="left">Song Types</Divider>
			<SongTypeSettings />
		</div>
	)
}
