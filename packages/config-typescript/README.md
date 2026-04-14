# @the-abyss/config-typescript

Shared TypeScript `tsconfig.json` base for the Abyss monorepo. Provides strict type-checking settings that all packages extend.

## Usage

```json
// tsconfig.json in any workspace package
{
  "extends": "@the-abyss/config-typescript/tsconfig.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```
