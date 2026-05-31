/// <reference types="nativewind/types" />

declare const global: typeof globalThis;

declare const process: {
  env: {
    NODE_ENV?: string;
  };
};
