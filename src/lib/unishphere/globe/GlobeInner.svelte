<script lang="ts" generics="T extends string">
	import { T, useTask } from '@threlte/core';
	import { Color, Texture, ShaderMaterial, AdditiveBlending, MeshStandardMaterial } from 'three';

	import { CENTER_POSITION, getPlanetRadius } from '$lib/constants/unisphere';
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
	import { getResponsiveValue } from '$lib/utility/get-responsive-value';

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
	let worldMaterial: MeshStandardMaterial | undefined = $state(undefined);
	let earthGlowShader: ShaderMaterial | undefined = $state(undefined);
	let earthOrbShader: ShaderMaterial | undefined = $state(undefined);

	const pointsMap = $derived(
		points.reduce(
			(pointsMap, point) => {
				pointsMap[point.id] = point;
				return pointsMap;
			},
			{} as Record<PointInstance['id'], PointInstance>
		)
	);

	const revealTime = { value: 0 };

	useTask((delta) => {
		revealTime.value = Math.min(revealTime.value + delta * 1.5, 1);

		if (worldMaterial) {
			worldMaterial.opacity = revealTime.value;
		}

		if (fresnelShader && directionalLight.$) {
			fresnelShader.uniforms.directionalLight.value = directionalLight.$.position.clone();
			fresnelShader.uniforms.revealOpacity.value = revealTime.value;
		}

		if (earthGlowShader) {
			earthGlowShader.uniforms.revealOpacity.value = revealTime.value;
		}

		if (earthOrbShader) {
			earthOrbShader.uniforms.revealOpacity.value = revealTime.value;
		}

		if (globeGroup.$) {
			if (!selectedPoint) {
				globeGroup.$.rotation.y += 0.09 * delta;
			}
		}
	});

	const planetRadius = getPlanetRadius();
	const outerOrbPadding = getResponsiveValue({ base: 0.2, sm: 0.3 });
</script>

<T.Group
	oncreate={(g) => {
		globeGroup.$ = g;
	}}
	position={CENTER_POSITION.toArray()}
>
	<T.Mesh>
		<T.SphereGeometry args={[planetRadius, 28, 28]} />
		<T.MeshStandardMaterial
			oncreate={(m) => {
				worldMaterial = m;
			}}
			transparent
			{bumpMap}
			bumpScale={2}
			{map}
		/>
	</T.Mesh>

	<T.Mesh>
		<T.IcosahedronGeometry args={[planetRadius + 0.002, 14, 14]} />
		<T.ShaderMaterial
			oncreate={(s) => {
				earthGlowShader = s;
			}}
			attach="material"
			fragmentShader={glowFragmentSahder}
			vertexShader={glowVertexSahder}
			uniforms={{
				color: { value: new Color(0x000000) },
				fresnelColor: { value: new Color(0xffffff) },
				fresnelPower: { value: 0.7 },
				fresnelScale: { value: 0.7 },
				revealOpacity: {
					value: 0.0
				}
			}}
			transparent
		/>
	</T.Mesh>

	<T.Mesh>
		<T.IcosahedronGeometry args={[planetRadius + outerOrbPadding, 10, 10]} />
		<T.ShaderMaterial
			oncreate={(s) => {
				earthOrbShader = s;
			}}
			depthWrite={false}
			attach="material"
			fragmentShader={glowFragmentSahder}
			vertexShader={glowVertexSahder}
			uniforms={{
				color: { value: new Color(0x000000) },
				fresnelColor: { value: new Color(0xffffff) },
				fresnelPower: { value: 0.7 },
				fresnelScale: { value: 0.7 },
				revealOpacity: {
					value: 0.0
				}
			}}
			transparent
		/>
	</T.Mesh>

	{#each points as point, index (point.id)}
		{@const { surfacePoint, direction } = createPOICoords(point.coords.lat, point.coords.lon)}

		<Indicator
			inidcatorType={getIndicatorType(point, pointStyles, thresholds)}
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
		<T.IcosahedronGeometry args={[planetRadius + 0.012, 14, 14]} />
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
				},
				revealOpacity: {
					value: 0.0
				}
			}}
		/>
	</T.Mesh>
{/if}

<FloatingParticles />
