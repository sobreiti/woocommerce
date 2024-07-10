/**
 * External dependencies
 */
import { chevronDown, chevronUp, closeSmall } from '@wordpress/icons';
import classNames from 'classnames';
import {
	createElement,
	useEffect,
	useState,
	Fragment,
} from '@wordpress/element';
import { useInstanceId } from '@wordpress/compose';
import { BaseControl, Button, TextControl } from '@wordpress/components';
import { decodeEntities } from '@wordpress/html-entities';
import { __ } from '@wordpress/i18n';
import { speak } from '@wordpress/a11y';

/**
 * Internal dependencies
 */
import { useLinkedTree } from '../experimental-tree-control/hooks/use-linked-tree';
import { Item, TreeControlProps } from '../experimental-tree-control/types';
import { SelectedItems } from '../experimental-select-control/selected-items';
import { ComboBox } from '../experimental-select-control/combo-box';
import { SuffixIcon } from '../experimental-select-control/suffix-icon';
import { SelectTreeMenu } from './select-tree-menu';
import { escapeHTML } from '../utils';

interface SelectTreeProps extends TreeControlProps {
	id: string;
	selected?: Item | Item[];
	treeRef?: React.ForwardedRef< HTMLOListElement >;
	isLoading?: boolean;
	disabled?: boolean;
	label: string | JSX.Element;
	help?: string | JSX.Element;
	onInputChange?: ( value: string | undefined ) => void;
	initialInputValue?: string | undefined;
	isClearingAllowed?: boolean;
	onClear?: () => void;
}

export const SelectTree = function SelectTree( {
	items,
	treeRef: ref,
	isLoading,
	disabled,
	initialInputValue,
	onInputChange,
	shouldShowCreateButton,
	help = __( 'Separate with commas or the Enter key.', 'woocommerce' ),
	isClearingAllowed = false,
	onClear = () => {},
	...props
}: SelectTreeProps ) {
	const linkedTree = useLinkedTree( items );
	const selectTreeInstanceId = useInstanceId(
		SelectTree,
		'woocommerce-experimental-select-tree-control__dropdown'
	) as string;
	const menuInstanceId = useInstanceId(
		SelectTree,
		'woocommerce-select-tree-control__menu'
	) as string;

	function isEventOutside( event: React.FocusEvent ) {
		const isInsideSelect = document
			.getElementById( selectTreeInstanceId )
			?.contains( event.relatedTarget );

		const isInsidePopover = document
			.getElementById( menuInstanceId )
			?.closest(
				'.woocommerce-experimental-select-tree-control__popover-menu'
			)
			?.contains( event.relatedTarget );
		return ! ( isInsideSelect || isInsidePopover );
	}

	const recalculateInputValue = () => {
		if ( onInputChange ) {
			if ( ! props.multiple && props.selected ) {
				onInputChange( ( props.selected as Item ).label );
			} else {
				onInputChange( '' );
			}
		}
	};

	const focusOnInput = () => {
		(
			document.querySelector( `#${ props.id }-input` ) as HTMLInputElement
		 )?.focus();
	};

	const [ isFocused, setIsFocused ] = useState( false );
	const [ isOpen, setIsOpen ] = useState( false );
	const [ inputValue, setInputValue ] = useState( '' );
	const isReadOnly = ! isOpen && ! isFocused;

	useEffect( () => {
		if ( initialInputValue !== undefined && isFocused ) {
			setInputValue( initialInputValue as string );
		}
	}, [ isFocused ] );

	let placeholder: string | undefined = '';
	if ( Array.isArray( props.selected ) ) {
		placeholder = props.selected.length === 0 ? props.placeholder : '';
	} else if ( props.selected ) {
		placeholder = props.placeholder;
	}

	const inputProps: React.InputHTMLAttributes< HTMLInputElement > = {
		className: 'woocommerce-experimental-select-control__input',
		id: `${ props.id }-input`,
		'aria-autocomplete': 'list',
		'aria-controls': `${ props.id }-menu`,
		autoComplete: 'off',
		disabled,
		onFocus: ( event ) => {
			if ( props.multiple ) {
				speak(
					__(
						'To select existing items, type its exact label and separate with commas or the Enter key.',
						'woocommerce'
					)
				);
			}
			if ( ! isOpen ) {
				setIsOpen( true );
			}
			setIsFocused( true );
			if (
				Array.isArray( props.selected ) &&
				props.selected?.some(
					( item: Item ) => item.label === event.target.value
				)
			) {
				setInputValue( '' );
			}
		},
		onBlur: ( event ) => {
			if ( isOpen && isEventOutside( event ) ) {
				setIsOpen( false );
				recalculateInputValue();
			}
			setIsFocused( false );
		},
		onKeyDown: ( event ) => {
			setIsOpen( true );
			if ( event.key === 'ArrowDown' ) {
				event.preventDefault();
				// focus on the first element from the Popover
				(
					document.querySelector(
						`#${ menuInstanceId } input, #${ menuInstanceId } button`
					) as HTMLInputElement | HTMLButtonElement
				 )?.focus();
			}
			if ( event.key === 'Tab' || event.key === 'Escape' ) {
				setIsOpen( false );
				recalculateInputValue();
			}
			if ( event.key === ',' || event.key === 'Enter' ) {
				event.preventDefault();
				const item = items.find(
					( i ) => i.label === escapeHTML( inputValue )
				);
				const isAlreadySelected =
					Array.isArray( props.selected ) &&
					Boolean(
						props.selected.find(
							( i ) => i.label === escapeHTML( inputValue )
						)
					);
				if ( props.onSelect && item && ! isAlreadySelected ) {
					props.onSelect( item );
					setInputValue( '' );
					recalculateInputValue();
				}
			}
		},
		onChange: ( event ) => {
			if ( onInputChange ) {
				onInputChange( event.target.value );
			}
			setInputValue( event.target.value );
		},
		placeholder,
		value: inputValue,
	};

	const handleClear = () => {
		if ( isClearingAllowed ) {
			onClear();
		}
	};

	return (
		<div
			id={ selectTreeInstanceId }
			className={ `woocommerce-experimental-select-tree-control__dropdown` }
			tabIndex={ -1 }
		>
			<div
				className={ classNames(
					'woocommerce-experimental-select-control',
					{
						'is-read-only': isReadOnly,
						'is-focused': isFocused,
						'is-multiple': props.multiple,
						'has-selected-items':
							Array.isArray( props.selected ) &&
							props.selected.length,
					}
				) }
			>
				<BaseControl
					label={ props.label }
					id={ `${ props.id }-input` }
					help={ help }
				>
					<>
						{ props.multiple ? (
							<ComboBox
								comboBoxProps={ {
									className:
										'woocommerce-experimental-select-control__combo-box-wrapper',
									role: 'combobox',
									'aria-expanded': isOpen,
									'aria-haspopup': 'tree',
									'aria-owns': `${ props.id }-menu`,
								} }
								inputProps={ inputProps }
								suffix={
									<div className="woocommerce-experimental-select-control__suffix-items">
										{ isClearingAllowed && isOpen && (
											<Button onClick={ handleClear }>
												<SuffixIcon
													className="woocommerce-experimental-select-control__icon-clear"
													icon={ closeSmall }
												/>
											</Button>
										) }
										<SuffixIcon
											icon={
												isOpen ? chevronUp : chevronDown
											}
										/>
									</div>
								}
							>
								<SelectedItems
									isReadOnly={ isReadOnly }
									items={ ( props.selected as Item[] ) || [] }
									getItemLabel={ ( item ) =>
										item?.label || ''
									}
									getItemValue={ ( item ) =>
										item?.value || ''
									}
									onRemove={ ( item ) => {
										if (
											! Array.isArray( item ) &&
											props.onRemove
										) {
											props.onRemove( item );
										}
									} }
									getSelectedItemProps={ () => ( {} ) }
								/>
							</ComboBox>
						) : (
							<TextControl
								{ ...inputProps }
								value={ decodeEntities(
									props.createValue || ''
								) }
								onChange={ ( value ) => {
									if ( onInputChange ) onInputChange( value );
									const item = items.find(
										( i ) => i.label === escapeHTML( value )
									);
									if ( props.onSelect && item ) {
										props.onSelect( item );
									}
									if ( ! value && props.onRemove ) {
										props.onRemove(
											props.selected as Item
										);
									}
								} }
							/>
						) }
						<SelectTreeMenu
							{ ...props }
							onSelect={ ( item ) => {
								if ( ! props.multiple && onInputChange ) {
									onInputChange( ( item as Item ).label );
									setIsOpen( false );
									setIsFocused( false );
									focusOnInput();
								}
								if ( props.onSelect ) {
									props.onSelect( item );
								}
							} }
							id={ menuInstanceId }
							ref={ ref }
							isEventOutside={ isEventOutside }
							isLoading={ isLoading }
							isOpen={ isOpen }
							items={ linkedTree }
							shouldShowCreateButton={ shouldShowCreateButton }
							onClose={ () => {
								setIsOpen( false );
							} }
							onFirstItemLoop={ focusOnInput }
						/>
					</>
				</BaseControl>
			</div>
		</div>
	);
};
