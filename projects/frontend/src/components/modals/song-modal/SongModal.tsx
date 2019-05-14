import React from 'react';
import './song-modal.css';
import { Modal, Form, Input, Row, Col } from 'antd';
import { Formik } from 'formik';
import { EditableTagGroup } from '../../form/EditableTagGroup';
import { SongQuery, GET_SONG } from '../../../resolvers/queries/song-query';
import { GenresQuery, GET_GENRES } from '../../../resolvers/queries/genre-query';
import { SongTypesQuery, GET_SONGTYPES } from '../../../resolvers/queries/song-types';
import { IGenre, ISongType, IShareSong } from '../../../resolvers/types';

interface ISongModalProps {
	shareID: string;
	songID: string;
	onSongUpdate?: (updatedSong: any) => void;
	onCancel: () => void;
}

export const SongModal = ({ songID, shareID, onCancel }: ISongModalProps) => {
	console.log('SongModal')

	return (
		<Modal
			title="Song Modal"
			visible={true}
			onCancel={onCancel}
		>
			<div id="songmodal">
				<SongQuery query={GET_SONG} variables={{ songID, shareID }}>
					{({ loading: loadingSong, error: errorSong, data: dataSong }) => (
						<GenresQuery query={GET_GENRES} variables={{ shareID }}>
							{({ loading: loadingGenres, error: errorGenres, data: dataGenres }) => (
								<SongTypesQuery query={GET_SONGTYPES} variables={{ shareID }}>
									{({ loading: loadingSongTypes, error: errorSongTypes, data: dataSongTypes }) => {

										if (loadingSong || loadingGenres || loadingSongTypes) {
											return <div>Loading</div>;
										}
										if (errorSong || errorGenres || errorSongTypes) {
											onCancel();

											return null;
										}
										if (dataSong && dataGenres && dataSongTypes) {
											return (
												<SongForm
													song={dataSong.share.song}
													genres={dataGenres.share.genres}
													songTypes={dataSongTypes.share.songTypes}
												/>
											)
										} else {
											console.error('Some data is invalid', { dataSong, dataGenres, dataSongTypes });

											onCancel();

											return null;
										}
									}}
								</SongTypesQuery>
							)}
						</GenresQuery>
					)}
				</SongQuery>
			</div>
		</Modal>
	);
}

interface ISongFormProps {
	song: IShareSong;
	genres: IGenre[];
	songTypes: ISongType[];
}

const SongForm = ({ song }: ISongFormProps) => {
	const onFormSubmit = () => {
		console.log('onFormSubmit');
	}

	return (
		<Formik initialValues={song} onSubmit={onFormSubmit} validate={() => { console.log('validating'); return {} }}>
			{({
				values,
				errors,
				touched,
				handleChange,
				handleBlur,
				handleSubmit,
				isSubmitting,
				setFieldValue
			}) => (
					<Form onSubmit={handleSubmit}>
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
							/>
						</Form.Item>
						<Form.Item label="Remixer">
							<EditableTagGroup
								values={values.remixer}
								onValuesChange={newValues => setFieldValue('remixer', newValues)}
								placeholder="Add remixer"
							/>
						</Form.Item>
						<Form.Item label="Featurings">
							<EditableTagGroup
								values={values.featurings}
								onValuesChange={newValues => setFieldValue('featurings', newValues)}
								placeholder="Add featurings"
							/>
						</Form.Item>
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

						<button type="submit">Submit</button>

					</Form>
				)}
		</Formik>
	)
}
