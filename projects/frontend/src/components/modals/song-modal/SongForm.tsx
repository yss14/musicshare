import React, { useMemo } from 'react';
import './song-modal.css';
import { IShareSong, IGenre, ISongType, IArtist } from '../../../graphql/types';
import { Formik } from 'formik';
import { Form, Input, Row, Col, DatePicker, Switch, Modal } from 'antd';
import { EditableTagGroup } from '../../form/EditableTagGroup';
import moment from 'moment';
import { Dropdown } from '../../form/Dropdown';
import { UpdateSongMutation, UPDATE_SONG, ISongUpdateInput, IUpdateSongData, makeUpdateSongCache } from '../../../graphql/mutations/update-song-mutation';
import { Nullable } from '../../../types/Nullable';
import { buildSongName } from '../../../utils/songname-builder';
import { MutationUpdaterFn } from 'apollo-client';

interface ISongFormProps {
	shareID: string;
	song: IShareSong;
	genres: IGenre[];
	songTypes: ISongType[];
	artists: IArtist[];
	tags: string[];
	playlistID?: string;
	closeForm: () => void;
}

export const SongForm = ({ song, songTypes, genres, artists, shareID, closeForm, tags, playlistID }: ISongFormProps) => {

	const artistsDataSource = useMemo(() => artists.map(artist => artist.name), [artists]);
	const genresDataSource = useMemo(() => genres.map(genre => genre.name), [genres]);
	const songTypeOptions = useMemo(() => songTypes.map(songType => ({ value: songType.name, label: songType.name })), [songTypes]);

	const updateSongCache = makeUpdateSongCache(shareID, playlistID);

	const songMutationOnUpdate: MutationUpdaterFn<IUpdateSongData> = (cache, data) => {
		updateSongCache(cache, data);
		closeForm();
	}

	return (
		<UpdateSongMutation mutation={UPDATE_SONG} update={songMutationOnUpdate}>
			{(updateSong, { loading }) => (
				<Formik initialValues={song} onSubmit={(values) => updateSong({ variables: { shareID, songID: song.id, song: makeSongInput(values) } })} validate={validateSong}>
					{({
						values,
						errors,
						handleChange,
						handleBlur,
						setFieldValue,
						submitForm
					}) => {
						return (
							<Modal
								title={buildSongName(song)}
								visible={true}
								onCancel={closeForm}
								onOk={submitForm}
								width={700}
								okText="Save"
								okButtonProps={{ loading }}
							>
								<div id="songmodal">
									<Form>
										<Form.Item
											label="Title"
											validateStatus={errors.title ? 'error' : 'success'}
										>
											<Input
												placeholder="Song title"
												name="title"
												value={values.title}
												onChange={handleChange}
												onBlur={handleBlur}
											/>
										</Form.Item>
										<Form.Item label="Artists">
											<EditableTagGroup
												values={values.artists}
												onValuesChange={newValues => setFieldValue('artists', newValues)}
												placeholder="Add artist"
												datasource={artistsDataSource}

											/>
										</Form.Item>
										<Form.Item label="Remixer">
											<EditableTagGroup
												values={values.remixer}
												onValuesChange={newValues => setFieldValue('remixer', newValues)}
												placeholder="Add remixer"
												datasource={artistsDataSource}
											/>
										</Form.Item>
										<Form.Item label="Featurings">
											<EditableTagGroup
												values={values.featurings}
												onValuesChange={newValues => setFieldValue('featurings', newValues)}
												placeholder="Add featurings"
												datasource={artistsDataSource}
											/>
										</Form.Item>
										<Row>
											<Col span={12} style={{ paddingRight: 20 }}>
												<Form.Item label="Genres">
													<EditableTagGroup
														values={values.genres}
														onValuesChange={newValues => setFieldValue('genres', newValues)}
														placeholder="Add genre"
														datasource={genresDataSource}
													/>
												</Form.Item>
											</Col>
											<Col span={12} style={{ paddingRight: 20 }}>
												<Form.Item
													label="Suffix"
													validateStatus={errors.suffix ? 'error' : 'success'}
												>
													<Input
														placeholder="Song suffix"
														name="suffix"
														value={values.suffix || ''}
														onChange={handleChange}
														onBlur={handleBlur}
													/>
												</Form.Item>
											</Col>
										</Row>
										<Row>
											<Col span={12} style={{ paddingRight: 20 }}>
												<Form.Item
													label="Year"
													validateStatus={errors.year ? 'error' : 'success'}
												>
													<Input
														placeholder="Year"
														name="year"
														value={values.year || ''}
														onChange={handleChange}
														onBlur={handleBlur}
														type="number"
													/>
												</Form.Item>
											</Col>
											<Col span={12} style={{ paddingRight: 20 }}>
												<Form.Item
													label="BPM"
													validateStatus={errors.bpm ? 'error' : 'success'}
												>
													<Input
														placeholder="BPM"
														name="bpm"
														value={values.bpm || ''}
														onChange={handleChange}
														onBlur={handleBlur}
														type="number"
													/>
												</Form.Item>
											</Col>
										</Row>
										<Row>
											<Col span={12} style={{ paddingRight: 20 }}>
												<Form.Item
													label="Type"
													validateStatus={errors.type ? 'error' : 'success'}
												>
													<Dropdown
														name='type'
														value={values.type}
														options={songTypeOptions}
														onChange={newSongType => setFieldValue('type', newSongType)}
													/>
												</Form.Item>
											</Col>
											<Col span={12} style={{ paddingRight: 20 }}>
												<Form.Item
													label="Release Date"
													validateStatus={errors.releaseDate ? 'error' : 'success'}
												>
													<DatePicker
														value={values.releaseDate ? moment(values.releaseDate) : undefined}
														onChange={e => setFieldValue('releaseDate', e.toISOString())}
														placeholder="Release Date"
													/>
												</Form.Item>
											</Col>
										</Row>
										<Row>
											<Col span={12} style={{ paddingRight: 20 }}>
												<Form.Item
													label="Is rip"
													validateStatus={errors.isRip ? 'error' : 'success'}
												>
													<Switch
														checked={values.isRip}
														onChange={e => setFieldValue('isRip', e)}
													/>
												</Form.Item>
											</Col>
										</Row>
										<Row>
											<Col span={12} style={{ paddingRight: 20 }}>
												<Form.Item label="Tags">
													<EditableTagGroup
														values={values.tags}
														onValuesChange={newValues => setFieldValue('tags', newValues)}
														placeholder="Add tag"
														datasource={tags}
													/>
												</Form.Item>
											</Col>
											<Col span={12} style={{ paddingRight: 20 }}>
												<Form.Item label="Labels">
													<EditableTagGroup
														values={values.labels}
														onValuesChange={newValues => setFieldValue('labels', newValues)}
														placeholder="Add label"
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
			)}
		</UpdateSongMutation>
	)
}

const validateSong = (data: IShareSong) => {
	let errors: any = {};

	if (data.title.trim().length === 0) {
		errors.title = 'Required';
	}

	if (data.year && (data.year < 1500 || data.year > 2100)) {
		errors.year = 'Invalid year';
	}

	if (data.bpm && (data.bpm < 50 || data.bpm > 200)) {
		errors.bpm = 'Invalid bpm'
	}

	if (!data.type) {
		errors.type = 'No type selected';
	}

	return errors;
}

const removeTypename = <O extends {}>(obj: O): O => {
	const value = obj as any;

	delete value.__typename;

	return value;
};

const makeSongInput = (song: IShareSong): Nullable<ISongUpdateInput> => {
	const { id, requiresUserAction, dateLastEdit, duration, ...songInput } = song;

	return removeTypename(songInput);
}