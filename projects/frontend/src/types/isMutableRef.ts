import { MutableRefObject } from "react";

export const isMutableRef = (ref: any): ref is MutableRefObject<any> => typeof ref === 'object' && ref.current !== undefined