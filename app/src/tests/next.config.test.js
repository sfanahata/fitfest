const { withSentryConfig } = require('@sentry/nextjs');

// Mock the withSentryConfig function
jest.mock('@sentry/nextjs', () => ({
  withSentryConfig: jest.fn((config, options) => ({
    ...config,
    _sentryConfig: options,
  })),
}));

describe('next.config.js', () => {
  let originalEnv;

  beforeEach(() => {
    originalEnv = process.env.CI;
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env.CI = originalEnv;
    // Clear the module cache to ensure fresh imports
    delete require.cache[require.resolve('../../next.config.js')];
  });

  it('should wrap nextConfig with withSentryConfig', () => {
    const config = require('../../next.config.js');
    
    expect(withSentryConfig).toHaveBeenCalledTimes(1);
    expect(withSentryConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        experimental: { forceSwcTransforms: true },
        typescript: { ignoreBuildErrors: false },
        eslint: { ignoreDuringBuilds: false },
        webpack: expect.any(Function),
      }),
      expect.any(Object)
    );
  });

  it('should have correct Sentry configuration options', () => {
    const config = require('../../next.config.js');
    
    const [, sentryOptions] = withSentryConfig.mock.calls[0];
    
    expect(sentryOptions).toEqual({
      org: 'fitfest-a9',
      project: 'javascript-nextjs',
      silent: !process.env.CI,
      widenClientFileUpload: true,
      hideSourceMaps: true,
      disableLogger: true,
      automaticVercelMonitors: true,
    });
  });

  it('should set silent to false when CI environment is set', () => {
    process.env.CI = 'true';
    
    const config = require('../../next.config.js');
    
    const [, sentryOptions] = withSentryConfig.mock.calls[0];
    expect(sentryOptions.silent).toBe(false);
  });

  it('should set silent to true when CI environment is not set', () => {
    delete process.env.CI;
    
    const config = require('../../next.config.js');
    
    const [, sentryOptions] = withSentryConfig.mock.calls[0];
    expect(sentryOptions.silent).toBe(true);
  });

  it('should preserve original nextConfig properties', () => {
    const config = require('../../next.config.js');
    
    expect(config).toHaveProperty('experimental.forceSwcTransforms', true);
    expect(config).toHaveProperty('typescript.ignoreBuildErrors', false);
    expect(config).toHaveProperty('eslint.ignoreDuringBuilds', false);
    expect(config).toHaveProperty('webpack');
    expect(typeof config.webpack).toBe('function');
  });
});