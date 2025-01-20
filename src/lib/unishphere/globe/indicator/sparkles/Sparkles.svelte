<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { Vector3, ShaderMaterial } from 'three';

	import vertexShader from './shaders/vertex-shader.glsl?raw';
	import fragmentShader from './shaders/fragment-shader.glsl?raw';
	import { getResponsiveValue } from '$lib/utility/get-responsive-value';

	type ParticleSystemProps = {
		position: Vector3;
		particleCount?: number;
	};

	const { position = new Vector3(0, 0, 0), particleCount }: ParticleSystemProps = $props();

	const LIFETIME = 2;
	const PARTICLES_COUNT = particleCount ?? getResponsiveValue({ base: 30, sm: 70 });

	let shaderMaterial = $state<ShaderMaterial | undefined>(undefined);

	const offsets = new Float32Array(PARTICLES_COUNT * 3);
	const colors = new Float32Array(PARTICLES_COUNT * 3);
	const velocities = new Float32Array(PARTICLES_COUNT * 3);
	const seeds = new Float32Array(PARTICLES_COUNT);
	const positions = new Float32Array(PARTICLES_COUNT * 3);
	const startTimes = new Float32Array(PARTICLES_COUNT);

	for (let i = 0; i < PARTICLES_COUNT; i++) {
		// Random initial offset
		offsets[i * 3] = (Math.random() - 0.5) * 0.05;
		offsets[i * 3 + 1] = (Math.random() - 0.5) * 0.05;
		offsets[i * 3 + 2] = (Math.random() - 0.5) * 0.05;

		// colors[i * 3] = Math.random();
		// colors[i * 3 + 1] = Math.random();
		// colors[i * 3 + 2] = Math.random();

		colors[i * 3] = 0.9882;
		colors[i * 3 + 1] = 1.0;
		colors[i * 3 + 2] = 0.4;

		// Random velocity with upward bias
		velocities[i * 3] = (Math.random() - 0.5) * 0.1;
		velocities[i * 3 + 1] = Math.random() * 0.5;
		velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.1;

		// Initial position is origin
		positions[i * 3] = 0;
		positions[i * 3 + 1] = 0;
		positions[i * 3 + 2] = 0;

		// Random seed for shader randomization
		seeds[i] = Math.random();

		// Stagger start times across the full lifetime
		startTimes[i] = Math.random() * LIFETIME;
	}

	const time = { value: 0 };

	useTask((delta) => {
		if (shaderMaterial) {
			time.value = (time.value + delta * 0.5) % LIFETIME;
			shaderMaterial.uniforms.time.value = time.value;
		}
	});
</script>

<T.Points position={position.toArray()}>
	<T.BufferGeometry>
		<T.BufferAttribute
			attach="attributes.position"
			name="position"
			array={positions}
			count={positions.length / 3}
			itemSize={3}
		/>
		<T.BufferAttribute
			attach="attributes.instanceOffset"
			name="instanceOffset"
			array={offsets}
			count={offsets.length / 3}
			itemSize={3}
		/>
		<T.BufferAttribute
			attach="attributes.instanceColor"
			name="instanceColor"
			array={colors}
			count={colors.length / 3}
			itemSize={3}
		/>
		<T.BufferAttribute
			attach="attributes.instanceVelocity"
			name="instanceVelocity"
			array={velocities}
			count={velocities.length / 3}
			itemSize={3}
		/>
		<T.BufferAttribute
			attach="attributes.instanceSeed"
			name="instanceSeed"
			array={seeds}
			count={seeds.length}
			itemSize={1}
		/>
		<T.BufferAttribute
			attach="attributes.instanceStartTime"
			name="instanceStartTime"
			array={startTimes}
			count={startTimes.length}
			itemSize={1}
		/>
	</T.BufferGeometry>

	<T.ShaderMaterial
		depthWrite={false}
		oncreate={(m) => {
			shaderMaterial = m;
		}}
		{vertexShader}
		{fragmentShader}
		uniforms={{
			time: { value: time.value }
		}}
		transparent
	/>
</T.Points>
