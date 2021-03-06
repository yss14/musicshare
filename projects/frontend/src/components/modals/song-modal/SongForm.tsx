import { useMemo, useCallback } from "react"
import { Formik } from "formik"
import { Input, Row, Col, DatePicker, Switch, Modal, Select, Form, message } from "antd"
import { EditableTagGroup } from "../../form/EditableTagGroup"
import moment from "moment"
import { buildSongName } from "../../../utils/songname-builder"
import styled from "styled-components"
import { ShareSong, SongUpdateInput, Nullable, Genre, SongType, Artist } from "@musicshare/shared-types"
import { useUpdateSong } from "@musicshare/react-graphql-client"
import { groupBy } from "lodash"

const StyledModal = styled(Modal)`
	& .ant-form-item-label {
		line-height: 20px;
	}

	& .ant-row.ant-form-item {
		margin-bottom: 4px;
	}
`

interface ISongFormProps {
	song: ShareSong
	genres: Genre[]
	songTypes: SongType[]
	artists: Artist[]
	tags: string[]
	playlistID?: string
	closeForm: () => void
	readOnly?: boolean
}

export const SongForm = ({
	song,
	songTypes,
	genres,
	artists,
	closeForm,
	tags,
	playlistID,
	readOnly,
}: ISongFormProps) => {
	const artistsDataSource = useMemo(() => artists.map((artist) => artist.name), [artists])
	const genresDataSource = useMemo(() => genres.map((genre) => genre.name), [genres])
	const songTypeGroups = useMemo(
		() =>
			Object.fromEntries(
				Object.entries(groupBy(songTypes, (songType) => songType.group))
					.sort((lhs, rhs) => lhs[0].localeCompare(rhs[0]))
					.map(([key, values]) => [key, values.sort((lhs, rhs) => lhs.name.localeCompare(rhs.name))]),
			),
		[songTypes],
	)

	const { mutate: updateSongMutation, isLoading } = useUpdateSong(playlistID, {
		onSuccess: () => {
			closeForm()
		},
		onError: (err) => {
			message.error(err.message)
		},
	})

	const updateSong = useCallback(
		(values: ShareSong) => {
			updateSongMutation({
				shareID: song.libraryID,
				songID: song.id,
				song: makeSongInput(values),
			})
		},
		[updateSongMutation, song.libraryID, song.id],
	)

	return (
		<Formik initialValues={song} onSubmit={updateSong} validate={validateSong} initialErrors={validateSong(song)}>
			{({ values, errors, handleChange, handleBlur, setFieldValue, submitForm }) => {
				return (
					<StyledModal
						title={buildSongName(song)}
						visible={true}
						onCancel={closeForm}
						onOk={submitForm}
						width={700}
						okText={readOnly ? "OK" : "Save"}
						okButtonProps={{ loading: isLoading }}
					>
						<Form>
							<Form.Item label="Title" validateStatus={errors.title ? "error" : "success"}>
								<Input
									placeholder="Song title"
									name="title"
									value={values.title}
									onChange={handleChange}
									onBlur={handleBlur}
									readOnly={readOnly}
								/>
							</Form.Item>
							<Form.Item label="Artists">
								<EditableTagGroup
									values={values.artists}
									onValuesChange={(newValues) => setFieldValue("artists", newValues)}
									placeholder="Add artist"
									datasource={artistsDataSource}
									readOnly={readOnly}
								/>
							</Form.Item>
							<Form.Item label="Remixer">
								<EditableTagGroup
									values={values.remixer}
									onValuesChange={(newValues) => setFieldValue("remixer", newValues)}
									placeholder="Add remixer"
									datasource={artistsDataSource}
									readOnly={readOnly}
								/>
							</Form.Item>
							<Form.Item label="Featurings">
								<EditableTagGroup
									values={values.featurings}
									onValuesChange={(newValues) => setFieldValue("featurings", newValues)}
									placeholder="Add featurings"
									datasource={artistsDataSource}
									readOnly={readOnly}
								/>
							</Form.Item>
							<Row>
								<Col span={12} style={{ paddingRight: 20 }}>
									<Form.Item label="Genres">
										<EditableTagGroup
											values={values.genres}
											onValuesChange={(newValues) => setFieldValue("genres", newValues)}
											placeholder="Add genre"
											datasource={genresDataSource}
											readOnly={readOnly}
										/>
									</Form.Item>
								</Col>
								<Col span={12} style={{ paddingRight: 20 }}>
									<Form.Item label="Suffix" validateStatus={errors.suffix ? "error" : "success"}>
										<Input
											placeholder="Song suffix"
											name="suffix"
											value={values.suffix || ""}
											onChange={handleChange}
											onBlur={handleBlur}
											readOnly={readOnly}
										/>
									</Form.Item>
								</Col>
							</Row>
							<Row>
								<Col span={12} style={{ paddingRight: 20 }}>
									<Form.Item label="Year" validateStatus={errors.year ? "error" : "success"}>
										<Input
											placeholder="Year"
											name="year"
											value={values.year || ""}
											onChange={handleChange}
											onBlur={handleBlur}
											type="number"
											readOnly={readOnly}
										/>
									</Form.Item>
								</Col>
								<Col span={12} style={{ paddingRight: 20 }}>
									<Form.Item label="BPM" validateStatus={errors.bpm ? "error" : "success"}>
										<Input
											placeholder="BPM"
											name="bpm"
											value={values.bpm || ""}
											onChange={handleChange}
											onBlur={handleBlur}
											type="number"
											readOnly={readOnly}
										/>
									</Form.Item>
								</Col>
							</Row>
							<Row>
								<Col span={12} style={{ paddingRight: 20 }}>
									<Form.Item
										label="Type"
										validateStatus={errors.type ? "error" : "success"}
										hasFeedback={!!errors.type}
									>
										<Select
											value={values.type || ""}
											onSelect={(value: string) => setFieldValue("type", value)}
											disabled={readOnly}
											style={{ width: 200 }}
										>
											{Object.entries(songTypeGroups).map(([group, songTypes]) => (
												<Select.OptGroup key={group} label={group}>
													{songTypes.map((songType) => (
														<Select.Option key={songType.id} value={songType.name}>
															{songType.name}
														</Select.Option>
													))}
												</Select.OptGroup>
											))}
										</Select>
									</Form.Item>
								</Col>
								<Col span={12} style={{ paddingRight: 20 }}>
									<Form.Item
										label="Release Date"
										validateStatus={errors.releaseDate ? "error" : "success"}
									>
										<DatePicker
											value={values.releaseDate ? moment(values.releaseDate) : undefined}
											onChange={(e) => setFieldValue("releaseDate", e!.toISOString())}
											placeholder="Release Date"
											disabled={readOnly}
										/>
									</Form.Item>
								</Col>
							</Row>
							<Row>
								<Col span={12} style={{ paddingRight: 20 }}>
									<Form.Item label="Is rip" validateStatus={errors.isRip ? "error" : "success"}>
										<Switch
											checked={values.isRip}
											onChange={(e) => setFieldValue("isRip", e)}
											disabled={readOnly}
										/>
									</Form.Item>
								</Col>
							</Row>
							<Row>
								<Col span={12} style={{ paddingRight: 20 }}>
									<Form.Item label="Tags">
										<EditableTagGroup
											values={values.tags}
											onValuesChange={(newValues) => setFieldValue("tags", newValues)}
											placeholder="Add tag"
											datasource={tags}
											readOnly={readOnly}
										/>
									</Form.Item>
								</Col>
								<Col span={12} style={{ paddingRight: 20 }}>
									<Form.Item label="Record Labels">
										<EditableTagGroup
											values={values.labels}
											onValuesChange={(newValues) => setFieldValue("labels", newValues)}
											placeholder="Add label"
											readOnly={readOnly}
										/>
									</Form.Item>
								</Col>
							</Row>
						</Form>
					</StyledModal>
				)
			}}
		</Formik>
	)
}

const validateSong = (data: ShareSong) => {
	let errors: any = {}

	if (data.title.trim().length === 0) {
		errors.title = "Required"
	}

	if (data.year && (data.year < 1500 || data.year > 2100)) {
		errors.year = "Invalid year"
	}

	if (data.bpm && (data.bpm < 50 || data.bpm > 200)) {
		errors.bpm = "Invalid bpm"
	}

	if (!data.type || data.type.length === 0) {
		errors.type = "No type selected"
	}

	return errors
}

const removeTypename = <O extends {}>(obj: O): O => {
	const value = obj as any

	delete value.__typename

	return value
}

const makeSongInput = (song: ShareSong): Nullable<SongUpdateInput> => {
	const allowedProperties = [
		"title",
		"suffix",
		"year",
		"bpm",
		"releaseDate",
		"isRip",
		"artists",
		"remixer",
		"featurings",
		"type",
		"genres",
		"labels",
		"tags",
	]

	const songInput: Nullable<SongUpdateInput> = Object.entries(song).reduce((acc, [key, value]) => {
		if (allowedProperties.includes(key)) {
			acc[key] = value
		}

		return acc
	}, {})

	return removeTypename(songInput)
}
