import React, { ChangeEvent, useMemo, useState, useRef } from "react"
import { Tag, Input, Tooltip, Icon, AutoComplete } from "antd"
import { SelectValue } from "antd/lib/select"

const isChangeEvent = (obj: any): obj is ChangeEvent<HTMLInputElement> =>
	obj.target !== undefined && obj.target.value !== undefined

interface IEditableTagGroupProps {
	values: string[]
	onValuesChange: (newValues: string[]) => void
	placeholder?: string
	datasource?: string[]
	readOnly?: boolean
}

interface IEditableTagGroupState {
	inputVisible: boolean
	inputValue: string
}

export const EditableTagGroup = ({
	values,
	onValuesChange: onValueChange,
	placeholder,
	datasource,
	readOnly,
}: IEditableTagGroupProps) => {
	const [state, setState] = useState<IEditableTagGroupState>({
		inputVisible: false,
		inputValue: "",
	})
	const inputRef = useRef<Input>(null)

	const handleClose = (removedValue: string) => {
		const newValues = values.filter((value) => value !== removedValue)

		onValueChange(newValues)
	}

	const showInput = () => {
		setState({ ...state, inputVisible: true })

		if (inputRef.current) {
			inputRef.current.focus()
		}
	}

	const handleInputChange = (e: SelectValue | ChangeEvent) => {
		if (typeof e === "string") {
			setState({ ...state, inputValue: e })
		} else if (isChangeEvent(e)) {
			setState({ ...state, inputValue: e.target.value })
		}
	}

	const handleInputSelect = (e: SelectValue) => {
		if (typeof e === "string") {
			handleInputConfirm(e)
		}
	}

	const handleInputConfirm = (value?: SelectValue) => {
		const { inputValue } = state
		let newValues = [...values]

		let finalInputValue = inputValue

		if (typeof value === "string") {
			finalInputValue = value
		}

		if (finalInputValue && values.indexOf(finalInputValue) === -1) {
			newValues.push(finalInputValue)
		}

		setTimeout(
			() =>
				setState({
					...state,
					inputVisible: false,
					inputValue: "",
				}),
			100,
		)

		onValueChange(newValues)
	}

	const { inputVisible, inputValue } = state

	const datasourceFiltered = useMemo(
		() =>
			(datasource || [])
				.filter((data) => !values.includes(data))
				.filter((data) => data.toLowerCase().indexOf(inputValue.toLowerCase()) > -1),
		[datasource, inputValue, values],
	)

	return (
		<div>
			{values.map((value) => {
				const isLongValue = value.length > 30
				const valueElement = (
					<Tag key={value} closable={!readOnly} onClose={() => handleClose(value)}>
						{isLongValue ? `${value.slice(0, 20)}...` : value}
					</Tag>
				)
				return isLongValue ? (
					<Tooltip title={value} key={value}>
						{valueElement}
					</Tooltip>
				) : (
					valueElement
				)
			})}
			{inputVisible && (
				<AutoComplete
					dataSource={datasourceFiltered}
					style={{ width: 200 }}
					onSelect={handleInputSelect}
					onChange={handleInputChange}
					onBlur={handleInputConfirm}
					placeholder={placeholder}
					value={inputValue}
					size="small"
					autoFocus
					disabled={readOnly}
				>
					<Input
						ref={inputRef}
						type="text"
						size="small"
						style={{ width: 100 }}
						value={inputValue}
						onChange={handleInputChange}
						onBlur={() => handleInputConfirm()}
						onPressEnter={() => handleInputConfirm()}
						readOnly={readOnly}
					/>
				</AutoComplete>
			)}
			{!inputVisible && !readOnly && (
				<Tag onClick={showInput} style={{ background: "#fff", borderStyle: "dashed", cursor: "pointer" }}>
					<Icon type="plus" />
					{placeholder || "New Tag"}
				</Tag>
			)}
		</div>
	)
}
