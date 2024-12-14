<script lang="ts" generics="T extends string">
	import { T, useTask } from '@threlte/core';
	import { Color, Texture, ShaderMaterial, AdditiveBlending } from 'three';

	import { CENTER_POSITION, PLANET_RADIUS } from '$lib/constants/unisphere';
	import { getIndicatorType } from '$lib/utility/get-indicator-type';
	import { createPOICoords, latLonToSphereCoords } from '$lib/utility/lat-lon-to-sphere-coords';

	import glowFragmentSahder from './world-glow-shaders/fragment-shader.glsl?raw';
	import glowVertexSahder from './world-glow-shaders/vertex-shader.glsl?raw';

	import fresnelFragmentSahder from './world-fresnel-shaders/fragment-shader.glsl?raw';
	import fresnelVertexSahder from './world-fresnel-shaders/vertex-shader.glsl?raw';

	import Indicator from './indicator/Indicator.svelte';
	import ConnectingLine from './connecting-line/ConnectingLine.svelte';
	import type { BaseGlobeProps } from './types';
	import { directionalLight, globeGroup } from '$lib/stores/globe';
	import FloatingParticles from './floating-particles/FloatingParticles.svelte';

	interface Props<T extends string> extends BaseGlobeProps<T> {
		map: Texture;
		bumpMap: Texture;
	}

	let {
		map,
		bumpMap,
		points,
		connections,
		pointStyles,
		thresholds,
		selectedPoint = $bindable()
	}: Props<T> = $props();

	type PointInstance = (typeof points)[number];

	let fresnelShader: ShaderMaterial | undefined = $state(undefined);

	const pointsMap = $derived(
		points.reduce(
			(pointsMap, point) => {
				pointsMap[point.id] = point;
				return pointsMap;
			},
			{} as Record<PointInstance['id'], PointInstance>
		)
	);

	useTask((delta) => {
		if (fresnelShader && directionalLight.$) {
			fresnelShader.uniforms.directionalLight.value = directionalLight.$.position.clone();
		}

		if (globeGroup.$) {
			if (!selectedPoint) {
				globeGroup.$.rotation.y += 0.09 * delta;
			}
		}
	});
</script>

<T.Group
	oncreate={(g) => {
		globeGroup.$ = g;
	}}
	position={CENTER_POSITION.toArray()}
>
	<T.Mesh>
		<T.SphereGeometry args={[PLANET_RADIUS, 28, 28]} />
		<T.MeshStandardMaterial {bumpMap} bumpScale={2} {map} />
	</T.Mesh>

	<T.Mesh>
		<T.IcosahedronGeometry args={[PLANET_RADIUS + 0.002, 14, 14]} />
		<T.ShaderMaterial
			attach="material"
			fragmentShader={glowFragmentSahder}
			vertexShader={glowVertexSahder}
			uniforms={{
				color: { value: new Color(0x000000) },
				fresnelColor: { value: new Color(0xffffff) },
				fresnelPower: { value: 0.7 },
				fresnelScale: { value: 0.7 }
			}}
			transparent
		/>
	</T.Mesh>

	<T.Mesh>
		<T.IcosahedronGeometry args={[PLANET_RADIUS + 0.3, 10, 10]} />
		<T.ShaderMaterial
			depthWrite={false}
			attach="material"
			fragmentShader={glowFragmentSahder}
			vertexShader={glowVertexSahder}
			uniforms={{
				color: { value: new Color(0x000000) },
				fresnelColor: { value: new Color(0xffffff) },
				fresnelPower: { value: 0.7 },
				fresnelScale: { value: 0.7 }
			}}
			transparent
		/>
	</T.Mesh>

	{#each points as point, index (point.id)}
		{@const { surfacePoint, direction } = createPOICoords(point.coords.lat, point.coords.lon)}

		<Indicator
			type={getIndicatorType(point, pointStyles, thresholds)}
			{point}
			{direction}
			{selectedPoint}
			{surfacePoint}
			visibilityDelay={index * 0.01}
			onclick={() => {
				if (selectedPoint !== point.id) {
					selectedPoint = point.id;
				} else {
					selectedPoint = undefined;
				}
			}}
		/>
	{/each}

	{#each connections as connection (connection.id)}
		{@const fromPoint = pointsMap[connection.from]}
		{@const toPoint = pointsMap[connection.to]}
		{@const origin = latLonToSphereCoords(fromPoint.coords.lat, fromPoint.coords.lon)}
		{@const destination = latLonToSphereCoords(toPoint.coords.lat, toPoint.coords.lon)}

		<ConnectingLine {origin} {destination} />
	{/each}
</T.Group>

{#if directionalLight.$}
	<T.Mesh renderOrder={1} position={CENTER_POSITION.toArray()}>
		<T.IcosahedronGeometry args={[PLANET_RADIUS + 0.012, 14, 14]} />
		<T.ShaderMaterial
			blending={AdditiveBlending}
			oncreate={(v) => {
				fresnelShader = v;
			}}
			transparent
			fragmentShader={fresnelFragmentSahder}
			vertexShader={fresnelVertexSahder}
			uniforms={{
				fresnelPower: { value: 1.3 },
				fresnelScale: { value: 1.2 },
				directionalLight: {
					value: directionalLight.$.position.clone()
				}
			}}
		/>
	</T.Mesh>
{/if}

<FloatingParticles />
