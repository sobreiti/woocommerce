/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';

export type WPErrorCode =
	| 'variable_product_no_variation_prices'
	| 'product_form_field_error'
	| 'product_invalid_sku'
	| 'product_create_error'
	| 'product_publish_error'
	| 'product_preview_error';

export type WPError = {
	code: WPErrorCode;
	message: string;
	data: {
		[ key: string ]: unknown;
	};
};

type ErrorProps = {
	explicitDismiss: boolean;
};

export function getProductErrorMessageAndProps(
	error: WPError,
	visibleTab: string | null
): {
	message: string;
	errorProps: ErrorProps;
} {
	const response = {
		message: '',
		errorProps: {} as ErrorProps,
	};
	switch ( error.code ) {
		case 'variable_product_no_variation_prices':
			response.message = error.message;
			if ( visibleTab !== 'variations' ) {
				response.errorProps = { explicitDismiss: true };
			}
			break;
		case 'product_form_field_error':
			response.message = error.message;
			if ( visibleTab !== 'general' ) {
				response.errorProps = { explicitDismiss: true };
			}
			break;
		case 'product_invalid_sku':
			response.message = __(
				'Invalid or duplicated SKU.',
				'woocommerce'
			);
			if ( visibleTab !== 'inventory' ) {
				response.errorProps = { explicitDismiss: true };
			}
			break;
		case 'product_create_error':
			response.message = __( 'Failed to create product.', 'woocommerce' );
			break;
		case 'product_publish_error':
			response.message = __(
				'Failed to publish product.',
				'woocommerce'
			);
			break;
		case 'product_preview_error':
			response.message = __(
				'Failed to preview product.',
				'woocommerce'
			);
			break;
		default:
			response.message = __( 'Failed to save product.', 'woocommerce' );
			break;
	}
	return response;
}
