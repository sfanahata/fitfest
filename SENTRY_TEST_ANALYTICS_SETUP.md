# Sentry Test Analytics Setup Guide

This guide explains how to complete the setup of Sentry Test Analytics for the FitFest project.

## What's Already Configured ✅

1. **Sentry Integration**: Sentry is already configured with DSN in `sentry.client.config.ts`
2. **Jest Configuration**: Jest is configured to output JUnit XML format via `jest-junit`
3. **GitHub Actions**: Workflow updated to upload test results to Sentry Test Analytics
4. **Dependencies**: `jest-junit` is already installed in `package.json`

## Required Setup Steps

### 1. Install Sentry App on GitHub

1. Go to [Sentry's GitHub App installation page](https://github.com/apps/sentry)
2. Click "Install" and select your organization or specific repositories
3. Grant the necessary permissions for the FitFest repository

### 2. Generate Repository Token

1. Go to your Sentry organization settings
2. Navigate to **Settings** → **Auth Tokens** → **Create New Token**
3. Select **Repository** scope
4. Copy the generated token

### 3. Add Repository Secret

1. Go to your GitHub repository: `https://github.com/sfanahata/fitfest`
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `SENTRY_PREVENT_TOKEN`
5. Value: Paste the repository token from step 2
6. Click **Add secret**

### 4. Verify Configuration

The GitHub Actions workflow will now:
- Run your Jest tests
- Generate JUnit XML output (`test-results.xml`)
- Upload test results to Sentry Test Analytics
- Continue uploading coverage to Codecov

## How It Works

### Test Execution Flow
1. **Tests Run**: Jest executes all tests in your test suite
2. **JUnit Output**: `jest-junit` generates `test-results.xml` with test results
3. **Sentry Upload**: `getsentry/prevent-action` uploads the XML to Sentry
4. **Analytics**: Sentry processes the data and provides insights

### What You'll See in Sentry

After your first test run with this configuration, you'll be able to:

1. **View Test Analytics Dashboard**: See overall test health and trends
2. **Identify Flaky Tests**: Tests that fail intermittently
3. **Track Test Performance**: Slowest tests and bottlenecks
4. **Monitor Test Failures**: Detailed failure information with stack traces
5. **PR Comments**: Automatic comments on pull requests with test results

### JUnit XML Format

The configuration generates JUnit XML with:
- Test suite names based on file paths
- Individual test case results
- Execution times
- Failure details and stack traces
- Coverage information (when available)

## Testing the Setup

1. **Push to a branch**: Create a test branch and push changes
2. **Check GitHub Actions**: Verify the workflow runs successfully
3. **View Sentry Dashboard**: Check your Sentry organization for test analytics
4. **Create a PR**: Test the PR comment functionality

## Troubleshooting

### Common Issues

1. **Missing Token**: Ensure `SENTRY_PREVENT_TOKEN` is set in repository secrets
2. **Permission Issues**: Verify Sentry GitHub App has repository access
3. **XML Format**: Check that `test-results.xml` is generated correctly
4. **Upload Failures**: Check GitHub Actions logs for detailed error messages

### Debug Steps

1. Check GitHub Actions logs for upload step
2. Verify `test-results.xml` is created in the workflow
3. Test locally: `npm test` should generate the XML file
4. Check Sentry organization settings for token permissions

## Next Steps

Once setup is complete:
1. Monitor test analytics in Sentry dashboard
2. Use insights to improve test reliability
3. Set up alerts for test failures
4. Optimize slow tests based on performance data

## Resources

- [Sentry Test Analytics Documentation](https://sentry-docs-git-sentry-prevent-test-analytics-docs.sentry.dev/product/test-analytics/)
- [Jest JUnit Reporter](https://github.com/jest-community/jest-junit)
- [Sentry Prevent Action](https://github.com/getsentry/prevent-action)
