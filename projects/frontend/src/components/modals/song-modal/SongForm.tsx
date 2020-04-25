import React, { useMemo, useCallback } from "react"
import "./song-modal.css"
import { IGenre, ISongType, IArtist, IScopedSong } from "../../../graphql/types"
import { Formik } from "formik"
import { Form, Input, Row, Col, DatePicker, Switch, Modal, Select } from "antd"
import { EditableTagGroup } from "../../form/EditableTagGroup"
import moment from "moment"
import {
	UPDATE_SONG,
	ISongUpdateInput,
	IUpdateSongData,
	makeUpdateSongCache,
} from "../../../graphql/mutations/update-song-mutation"
import { Nullable } from "../../../types/Nullable"
import { buildSongName } from "../../../utils/songname-builder"
import { MutationUpdaterFn } from "apollo-client"
import { useMutation } from "react-apollo"

interface ISongFormProps {
	song: IScopedSong
	genres: IGenre[]
	songTypes: ISongType[]
	artists: IArtist[]
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
	const songTypeOptions = useMemo(
		() => songTypes.map((songType) => ({ value: songType.name, label: songType.name })),
		[songTypes],
	)

	const updateSongCache = makeUpdateSongCache(song.libraryID, playlistID)

	const songMutationOnUpdate: MutationUpdaterFn<IUpdateSongData> = (cache, data) => {
		updateSongCache(cache, data)
		closeForm()
	}

	const [updateSongMutation, { loading }] = useMutation(UPDATE_SONG, { update: songMutationOnUpdate })

	const updateSong = useCallback(
		(values: IScopedSong) => {
			updateSongMutation({
				variables: {
					shareID: song.libraryID,
					songID: song.id,
					song: makeSongInput(values),
				},
			})
		},
		[updateSongMutation, song.libraryID, song.id],
	)

	return (
		<Formik initialValues={song} onSubmit={updateSong} validate={validateSong} initialErrors={validateSong(song)}>
			{({ values, errors, handleChange, handleBlur, setFieldValue, submitForm }) => {
				return (
					<Modal
						title={buildSongName(song)}
						visible={true}
						onCancel={closeForm}
						onOk={submitForm}
						width={700}
						okText={readOnly ? "OK" : "Save"}
						okButtonProps={{ loading }}
					>
						<div id="songmodal">
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
												value={values.type}
												onSelect={(value: string | null) => setFieldValue("type", value)}
												disabled={readOnly}
												style={{ width: 200 }}
											>
												{songTypeOptions.map((songType) => (
													<Select.Option key={songType.value} value={songType.value}>
														{songType.label}
													</Select.Option>
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
										<Form.Item label="Labels">
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
						</div>
					</Modal>
				)
			}}
		</Formik>
	)
}

const validateSong = (data: IScopedSong) => {
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

const makeSongInput = (song: IScopedSong): Nullable<ISongUpdateInput> => {
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

	const songInput: Nullable<ISongUpdateInput> = Object.entries(song).reduce((acc, [key, value]) => {
		if (allowedProperties.includes(key)) {
			acc[key] = value
		}

		return acc
	}, {})

	return removeTypename(songInput)
}
