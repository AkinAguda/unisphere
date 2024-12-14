<script lang="ts">
	import Unisphere from '$lib';
	import type { Point, Connection } from '$lib';

	type PointTypes = 'miner' | 'validator';

	let points: Point<PointTypes>[] = $state([]);
	let connections: Connection[] = $state([]);
	let selectedPoint: string | undefined = $state(undefined);

	const getData = async () => {
		const pointsFromServer = await fetch('/api/data').then((res) => res.json());

		points = pointsFromServer;
		const res = await fetch('/api/data', {
			method: 'POST',
			body: JSON.stringify({ points })
		});

		if (res.ok && res.body) {
			const reader = res.body.getReader();
			const decoder = new TextDecoder();
			while (true) {
				const { value, done } = await reader.read();

				if (done) {
					break;
				}

				const streamData = decoder.decode(value);

				const lines = streamData.split('\n');

				for (const line of lines) {
					if (!line.trim()) continue;

					try {
						if (line.startsWith('data:')) {
							const jsonArr = line.slice(5).trim();
							const parsed = JSON.parse(jsonArr);
							connections = parsed;
						}
					} catch (error) {
						console.log('Error parsing SSE message:', line);
						continue;
					}
				}
			}
		}
	};

	$effect(() => {
		getData();
	});
</script>

<div>
	<Unisphere types={['validator', 'miner']} {selectedPoint} {points} {connections} />
</div>

<style>
	:global(body) {
		margin: 0;
	}

	div {
		width: 100vw;
		height: 100vh;
		background: rgb(13, 19, 32);
		background: linear-gradient(180deg, rgba(13, 19, 32, 1) 0%, rgba(8, 12, 21, 1) 100%);
	}
</style>
