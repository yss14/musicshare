import 'styled-components'
import { IPrimaryTheme } from '../types/Theme';

declare module 'styled-components' {
	export interface DefaultTheme extends IPrimaryTheme { }
}