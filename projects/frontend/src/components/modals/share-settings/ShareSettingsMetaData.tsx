import { Divider, Alert } from "antd"
import { GenreSettings } from "./GenreSettings"
import { SongTypeSettings } from "./SongTypeSettings"

export const ShareSettingsMetaData = () => {
	return (
		<div style={{ minHeight: 300 }}>
			<Alert
				type="info"
				message="Changes to Genres and Song Types are not applied to existing songs. Furthermore, edit Song Types with care, because they are incoporated during the meta data processing of newly uploaded files."
			/>
			<Divider orientation="left">Genres</Divider>
			<GenreSettings />
			<Divider orientation="left">Song Types</Divider>
			<SongTypeSettings />
		</div>
	)
}
