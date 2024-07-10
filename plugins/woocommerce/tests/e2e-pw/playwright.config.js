require( 'dotenv' ).config( { path: __dirname + '/.env' } );

const testsRootPath = __dirname;
const testsResultsPath = `${ testsRootPath }/test-results`;

const {
	ALLURE_RESULTS_DIR,
	BASE_URL,
	CI,
	DEFAULT_TIMEOUT_OVERRIDE,
	E2E_MAX_FAILURES,
	PLAYWRIGHT_HTML_REPORT,
	REPEAT_EACH,
} = process.env;

const reporter = [
	[ 'list' ],
	[
		'allure-playwright',
		{
			outputFolder:
				ALLURE_RESULTS_DIR ??
				`${ testsRootPath }/test-results/allure-results`,
			detail: true,
			suiteTitle: true,
			environmentInfo: {
				Node: process.version,
				OS: process.platform,
				WP: process.env.WP_VERSION,
				CI: process.env.CI,
			},
		},
	],
	[
		'json',
		{
			outputFile: `${ testsRootPath }/test-results/test-results-${ Date.now() }.json`,
		},
	],
];

if ( process.env.CI ) {
	reporter.push( [ 'github' ] );
	reporter.push( [ 'buildkite-test-collector/playwright/reporter' ] );
	reporter.push( [ `${ testsRootPath }/reporters/skipped-tests.js` ] );
} else {
	reporter.push( [
		'html',
		{
			outputFolder:
				PLAYWRIGHT_HTML_REPORT ??
				`${ testsResultsPath }/playwright-report`,
			open: 'on-failure',
		},
	] );
}

const config = {
	timeout: DEFAULT_TIMEOUT_OVERRIDE
		? Number( DEFAULT_TIMEOUT_OVERRIDE )
		: 120 * 1000,
	expect: { timeout: 20 * 1000 },
	outputDir: `${ testsResultsPath }/results-data`,
	globalSetup: require.resolve( './global-setup' ),
	globalTeardown: require.resolve( './global-teardown' ),
	testDir: `${ testsRootPath }/tests`,
	retries: CI ? 1 : 0,
	repeatEach: REPEAT_EACH ? Number( REPEAT_EACH ) : 1,
	workers: 1,
	reportSlowTests: { max: 5, threshold: 30 * 1000 }, // 30 seconds threshold
	reporter,
	maxFailures: E2E_MAX_FAILURES ? Number( E2E_MAX_FAILURES ) : 0,
	use: {
		baseURL: BASE_URL ?? 'http://localhost:8086',
		screenshot: { mode: 'only-on-failure', fullPage: true },
		stateDir: `${ testsRootPath }/.state/`,
		trace:
			/^https?:\/\/localhost/.test( BASE_URL ) || ! CI
				? 'retain-on-first-failure'
				: 'off',
		video: 'retain-on-failure',
		viewport: { width: 1280, height: 720 },
		actionTimeout: 20 * 1000,
		navigationTimeout: 20 * 1000,
	},
	snapshotPathTemplate: '{testDir}/{testFilePath}-snapshots/{arg}',
	projects: [],
};

module.exports = config;
