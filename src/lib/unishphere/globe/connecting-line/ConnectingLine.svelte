<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { Vector3, CatmullRomCurve3, ShaderMaterial, Quaternion } from 'three';

	import fragmentShader from './shaders/fragment-shader.glsl?raw';
	import vertexShader from './shaders/vertex-shader.glsl?raw';

	import ringPulseFragmentShader from '../pulsing-ring-shaders/fragment-shader.glsl?raw';
	import ringPulseVertexShader from '../pulsing-ring-shaders/vertex-shader.glsl?raw';
	import { EASINGS } from '$lib/constants/unisphere';
	import { clamp } from 'three/src/math/MathUtils.js';

	type Props = {
		origin: Vector3;
		destination: Vector3;
		disappearDelay?: number; // Delay in s
	};

	const { origin, destination, disappearDelay = 1 }: Props = $props();

	const sphereRadius = origin.length();

	// Calculate dynamic arch speed based on distance
	const distanceFactor = origin.distanceTo(destination);
	const baseArchSpeed = Math.max(0.2, Math.min(1 / (distanceFactor * 0.4), 1)); // Adjust multipliers as needed
	const tubeSegments = Math.round(clamp(distanceFactor * 50, 30, 90));

	const intermediatePoints = (() => {
		const points = [];
		const numPoints = Math.round(clamp(distanceFactor * 20, 10, 30));

		const arcHeight = Math.min((Math.pow(distanceFactor, 2) * 0.1) / sphereRadius, 0.3);

		for (let i = 0; i <= numPoints; i++) {
			const t = i / numPoints;

			const interpolatedPoint = new Vector3().copy(origin).lerp(destination, t);

			if (i > 0 && i < numPoints) {
				const heightFactor = Math.sin(Math.PI * t) * arcHeight;

				interpolatedPoint.normalize().multiplyScalar(sphereRadius * (1 + heightFactor));
			} else {
				interpolatedPoint.normalize().multiplyScalar(sphereRadius);
			}

			points.push(interpolatedPoint);
		}

		return points;
	})();

	const curve = new CatmullRomCurve3(intermediatePoints);
	let connectingLineShader: ShaderMaterial | undefined = $state(undefined);
	let ringPulseShader: ShaderMaterial | undefined = $state(undefined);

	const archSpeed = baseArchSpeed / distanceFactor;
	const pulseSpeed = 1.5; // per second

	let progress = $state(0);
	const pulseProgress = { value: 0 };
	const timeSinceFullDraw = { value: 0 };
	const shouldErase = { value: 0 }; // ) means dont erase, 1 means we should

	useTask((delta) => {
		if (connectingLineShader) {
			progress = Math.min(progress + archSpeed * delta, 1);

			connectingLineShader.uniforms.progress.value = progress;
			connectingLineShader.uniforms.erase.value = shouldErase.value;

			if (progress === 1 && ringPulseShader) {
				pulseProgress.value = Math.min(pulseProgress.value + pulseSpeed * delta, 1);
				ringPulseShader.uniforms.time.value = EASINGS.easeOutQuad(pulseProgress.value);
				timeSinceFullDraw.value += delta;
			} else {
				pulseProgress.value = 0;
				timeSinceFullDraw.value = 0;
			}

			if (!shouldErase.value && timeSinceFullDraw.value > disappearDelay) {
				shouldErase.value = 1;
				progress = 0;
			}
		}
	});

	const endPoint = intermediatePoints[intermediatePoints.length - 1];

	const planeRotationQuaternion = new Quaternion().setFromUnitVectors(
		new Vector3(0, 0, 1),
		endPoint.clone().normalize()
	);

	// Slightly translate the point outward
	const destinationTranslatedPosition = endPoint
		.clone()
		.add(endPoint.clone().normalize().multiplyScalar(0.015));
</script>

<T.Group
	renderOrder={2}
	position={destinationTranslatedPosition.toArray()}
	quaternion={planeRotationQuaternion.toArray()}
>
	<T.Mesh>
		<T.PlaneGeometry args={[0.12, 0.12]} />
		<T.ShaderMaterial
			oncreate={(material) => {
				ringPulseShader = material;
			}}
			transparent
			vertexShader={ringPulseVertexShader}
			fragmentShader={ringPulseFragmentShader}
			uniforms={{
				ringThickness: { value: 0.025 },
				ringRadius: {
					value: 1.0
				},
				time: {
					value: 0.0
				}
			}}
		/>
	</T.Mesh>
</T.Group>

<T.Mesh castShadow={false} receiveShadow={false}>
	<T.TubeGeometry args={[curve, tubeSegments, 0.0025, 8, false]} />
	<T.ShaderMaterial
		depthWrite={false}
		oncreate={(m) => {
			connectingLineShader = m;
		}}
		transparent
		uniforms={{
			progress: {
				value: 0.0
			},
			erase: {
				value: 0
			}
		}}
		{fragmentShader}
		{vertexShader}
	/>
</T.Mesh>
