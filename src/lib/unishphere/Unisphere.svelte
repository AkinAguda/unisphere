<script lang="ts" generics="const T extends readonly string[]">
	import { Canvas, T } from '@threlte/core';

	import Globe from './globe/Globe.svelte';
	import Stars from './stars/Stars.svelte';
	import Sun from './sun/Sun.svelte';
	import Camera from './camera/Camera.svelte';
	import type {
		Connection,
		Point,
		PointStyles,
		PointIntensityThresholds
	} from '$lib/types/unisphere';
	import { DEFAULT_POINT_STYlES, DEFAULT_POINT_THRESHOLDS } from '$lib/constants/unisphere';

	type Props<T extends readonly string[]> = {
		points: Point<T[number]>[];
		connections?: Connection[];
		types: T;
		selectedPoint?: Point<T[number]>['id'];
		pointStyles?: Partial<PointStyles<T[number]>>;
		thresholds?: PointIntensityThresholds<T[number]>;
	};

	type PointInstance = (typeof points)[number];

	let {
		points,
		selectedPoint = $bindable(),
		connections = [],
		types,
		pointStyles: pointStylesFromProps = {},
		thresholds = DEFAULT_POINT_THRESHOLDS
	}: Props<T> = $props();

	const pointStyles = { ...DEFAULT_POINT_STYlES, ...pointStylesFromProps };

	const pointsMap = $derived(
		points.reduce(
			(pointsMap, point) => {
				pointsMap[point.id] = point;
				return pointsMap;
			},
			{} as Record<PointInstance['id'], PointInstance>
		)
	);
</script>

<Canvas>
	<Camera {selectedPoint} {pointsMap} />

	<T.AmbientLight intensity={0.7} />

	<T.Group>
		<Stars bind:selectedPoint>
			<Sun />
			<Globe bind:selectedPoint {pointsMap} {thresholds} {pointStyles} {connections} {points} />
		</Stars>
	</T.Group>
</Canvas>
