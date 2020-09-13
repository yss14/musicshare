import React, { useState, useCallback } from "react"
import { SongType } from "@musicshare/shared-types"
import { Table, Button, Form, message, Modal, Tag } from "antd"
import { useSongTypes, useRemoveSongType, useAddSongType, useUpdateSongType } from "@musicshare/react-graphql-client"
import Column from "antd/lib/table/Column"
import { ButtonBar } from "../../common/ButtonBar"
import { Formik, FormikHelpers } from "formik"
import { FormElements } from "../../common/FormElements"

export const SongTypeSettings = () => {
	const [editSongType, setEditSongType] = useState<SongType | null>(null)
	const { data: songTypes, isLoading: isLoadingSongType } = useSongTypes()
	const [removeSongType, { isLoading: isLoadingRemoveSongType }] = useRemoveSongType({
		onSuccess: () => {
			message.success(`SongType successfully deleted`)
		},
	})

	return (
		<>
			<Table
				size="small"
				dataSource={songTypes || undefined}
				pagination={false}
				loading={isLoadingSongType}
				scroll={{ y: 200 }}
				rowKey={(genre) => genre.id}
				footer={() => <SongTypeTableFooter />}
			>
				<Column title="Name" dataIndex="name" key="name" />
				<Column title="Group" dataIndex="group" key="group" />
				<Column
					title="Alternative Names"
					dataIndex="alternativeName"
					key="alternativeName"
					render={(_, songType: SongType) =>
						songType.alternativeNames.map((name) => <Tag key={name}>{name}</Tag>)
					}
				/>
				<Column
					title="Has Artists"
					dataIndex="hasArtists"
					key="hasArtists"
					render={(_, songType: SongType) => (songType.hasArtists ? "Yes" : "No")}
				/>
				<Column
					title="Actions"
					key="actions"
					render={(_, songType: SongType) => (
						<ButtonBar>
							<Button type="link" onClick={() => setEditSongType(songType)}>
								Edit
							</Button>
							<Button
								type="link"
								danger
								onClick={() => removeSongType({ songTypeID: songType.id })}
								loading={isLoadingRemoveSongType}
							>
								Delete
							</Button>
						</ButtonBar>
					)}
				/>
			</Table>
			{editSongType && <EditSongTypeModal songType={editSongType} onClose={() => setEditSongType(null)} />}
		</>
	)
}

type SongTypePayload = Pick<SongType, "group" | "name" | "alternativeNames" | "hasArtists">

const defaultValues: SongTypePayload = { name: "", group: "", alternativeNames: [], hasArtists: false }

const validate = (values: SongTypePayload) => {
	const errors: any = {}

	if (values.name.trim().length < 2) {
		errors.name = "Too short"
	}

	if (values.group.trim().length < 2) {
		errors.group = "Too short"
	}

	if (values.alternativeNames.some((name) => name.trim().length < 2)) {
		errors.alternativeNames = "Too short"
	}

	return errors
}

const SongTypeTableFooter = () => {
	const [addSongType, { isLoading: isLoadingAddSongType }] = useAddSongType({
		onSuccess: (data) => {
			message.success(`Song Type "${data.name}" successfully added`)
		},
	})

	const onSubmit = useCallback(
		async (values: SongTypePayload, formikHelpers: FormikHelpers<SongTypePayload>) => {
			await addSongType(values)
			formikHelpers.resetForm()
		},
		[addSongType],
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
					<FormElements.Input name="name" placeholder="Song Type Name" />
					<FormElements.Input name="group" placeholder="Song Type Group" />
					<FormElements.Select
						name="alternativeNames"
						placeholder="Add Alternative Names"
						mode="tags"
						style={{ width: 200 }}
					/>
					<FormElements.Checkbox name="hasArtists" label="Has Artists" />
					<Button type="primary" htmlType="submit" loading={isLoadingAddSongType} disabled={!isValid}>
						Add Song Type
					</Button>
				</Form>
			)}
		</Formik>
	)
}

interface IEditGenreModalProps {
	songType: SongType
	onClose: () => void
}

const EditSongTypeModal = ({ songType: { id: songTypeID, ...songTypePayload }, onClose }: IEditGenreModalProps) => {
	const [updateSongType, { isLoading }] = useUpdateSongType()

	const onSubmit = useCallback(
		async (values: SongTypePayload, formikHelpers: FormikHelpers<SongTypePayload>) => {
			await updateSongType({ songTypeID, ...values })
			formikHelpers.resetForm()
			onClose()
		},
		[updateSongType, songTypeID, onClose],
	)

	return (
		<Formik
			initialValues={songTypePayload}
			onSubmit={(values, helpers) => onSubmit(values, helpers)}
			validate={validate}
			isInitialValid={validate(songTypePayload)}
		>
			{({ handleSubmit, isValid }) => (
				<Modal
					title="Edit Song Type"
					visible
					onCancel={onClose}
					okButtonProps={{ onClick: () => handleSubmit(), loading: isLoading, disabled: !isValid }}
					okText="Update Song Type"
				>
					<Form onFinish={() => handleSubmit()}>
						<FormElements.Input name="name" placeholder="Song Type Name" />
						<FormElements.Input name="group" placeholder="Song Type Group" />
						<FormElements.Select
							name="alternativeNames"
							placeholder="Add Alternative Names"
							mode="tags"
							style={{ width: 450 }}
						/>
						<FormElements.Checkbox name="hasArtists" label="Has Artists" />
					</Form>
				</Modal>
			)}
		</Formik>
	)
}
