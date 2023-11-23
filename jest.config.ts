import { type Config } from '@jest/types';

const jestConfig: Config.InitialOptions = {
    preset: 'ts-jest/presets/default-esm',

    extensionsToTreatAsEsm: ['.ts', '.mts', '.json'],
    // eslint-disable-next-line @typescript-eslint/naming-convention
    moduleNameMapper: { '^(\\.{1,2}/.*)\\.m?js$': '$1' },

    transform: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        '\\.test\\.m?ts$': [
            'ts-jest',
            {
                useESM: true,
                isolatedModules: false,
            },
        ],
    },
    collectCoverageFrom: ['<rootDir>/src/**/*.*ts'],
    testEnvironment: 'node',

    bail: true,
    testRegex: '(/__tests__/.*\\.test\\.ts)$',
    coveragePathIgnorePatterns: ['<rootDir>/src/main\\.m?ts$', '.*\\.module\\.m?ts$', '<rootDir>/src/health/'],
    coverageReporters: ['text-summary', 'html'],
    errorOnDeprecated: true,
    testTimeout: 60_000,
    verbose: true,
};

export default jestConfig;
