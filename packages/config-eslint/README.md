# @the-abyss/config-eslint

Shared ESLint configurations for the Abyss monorepo.

## Configs

| File       | Extends                                     |
| ---------- | ------------------------------------------- |
| `base.js`  | Base JS/TS rules — use in any package       |
| `node.js`  | Node.js-specific rules (scripts, CLI tools) |
| `react.js` | React + JSX rules for frontend apps         |

## Usage

```js
// .eslintrc.js in any workspace package
module.exports = {
  extends: ['@the-abyss/config-eslint/base'],
}
```

For React packages:

```js
module.exports = {
  extends: ['@the-abyss/config-eslint/react'],
}
```
