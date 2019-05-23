import React from 'react';
import { Spin, Icon } from 'antd';
import styled from 'styled-components';

const StyledSpin = styled(Spin)`
	position: absolute;
	left: 50%;
	top: 50%;
	transform: translate(-50%, -50%);
`;
const antLoadingIcon = <Icon type="loading" style={{ fontSize: 32 }} spin />;

interface ISpinnerProps {
	mode?: 'inline' | 'overlay';
}

export const Spinner = ({ mode }: ISpinnerProps) => {
	const renderMode = mode || 'inline';

	if (renderMode === 'inline') {
		return <StyledSpin indicator={antLoadingIcon} />
	} else {
		return null;
	}
}