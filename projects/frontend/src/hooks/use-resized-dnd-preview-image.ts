import { useEffect } from "react";
import { DragElementWrapper, DragPreviewOptions } from "react-dnd";

export const useResizedDnDPreviewImage = (imageSrc: string, preview: DragElementWrapper<DragPreviewOptions>) => {
	useEffect(() => {
		const img = new Image();
		img.src = imageSrc;
		const ctx = document.createElement('canvas').getContext('2d')!;
		ctx.canvas.width = 30;
		ctx.canvas.height = 30;

		img.onload = () => {
			ctx.drawImage(img, 0, 0, ctx.canvas.width, ctx.canvas.height);
			img.src = ctx.canvas.toDataURL();
			preview(img);
		};
	}, [imageSrc, preview]);
}
