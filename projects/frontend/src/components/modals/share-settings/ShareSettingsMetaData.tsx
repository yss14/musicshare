import React, { useState, useEffect, useCallback } from "react"
import { Share, Genre } from "@musicshare/shared-types"
import { Divider, Table, Input, Button, Form, message } from "antd"
import { useGenres, useRemoveGenre, useAddGenre } from "@musicshare/react-graphql-client"
import Column from "antd/lib/table/Column"
import { ButtonBar } from "../../common/ButtonBar"
import { useFormik, Formik, FormikHelpers } from "formik"
import { FormElements } from "../../common/FormElements"

interface IShareSettingsMetaDataProps {
	share: Share
}

export const ShareSettingsMetaData = ({ share }: IShareSettingsMetaDataProps) => {
	return (
		<div>
			<Divider>Genres</Divider>
			<Genres />
			<Divider>Song Types</Divider>
		</div>
	)
}

const Genres = () => {
	const { data: genres, isLoading } = useGenres()
	const [removeGenre, { isLoading: isLoadingRemoveGenre }] = useRemoveGenre({
		onSuccess: () => {
			message.success(`Genre successfully deleted`)
		},
	})

	return (
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
						<Button type="link">Edit</Button>
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
			{({ handleSubmit, isValid, resetForm }) => (
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
