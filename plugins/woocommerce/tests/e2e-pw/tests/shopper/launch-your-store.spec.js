const { test, expect, request } = require( '@playwright/test' );
const { setOption } = require( '../../utils/options' );

test.describe(
	'Launch Your Store front end - logged out',
	{ tag: [ '@payments', '@services' ] },
	() => {
		test.afterAll( async ( { baseURL } ) => {
			try {
				await setOption(
					request,
					baseURL,
					'woocommerce_coming_soon',
					'no'
				);
			} catch ( error ) {
				console.log( error );
			}
		} );

		test( 'Entire site coming soon mode', async ( { page, baseURL } ) => {
			try {
				await setOption(
					request,
					baseURL,
					'woocommerce_coming_soon',
					'yes'
				);

				await setOption(
					request,
					baseURL,
					'woocommerce_store_pages_only',
					'no'
				);
			} catch ( error ) {
				console.log( error );
			}

			await page.goto( baseURL );

			await page
				.locator( '.woocommerce-coming-soon-banner' )
				.waitFor( { state: 'visible' } );

			await expect(
				page.getByText(
					"Pardon our dust! We're working on something amazing — check back soon!"
				)
			).toBeVisible();
		} );

		test( 'Store only coming soon mode', async ( { page, baseURL } ) => {
			try {
				await setOption(
					request,
					baseURL,
					'woocommerce_coming_soon',
					'yes'
				);

				await setOption(
					request,
					baseURL,
					'woocommerce_store_pages_only',
					'yes'
				);
			} catch ( error ) {
				console.log( error );
			}

			await page.goto( baseURL + '/shop/' );

			await expect(
				page.getByText( 'Great things are on the horizon' )
			).toBeVisible();

			await expect(
				page.getByText(
					'Something big is brewing! Our store is in the works and will be launching soon!'
				)
			).toBeVisible();
		} );
	}
);
