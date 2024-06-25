/**
 * External dependencies
 */
import { useState } from 'react';

export enum PopoverStatus {
	VISIBLE = 'VISIBLE',
	HIDDEN = 'HIDDEN',
}

type VirtualElement = Pick< Element, 'getBoundingClientRect' >;

const generateGetBoundingClientRect = ( x = 0, y = 0 ) => {
	return () => ( {
		width: 0,
		height: 0,
		top: y,
		right: x,
		bottom: y,
		left: x,
	} );
};

let clickedClientId: string | null = null;
let hoveredClientId: string | null = null;

export const usePopoverHandler = () => {
	const [ popoverStatus, setPopoverStatus ] = useState< PopoverStatus >(
		PopoverStatus.HIDDEN
	);

	const defaultVirtualElement = {
		getBoundingClientRect: generateGetBoundingClientRect(),
	} as VirtualElement;

	const [ virtualElement, setVirtualElement ] = useState< VirtualElement >(
		defaultVirtualElement
	);

	const updatePopoverPosition = ( {
		event,
		clickedBlockClientId,
		hoveredBlockClientId,
	}: {
		event: MouseEvent;
		clickedBlockClientId: string | null;
		hoveredBlockClientId: string | null;
	} ) => {
		const iframe = window.document.querySelector(
			'.woocommerce-customize-store-assembler > iframe[name="editor-canvas"]'
		) as HTMLElement;

		clickedClientId =
			clickedBlockClientId === null
				? clickedClientId
				: clickedBlockClientId;
		hoveredClientId =
			hoveredBlockClientId === null
				? hoveredClientId
				: hoveredBlockClientId;

		if ( clickedClientId === hoveredClientId ) {
			if ( popoverStatus === PopoverStatus.HIDDEN ) {
				setPopoverStatus( PopoverStatus.VISIBLE );
			}

			const iframeRect = iframe.getBoundingClientRect();

			const newElement = {
				getBoundingClientRect: generateGetBoundingClientRect(
					event.clientX + iframeRect.left,
					event.clientY + iframeRect.top + 20
				),
			} as VirtualElement;

			setVirtualElement( newElement );
			return;
		}

		setPopoverStatus( PopoverStatus.HIDDEN );
		clickedClientId = null;
	};

	const hidePopover = () => {
		setPopoverStatus( PopoverStatus.HIDDEN );
		clickedClientId = null;
		hoveredClientId = null;
	};

	return [
		popoverStatus,
		virtualElement,
		updatePopoverPosition,
		hidePopover,
		setPopoverStatus,
	] as const;
};
