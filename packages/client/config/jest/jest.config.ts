import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  rootDir: '../../',
  transform: {
    '.(ts|tsx)$': 'ts-jest',
  },
  setupFiles: ['./config/jest/setup.ts'],
  testMatch: ['**/*.test.ts?(x)'],
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  moduleNameMapper: {
    '\\.(css|less|sass|scss|styl)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/config/jest/__mocks__/file-mock.ts',
    '\\.(svg)$': '<rootDir>/config/jest/__mocks__/svg-mock.tsx',
    '^@ff-client/(.*)': '<rootDir>/src/$1',
    '^@editor/(.*)': '<rootDir>/src/app/pages/forms/edit/$1',
    '^@components/(.*)': '<rootDir>/src/app/components/$1',
    '^@ff-icons/(.*)': '<rootDir>/src/assets/icons/$1',
  },
};

export default config;
