import sentraTailwindPreset from '../../packages/design-token/src/tailwind'

export default {
  presets: [sentraTailwindPreset],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    '../../packages/sentra-ui/src/**/*.{ts,tsx}',
  ],
}
