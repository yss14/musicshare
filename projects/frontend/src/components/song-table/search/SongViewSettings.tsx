import React, { useEffect } from "react"
import usePersistentState from "use-local-storage-state"
import { TableOutlined } from "@ant-design/icons"
import { Form } from "@ant-design/compatible"
import "@ant-design/compatible/assets/index.css"
import { Popover, Button, Select } from "antd"
import styled from "styled-components"

const StyledPopover = styled(Popover)`
	align-self: flex-end;
	margin-right: 16px;
`

export interface ISongViewSettings {
	columnKeys: string[]
}

interface ISongViewSettingsProps {
	onChange: (newSettings: ISongViewSettings) => void
}

export const SongViewSettings: React.FC<ISongViewSettingsProps> = ({ onChange }) => {
	const [columnKeys, setColumnKeys] = usePersistentState<string[]>("songview.settings.columnKeys", [
		"duration",
		"artists",
		"genres",
	])

	useEffect(() => {
		onChange({
			columnKeys,
		})
	}, [onChange, columnKeys])

	const content = (
		<Form.Item label="Columns">
			<Select
				mode="tags"
				placeholder="Select columns"
				value={columnKeys}
				onChange={(newColumns: string[]) => setColumnKeys(newColumns)}
				style={{ width: 300 }}
			>
				<Select.Option value="duration">Duration</Select.Option>
				<Select.Option value="artists">Artists</Select.Option>
				<Select.Option value="genres">Genres</Select.Option>
				<Select.Option value="tags">Tags</Select.Option>
				<Select.Option value="labels">Labels</Select.Option>
				<Select.Option value="release_date">Release Date</Select.Option>
				<Select.Option value="date_added">Date Added</Select.Option>
				<Select.Option value="play_count">Plays</Select.Option>
			</Select>
		</Form.Item>
	)

	return (
		<StyledPopover placement="bottom" title={"View Settings"} content={content} trigger="click">
			<Button icon={<TableOutlined />} title="Song View Settings" />
		</StyledPopover>
	)
}
