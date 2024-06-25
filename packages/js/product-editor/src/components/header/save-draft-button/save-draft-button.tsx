/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { createElement } from '@wordpress/element';
import { getNewPath, navigateTo } from '@woocommerce/navigation';
import { Product } from '@woocommerce/data';
import { useDispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { getProductErrorMessageAndProps } from '../../../utils/get-product-error-message-and-props';
import { recordProductEvent } from '../../../utils/record-product-event';
import { useSaveDraft } from '../hooks/use-save-draft';
import { SaveDraftButtonProps } from './types';
import { useFeedbackBar } from '../../../hooks/use-feedback-bar';

export function SaveDraftButton( {
	productStatus,
	productType = 'product',
	visibleTab = 'general',
	...props
}: SaveDraftButtonProps ) {
	const { createSuccessNotice, createErrorNotice } =
		useDispatch( 'core/notices' );

	const { maybeShowFeedbackBar } = useFeedbackBar();

	const saveDraftButtonProps = useSaveDraft( {
		productStatus,
		productType,
		...props,
		onSaveSuccess( savedProduct: Product ) {
			recordProductEvent( 'product_edit', savedProduct );

			createSuccessNotice(
				__( 'Product saved as draft.', 'woocommerce' )
			);

			maybeShowFeedbackBar();

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

	return <Button { ...saveDraftButtonProps } />;
}
