# Unisphere

Unisphere is a simple opinionated Globe visualiser from rayon labs. It features:

- Visualising longitude and latitude on the eath witha typesafe API
- Visualising connections between these points
- Fous and select a point on the map

## The API

The API tries to be typesafe:

The most basic usecase is:

```svelte
<script lang="ts">
	import Unisphere, { type Point, type Connection } from 'unisphere';
</script>

<Unisphere
	types={['validator', 'miner']}
	points={[
		{
			id: '1',
			type: 'miner',
			intensity: 0.6,
			coords: {
				lat: 40.73061,
				lon: -73.935242
			}
		}
	]}
	connections={[]}
/>
```
