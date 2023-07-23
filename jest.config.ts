import { type Config } from '@jest/types';

const jestConfig: Config.InitialOptions = {
    preset: 'ts-jest/presets/default-esm',

    extensionsToTreatAsEsm: ['.ts', '.mts', '.json'],
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.m?js$': '$1', // eslint-disable-line @typescript-eslint/naming-convention
    },

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
    coveragePathIgnorePatterns: [
        '<rootDir>/src/main\\.m?ts$',
        '.*\\.module\\.m?ts$',
        '<rootDir>/src/health/',
    ],
    coverageReporters: ['text-summary', 'html'],
    errorOnDeprecated: true,
    testTimeout: 60_000,
    verbose: true,
};

export default jestConfig;
