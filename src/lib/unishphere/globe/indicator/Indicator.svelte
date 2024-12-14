<script lang="ts" generics="T extends string">
	import { Mesh, Quaternion, ShaderMaterial, Vector3 } from 'three';
	import { T, useTask } from '@threlte/core';
	import { useCursor, useInteractivity } from '@threlte/extras';

	import type { Point, PointInidicatorTypes } from '$lib/types/unisphere';
	import { EASINGS } from '$lib/constants/unisphere';

	import ringPulseFragmentShader from '../pulsing-ring-shaders/fragment-shader.glsl?raw';
	import ringPulseVertexShader from '../pulsing-ring-shaders/vertex-shader.glsl?raw';

	import verticalIndicatorVertexShader from './vertical-indicator-shaders/vertex-shader.glsl?raw';
	import verticalIndicatorFragmentShader from './vertical-indicator-shaders/fragment-shader.glsl?raw';

	import glowingHexagonFragmentShader from './glowing-hexagon-shaders/fragment-shader.glsl?raw';
	import glowingHexagonVertexShader from './glowing-hexagon-shaders/vertex-shader.glsl?raw';
	import { clamp, inverseLerp } from 'three/src/math/MathUtils.js';
	import Sparkles from './sparkles/Sparkles.svelte';

	type Props<T extends string> = {
		surfacePoint: Vector3;
		direction: Vector3;
		type: PointInidicatorTypes;
		selectedPoint?: Point<T>['id'];
		onclick?: () => void;
		visibilityDelay?: number;
		point: Point<T>;
	};

	const STEM_REVEAL_DURATION = 0.5;
	const GREYSCALE_SPEED = 0.8;

	const {
		surfacePoint,
		direction,
		type,
		selectedPoint,
		onclick,
		visibilityDelay = 0,
		point
	}: Props<T> = $props();

	const time = { value: 0 };
	const greyscale = { value: 0 };

	let timeSinceMount = $state(-1 * visibilityDelay);

	const rotationQuaternion = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), direction);

	const translatedPosition = surfacePoint.clone().add(direction.multiplyScalar(0.02));

	let ringPulseShaderRef: ShaderMaterial | undefined = $state(undefined);
	let verticalIndicatorShaderRef: ShaderMaterial | undefined = $state(undefined);
	let topBoxMeshRef: Mesh | undefined = $state(undefined);
	let hexagon1Ref: ShaderMaterial | undefined = $state(undefined);
	let hexagon2Ref: ShaderMaterial | undefined = $state(undefined);

	useTask((delta) => {
		time.value = (time.value + delta) % 1;

		timeSinceMount += delta;

		if (selectedPoint && selectedPoint !== point.id) {
			greyscale.value = clamp(greyscale.value + delta * GREYSCALE_SPEED, 0, 1);
		} else {
			greyscale.value = clamp(greyscale.value - delta * GREYSCALE_SPEED, 0, 1);
		}

		if (ringPulseShaderRef) {
			ringPulseShaderRef.uniforms.time.value = EASINGS.easeInOutQuad(time.value);
		}

		if (verticalIndicatorShaderRef) {
			verticalIndicatorShaderRef.uniforms.progress.value = inverseLerp(
				0,
				STEM_REVEAL_DURATION,
				timeSinceMount
			);

			verticalIndicatorShaderRef.uniforms.greyscale.value = greyscale.value;
		}

		if (hexagon1Ref && hexagon2Ref) {
			hexagon1Ref.uniforms.greyscale.value = greyscale.value;
			hexagon2Ref.uniforms.greyscale.value = greyscale.value;
		}

		if (topBoxMeshRef) {
			topBoxMeshRef.rotation.x += 0.01;
			topBoxMeshRef.rotation.y += 0.01;
			const computedScale = clamp(
				inverseLerp(STEM_REVEAL_DURATION, STEM_REVEAL_DURATION + 0.5, timeSinceMount),
				0,
				1
			);
			topBoxMeshRef.scale.set(computedScale, computedScale, computedScale);
		}
	});

	const VERTICAL_INDICATOR_RADIUS = 0.0025;
	const INIDICATOR_CUBE_SIZE = 0.008;
	const VERTICAL_INDICATOR_LENGTH = 0.13;
	const VERTICAL_INDICATOR_OFFSET = VERTICAL_INDICATOR_LENGTH / 2 - 0.007;

	useInteractivity();

	const { onPointerEnter, onPointerLeave } = useCursor('pointer');
</script>

<T.Group
	interactive
	position={translatedPosition.toArray()}
	quaternion={rotationQuaternion.toArray()}
>
	{#if selectedPoint === point.id}
		<T.Mesh rotation.x={-Math.PI / 2}>
			<T.PlaneGeometry args={[0.15, 0.15]} />
			<T.ShaderMaterial
				oncreate={(material) => {
					ringPulseShaderRef = material;
				}}
				transparent
				depthWrite={false}
				vertexShader={ringPulseVertexShader}
				fragmentShader={ringPulseFragmentShader}
				uniforms={{
					ringThickness: { value: 0.025 },
					ringRadius: {
						value: 0.9
					},
					time: {
						value: 0
					}
				}}
			/>
		</T.Mesh>
	{/if}

	{#if type === 'sparkling-beacon' || type === 'sparkling-tower'}
		<Sparkles position={new Vector3(0, 0.002, 0)} />
	{/if}

	<!-- {#if type === 'beacon' || type === 'tower'} -->
	<T.Group
		{onclick}
		onpointerenter={onPointerEnter}
		onpointerleave={onPointerLeave}
		depthWrite={false}
		position={new Vector3(0, VERTICAL_INDICATOR_OFFSET, 0).toArray()}
	>
		{#if type === 'tower'}
			<T.Group rotation.x={-Math.PI / 2} depthWrite={false}>
				<T.Mesh castShadow={false} receiveShadow={false} depthWrite={false} position.z={0.012}>
					<T.PlaneGeometry args={[0.02, 0.02]} />
					<T.ShaderMaterial
						transparent
						vertexShader={glowingHexagonVertexShader}
						fragmentShader={glowingHexagonFragmentShader}
						uniforms={{
							thickness: {
								value: 0.3
							},
							greyscale: {
								value: 0
							}
						}}
						oncreate={(s) => {
							hexagon1Ref = s;
						}}
					/>
				</T.Mesh>

				<T.Mesh castShadow={false} receiveShadow={false} depthWrite={false}>
					<T.PlaneGeometry args={[0.04, 0.04]} />
					<T.ShaderMaterial
						transparent
						vertexShader={glowingHexagonVertexShader}
						fragmentShader={glowingHexagonFragmentShader}
						uniforms={{
							thickness: {
								value: 0.2
							},
							greyscale: {
								value: 0
							}
						}}
						oncreate={(s) => {
							hexagon2Ref = s;
						}}
					/>
				</T.Mesh>
			</T.Group>
		{/if}

		<T.Mesh>
			<T.CylinderGeometry
				args={[
					VERTICAL_INDICATOR_RADIUS,
					VERTICAL_INDICATOR_RADIUS,
					VERTICAL_INDICATOR_LENGTH,
					4,
					1,
					true
				]}
			/>

			<T.ShaderMaterial
				oncreate={(s) => {
					verticalIndicatorShaderRef = s;
				}}
				transparent
				depthWrite={false}
				vertexShader={verticalIndicatorVertexShader}
				fragmentShader={verticalIndicatorFragmentShader}
				uniforms={{
					progress: {
						value: 0
					},
					greyscale: {
						value: 0
					}
				}}
			/>
		</T.Mesh>

		<T.Mesh
			oncreate={(m) => {
				topBoxMeshRef = m;
			}}
			position={new Vector3(0, VERTICAL_INDICATOR_OFFSET + 0.02, 0).toArray()}
			castShadow={false}
			receiveShadow={false}
		>
			<T.BoxGeometry args={[INIDICATOR_CUBE_SIZE, INIDICATOR_CUBE_SIZE, INIDICATOR_CUBE_SIZE]} />
			<T.MeshStandardMaterial color={selectedPoint === point.id ? '#f3f700' : '#ebebeb'} />
		</T.Mesh>
	</T.Group>
	<!-- {/if} -->
</T.Group>
