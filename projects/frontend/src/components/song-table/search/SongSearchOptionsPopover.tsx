import React, { useEffect, useState } from "react"
import Checkbox, { CheckboxChangeEvent } from "antd/lib/checkbox"
import CheckboxGroup, { CheckboxValueType } from "antd/lib/checkbox/Group"
import styled from "styled-components"
import { ISongSearchOptions, SearchMode, allMatchingOptions } from "./search-types"
import { Radio, Icon, Popover, Form } from "antd"

export const Section = styled.div`
	width: 100%;
	box-sizing: border-box;
	padding: 10px 0px;
`

const isStringArray = (obj: any): obj is string[] => Array.isArray(obj) && obj.every(item => typeof item === 'string')

interface ISongSearchOptionsPopoverProps {
	onOptionChange: (opts: ISongSearchOptions) => any;
}

export const SongSearchOptionsPopover: React.FC<ISongSearchOptionsPopoverProps> = ({ onOptionChange }) => {
	const [mode, setMode] = useState<SearchMode>('both')
	const [matching, setMatching] = useState({
		checkedList: allMatchingOptions,
		indeterminate: false,
		checkAll: true,
	})

	const onChangeMatching = (checkedList: CheckboxValueType[]) => {
		if (!isStringArray(checkedList)) return;

		setMatching({
			checkedList,
			indeterminate: !!checkedList.length && checkedList.length < allMatchingOptions.length,
			checkAll: checkedList.length === allMatchingOptions.length,
		})
	}

	const onClickCheckAll = (event: CheckboxChangeEvent) => {
		setMatching({
			checkedList: event.target.checked ? allMatchingOptions : [],
			indeterminate: false,
			checkAll: event.target.checked,
		})
	}

	useEffect(() => onOptionChange({ matcher: matching.checkedList, mode }), [matching.checkedList, mode, onOptionChange])

	const content = (
		<Form>
			<Section>
				<h5>Mode</h5>
				<Radio.Group value={mode} onChange={e => setMode(e.target.value)}>
					<Radio value="search">Search</Radio>
					<Radio value="both">{'Search & Filter'}</Radio>
					<Radio value="filter">Filter</Radio>
				</Radio.Group>
			</Section>
			<Section>
				<h5>Matching</h5>
				<div style={{ borderBottom: '1px solid #E9E9E9', marginTop: 8 }}>
					<Checkbox
						indeterminate={matching.indeterminate}
						onChange={onClickCheckAll}
						checked={matching.checkAll}
					>
						Check all
					</Checkbox>
				</div>
				<br />
				<CheckboxGroup
					options={allMatchingOptions}
					value={matching.checkedList}
					onChange={onChangeMatching}
				/>
			</Section>
		</Form>
	);

	return (
		<Popover content={content} title="Search Options" trigger="hover" placement="bottomRight">
			<Icon type="setting" />
		</Popover>
	)
}