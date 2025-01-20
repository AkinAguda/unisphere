# Unisphere

A modern, type-safe Globe visualization library by Rayon Labs for mapping geographical data and connections.

## Features

- Type-safe API for visualizing points on Earth using longitude and latitude
- Connection visualization between geographical points
- Interactive point selection and focus capabilities
- Customizable point styles with intensity-based rendering
- Built-in TypeScript support

## Installation

```bash
npm install unisphere
# or
yarn add unisphere
# or
pnpm add unisphere
```

## Quick Start

```svelte
<script lang="ts">
	import Unisphere, { type Point, type Connection } from 'unisphere';

	// Define a point on the map
	const point: Point<'miner'> = {
		id: '1',
		type: 'miner',
		intensity: 0.6,
		coords: {
			lat: 40.73061,
			lon: -73.935242
		}
	};
</script>

<Unisphere types={['validator', 'miner']} points={[point]} connections={[]} />
```

## Point Styling

Unisphere uses an intensity-based styling system that allows you to define different visual representations based on point intensity thresholds.

### Available Point Types

- `beacon`: Standard beacon visualization
- `tower`: Elevated point marker
- `sparkling-beacon`: Animated beacon with particles
- `sparkling-tower`: Animated tower with particles

### Styling Configuration

Points can be styled using the `pointStyles` prop, which accepts an object defining styles for different intensity thresholds (`sm`, `md`, `lg`):

```typescript
type PointTypes = 'miner' | 'validator';

// Sample points data
const points: Point<PointTypes>[] = [
	{
		id: '1',
		coords: { lat: 40.7128, lon: -74.006 },
		intensity: 0.1,
		type: 'miner'
	},
	{
		id: '2',
		coords: { lat: 40.7128, lon: -74.006 },
		intensity: 0.1,
		type: 'validator'
	}
];

// Styling configuration
const pointStyles: PointStyles<PointTypes> = {
	// Style applied to all point types below first threshold
	sm: 'tower',

	// Different styles for each point type at medium intensity
	md: {
		validator: 'beacon',
		miner: {
			type: 'sparkling-beacon',
			meta: {
				particleCount: 10
			}
		}
	},

	// Styles for high-intensity points
	lg: {
		validator: 'beacon',
		miner: 'tower'
	}
};
```

### Styling Options

1. **Global Style**: Apply the same style to all point types for a threshold

   ```typescript
   sm: 'tower';
   ```

2. **Type-Specific Style**: Define different styles for each point type

   ```typescript
   md: {
     validator: 'beacon',
     miner: 'tower'
   }
   ```

3. **Enhanced Style**: Add metadata for additional customization
   ```typescript
   md: {
     miner: {
       type: 'sparkling-beacon',
       meta: {
         particleCount: 10
       }
     }
   }
   ```

## Props

| Prop          | Type           | Description                         |
| ------------- | -------------- | ----------------------------------- |
| `types`       | `string[]`     | Array of valid point types          |
| `points`      | `Point[]`      | Array of points to display          |
| `connections` | `Connection[]` | Array of connections between points |
| `pointStyles` | `PointStyles`  | Styling configuration for points    |

## TypeScript Support

Unisphere is built with TypeScript and provides full type safety. Use the exported types to ensure correct prop usage:

```typescript
import { type Point, type Connection, type PointStyles } from 'unisphere';
```

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

## License

[MIT License](LICENSE)
