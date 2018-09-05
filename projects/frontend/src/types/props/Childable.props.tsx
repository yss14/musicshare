import * as React from 'react';

export interface IChildableProps {
	children?: React.ComponentType | JSX.Element | JSX.Element[] | string;
}