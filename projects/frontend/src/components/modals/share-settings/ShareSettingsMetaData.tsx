import React, { useState, useCallback } from "react"
import { Share, Genre } from "@musicshare/shared-types"
import { Divider, Table, Button, Form, message, Modal } from "antd"
import { useGenres, useRemoveGenre, useAddGenre, useUpdateGenre } from "@musicshare/react-graphql-client"
import Column from "antd/lib/table/Column"
import { ButtonBar } from "../../common/ButtonBar"
import { Formik, FormikHelpers } from "formik"
import { FormElements } from "../../common/FormElements"

interface IShareSettingsMetaDataProps {
	share: Share
}

export const ShareSettingsMetaData = ({ share }: IShareSettingsMetaDataProps) => {
	return (
		<div style={{ minHeight: 600 }}>
			<Divider orientation="left">Genres</Divider>
			<Genres />
			<Divider orientation="left">Song Types</Divider>
		</div>
	)
}

const Genres = () => {
	const [editGenre, setEditGenre] = useState<Genre | null>(null)
	const { data: genres, isLoading } = useGenres()
	const [removeGenre, { isLoading: isLoadingRemoveGenre }] = useRemoveGenre({
		onSuccess: () => {
			message.success(`Genre successfully deleted`)
		},
	})

	return (
		<>
			<Table
				size="small"
				dataSource={genres || undefined}
				pagination={false}
				loading={isLoading}
				scroll={{ y: 200 }}
				rowKey={(genre) => genre.id}
				footer={() => <GenreTableFooter />}
			>
				<Column title="Name" dataIndex="name" key="name" />
				<Column title="Group" dataIndex="group" key="group" />
				<Column
					title="Actions"
					key="actions"
					render={(_, genre: Genre) => (
						<ButtonBar>
							<Button type="link" onClick={() => setEditGenre(genre)}>
								Edit
							</Button>
							<Button
								type="link"
								danger
								onClick={() => removeGenre({ genreID: genre.id })}
								loading={isLoadingRemoveGenre}
							>
								Delete
							</Button>
						</ButtonBar>
					)}
				/>
			</Table>
			{editGenre && <EditGenreModal genre={editGenre} onClose={() => setEditGenre(null)} />}
		</>
	)
}

type GenrePayload = Pick<Genre, "group" | "name">

const defaultValues: GenrePayload = { name: "", group: "" }

const validate = (values: GenrePayload) => {
	const errors: any = {}

	if (values.name.trim().length < 2) {
		errors.name = "Too short"
	}

	if (values.group.trim().length < 2) {
		errors.group = "Too short"
	}

	return errors
}

const GenreTableFooter = () => {
	const [addGenre, { isLoading: isLoadingAddGenre }] = useAddGenre({
		onSuccess: (data) => {
			message.success(`Genre "${data.name}" successfully added`)
		},
	})

	const onSubmit = useCallback(
		async (values: GenrePayload, formikHelpers: FormikHelpers<GenrePayload>) => {
			await addGenre(values)
			formikHelpers.resetForm()
		},
		[addGenre],
	)

	return (
		<Formik
			initialValues={defaultValues}
			onSubmit={(values, helpers) => onSubmit(values, helpers)}
			validate={validate}
			isInitialValid={false}
		>
			{({ handleSubmit, isValid }) => (
				<Form layout="inline" onFinish={() => handleSubmit()}>
					<FormElements.Input name="name" placeholder="Genre Name" />
					<FormElements.Input name="group" placeholder="Genre Group" />
					<Button type="primary" htmlType="submit" loading={isLoadingAddGenre} disabled={!isValid}>
						Add Genre
					</Button>
				</Form>
			)}
		</Formik>
	)
}

interface IEditGenreModalProps {
	genre: Genre
	onClose: () => void
}

const EditGenreModal = ({ genre, onClose }: IEditGenreModalProps) => {
	const [updateGenre, { isLoading }] = useUpdateGenre()

	const onSubmit = useCallback(
		async (values: GenrePayload, formikHelpers: FormikHelpers<GenrePayload>) => {
			await updateGenre({ genreID: genre.id, ...values })
			formikHelpers.resetForm()
			onClose()
		},
		[updateGenre, genre.id],
	)

	return (
		<Formik
			initialValues={{ group: genre.group, name: genre.name }}
			onSubmit={(values, helpers) => onSubmit(values, helpers)}
			validate={validate}
			isInitialValid={validate(genre)}
		>
			{({ handleSubmit, isValid }) => (
				<Modal
					title="Edit Genre"
					visible
					onCancel={onClose}
					okButtonProps={{ onClick: () => handleSubmit(), loading: isLoading, disabled: !isValid }}
					okText="Update Genre"
				>
					<Form layout="inline" onFinish={() => handleSubmit()}>
						<FormElements.Input name="name" placeholder="Genre Name" />
						<FormElements.Input name="group" placeholder="Genre Group" />
					</Form>
				</Modal>
			)}
		</Formik>
	)
}
