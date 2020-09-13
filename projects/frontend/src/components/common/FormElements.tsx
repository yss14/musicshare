import React, { useMemo } from "react"
import Form from "antd/lib/form"
import { useField, useFormikContext } from "formik"
import { Select, Input, Checkbox } from "antd"
import { SelectProps, SelectValue } from "antd/lib/select"
import { InputProps, TextAreaProps } from "antd/lib/input"
import { CheckboxProps } from "antd/lib/checkbox"
import Switch, { SwitchProps } from "antd/lib/switch"
import styled from "styled-components"

interface StyledSelectProps extends SelectProps<SelectValue> {
	height?: React.CSSProperties["height"]
}

const StyledSelect = styled(Select)<StyledSelectProps>`
	& input {
		height: ${({ height }) => (typeof height === "number" ? `${height}px` : height)};
	}
`

const Label: React.FC<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>> = ({
	children,
	...labelProps
}) => (
	<div className="ant-col ant-form-item-label" {...labelProps}>
		{children}
	</div>
)

const StyledFormItem = styled(Form.Item)`
	& label {
		display: flex;
	}
`

interface IFormElementBaseProps {
	name: string
	label?: React.ReactNode
	align?: "line" | "block"
	labelProps?: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
	colon?: boolean
	formItemStyle?: React.CSSProperties
	disableHelp?: boolean
}

interface IFormSelectProps extends IFormElementBaseProps, SelectProps<SelectValue> {
	minHeight?: number
}

const SelectWrapper = styled.span<{ minHeight?: number }>`
	& .ant-select-selection {
		min-height: ${(props) => props.minHeight || 32}px;
	}
`

const FormSelect: React.FC<IFormSelectProps> = ({
	name,
	label,
	align,
	labelProps,
	children,
	minHeight,
	colon,
	disableHelp,
	...selectProps
}) => {
	const [field, { touched, error }] = useField(name)
	const { setFieldValue, handleBlur } = useFormikContext()
	const { height, ...dropdownStyles } = selectProps.style || {}

	return (
		<StyledFormItem
			validateStatus={touched && error ? "error" : "success"}
			help={!disableHelp && touched && error}
			label={typeof label === "string" ? <Label {...labelProps}>{label}</Label> : label}
			style={{ display: align === "line" ? "flex" : undefined }}
			colon={colon}
		>
			<SelectWrapper minHeight={minHeight}>
				<StyledSelect
					{...field}
					{...selectProps}
					value={field.value || undefined} // otherwise placeholder is not displayed
					onChange={(value: any) => setFieldValue(name, value)}
					onBlur={() => handleBlur(name)}
					dropdownStyle={dropdownStyles}
					height={height}
				>
					{children}
				</StyledSelect>
			</SelectWrapper>
		</StyledFormItem>
	)
}

interface IFormInputProps extends IFormElementBaseProps, Omit<InputProps, "name"> {}

const FormInput = ({ name, label, align, labelProps, colon, disableHelp, ...inputProps }: IFormInputProps) => {
	const [field, { touched, error }] = useField(name)

	return (
		<StyledFormItem
			validateStatus={touched && error ? "error" : "success"}
			help={!disableHelp && touched && error}
			label={typeof label === "string" ? <Label {...labelProps}>{label}</Label> : label}
			style={{ display: align === "line" ? "flex" : undefined }}
			colon={colon}
		>
			<Input {...field} {...inputProps} style={{ ...inputProps.style }} />
		</StyledFormItem>
	)
}

interface IFormTextAreaProps extends IFormElementBaseProps, Omit<TextAreaProps, "name"> {}

const FormTextArea = ({ name, label, align, labelProps, colon, disableHelp, ...textareaProps }: IFormTextAreaProps) => {
	const [field, { touched, error }] = useField(name)

	return (
		<StyledFormItem
			validateStatus={touched && error ? "error" : "success"}
			help={!disableHelp && touched && error}
			label={typeof label === "string" ? <Label {...labelProps}>{label}</Label> : label}
			style={{ display: align === "line" ? "flex" : undefined }}
			colon={colon}
		>
			<Input.TextArea {...field} {...textareaProps} style={{ ...textareaProps.style }} />
		</StyledFormItem>
	)
}

interface IFormCheckboxProps extends IFormElementBaseProps, Omit<CheckboxProps, "name"> {}

const FormCheckbox = ({ name, label, align, labelProps, colon, disableHelp, ...checkboxProps }: IFormCheckboxProps) => {
	const [{ value, ...field }, { touched, error }] = useField(name)

	return (
		<StyledFormItem
			validateStatus={touched && error ? "error" : "success"}
			help={!disableHelp && touched && error}
			label={typeof label === "string" ? <Label {...labelProps}>{label}</Label> : label}
			style={{ display: align === "line" ? "flex" : undefined }}
			colon={colon}
		>
			<Checkbox {...field} checked={!!value} {...checkboxProps} style={{ ...checkboxProps.style }} />
		</StyledFormItem>
	)
}

interface IFormSwitchProps extends IFormElementBaseProps, Omit<SwitchProps, "name"> {}

const FormSwitch: React.FC<IFormSwitchProps> = ({
	name,
	label,
	align,
	labelProps,
	formItemStyle,
	colon,
	...switchProps
}) => {
	const [{ value, ...field }, { touched, error }] = useField(name)
	const { setFieldValue } = useFormikContext()

	const labelStyle = useMemo(() => {
		return {
			...labelProps?.style,
			color: touched && error ? "red" : undefined,
		}
	}, [labelProps, touched, error])

	return (
		<StyledFormItem
			label={
				typeof label === "string" ? (
					<Label {...labelProps} style={labelStyle}>
						{label}
					</Label>
				) : (
					label
				)
			}
			style={{ display: align === "line" ? "flex" : undefined, ...formItemStyle }}
			colon={colon}
		>
			<Switch
				{...field}
				checked={!!value}
				{...switchProps}
				style={{ ...switchProps.style }}
				onChange={
					switchProps.onChange
						? switchProps.onChange
						: (value) => {
								setFieldValue(name, value)
						  }
				}
			/>
		</StyledFormItem>
	)
}

export const FormElements = {
	Select: FormSelect,
	Input: FormInput,
	Checkbox: FormCheckbox,
	TextArea: FormTextArea,
	Switch: FormSwitch,
}
