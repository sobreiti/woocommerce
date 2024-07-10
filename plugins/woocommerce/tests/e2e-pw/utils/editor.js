const { expect } = require( '@playwright/test' );

const closeWelcomeModal = async ( { page } ) => {
	// Close welcome popup if prompted
	try {
		await page
			.getByLabel( 'Close', { exact: true } )
			.click( { timeout: 5000 } );
	} catch ( error ) {
		// Welcome modal wasn't present, skipping action.
	}
};

const disableWelcomeModal = async ( { page } ) => {
	// Further info: https://github.com/woocommerce/woocommerce/pull/45856/
	await page.waitForLoadState( 'domcontentloaded' );

	const isWelcomeGuideActive = await page.evaluate( () =>
		wp.data.select( 'core/edit-post' ).isFeatureActive( 'welcomeGuide' )
	);

	if ( isWelcomeGuideActive ) {
		await page.evaluate( () =>
			wp.data.dispatch( 'core/edit-post' ).toggleFeature( 'welcomeGuide' )
		);
	}
};

const openEditorSettings = async ( { page } ) => {
	// Open Settings sidebar if closed
	if ( await page.getByLabel( 'Editor Settings' ).isVisible() ) {
		console.log( 'Editor Settings is open, skipping action.' );
	} else {
		await page.getByLabel( 'Settings', { exact: true } ).click();
	}
};

const getCanvas = async ( page ) => {
	return page.frame( 'editor-canvas' ) || page;
};

const goToPageEditor = async ( { page } ) => {
	await page.goto( 'wp-admin/post-new.php?post_type=page' );
	await disableWelcomeModal( { page } );
};

const goToPostEditor = async ( { page } ) => {
	await page.goto( 'wp-admin/post-new.php' );
	await disableWelcomeModal( { page } );
};

const fillPageTitle = async ( page, title ) => {
	await ( await getCanvas( page ) ).getByLabel( 'Add title' ).fill( title );
};

const insertBlock = async ( page, blockName ) => {
	await page.getByLabel( 'Toggle block inserter' ).click();
	await page.getByPlaceholder( 'Search', { exact: true } ).fill( blockName );
	await page.getByRole( 'option', { name: blockName, exact: true } ).click();
	await page.getByLabel( 'Toggle block inserter' ).click();
};

const insertBlockByShortcut = async ( page, blockName ) => {
	const canvas = await getCanvas( page );
	await canvas.getByRole( 'button', { name: 'Add default block' } ).click();
	await canvas
		.getByRole( 'document', {
			name: 'Empty block; start writing or type forward slash to choose a block',
		} )
		.pressSequentially( `/${ blockName }` );
	await expect(
		page.getByRole( 'option', { name: blockName, exact: true } )
	).toBeVisible();
	await page.getByRole( 'option', { name: blockName, exact: true } ).click();
	await expect(
		page.getByLabel( `Block: ${ blockName }` ).first()
	).toBeVisible();
};

const transformIntoBlocks = async ( page ) => {
	const canvas = await getCanvas( page );

	await expect(
		canvas.locator(
			'.wp-block-woocommerce-classic-shortcode__placeholder-copy'
		)
	).toBeVisible();
	await canvas
		.getByRole( 'button' )
		.filter( { hasText: 'Transform into blocks' } )
		.click();

	await expect( page.getByLabel( 'Dismiss this notice' ) ).toContainText(
		'Classic shortcode transformed to blocks.'
	);
};

const publishPage = async ( page, pageTitle ) => {
	await page
		.getByRole( 'button', { name: 'Publish', exact: true } )
		.dispatchEvent( 'click' );
	await page
		.getByRole( 'region', { name: 'Editor publish' } )
		.getByRole( 'button', { name: 'Publish', exact: true } )
		.click();
	await expect(
		page.getByText( `${ pageTitle } is now live.` )
	).toBeVisible();
};

module.exports = {
	closeWelcomeModal,
	goToPageEditor,
	goToPostEditor,
	disableWelcomeModal,
	openEditorSettings,
	getCanvas,
	fillPageTitle,
	insertBlock,
	insertBlockByShortcut,
	transformIntoBlocks,
	publishPage,
};
