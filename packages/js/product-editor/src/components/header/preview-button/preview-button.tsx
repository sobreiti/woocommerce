/**
 * External dependencies
 */
import { Button } from '@wordpress/components';
import { createElement } from '@wordpress/element';
import { getNewPath, navigateTo } from '@woocommerce/navigation';
import { Product } from '@woocommerce/data';
import { recordEvent } from '@woocommerce/tracks';
import { useDispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { getProductErrorMessageAndProps } from '../../../utils/get-product-error-message-and-props';
import { usePreview } from '../hooks/use-preview';
import { PreviewButtonProps } from './types';
import { TRACKS_SOURCE } from '../../../constants';

export function PreviewButton( {
	productStatus,
	visibleTab = 'general',
	...props
}: PreviewButtonProps ) {
	const { createErrorNotice } = useDispatch( 'core/notices' );

	const previewButtonProps = usePreview( {
		productStatus,
		...props,
		onClick() {
			recordEvent( 'product_preview_changes', { source: TRACKS_SOURCE } );
		},
		onSaveSuccess( savedProduct: Product ) {
			if ( productStatus === 'auto-draft' ) {
				const url = getNewPath( {}, `/product/${ savedProduct.id }` );
				navigateTo( { url } );
			}
		},
		onSaveError( error ) {
			const { message, errorProps } = getProductErrorMessageAndProps(
				error,
				visibleTab
			);
			createErrorNotice( message, errorProps );
		},
	} );

	return <Button { ...previewButtonProps } />;
}
