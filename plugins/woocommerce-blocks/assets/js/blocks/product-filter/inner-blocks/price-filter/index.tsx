/**
 * External dependencies
 */
import { registerBlockType } from '@wordpress/blocks';
import { isExperimentalBlocksEnabled } from '@woocommerce/block-settings';

/**
 * Internal dependencies
 */
import './style.scss';
import metadata from './block.json';
import Edit from './edit';
import { priceFilterIcon } from './icon';

if ( isExperimentalBlocksEnabled() ) {
	registerBlockType( metadata, {
		icon: {
			src: priceFilterIcon,
		},
		edit: Edit,
	} );
}
