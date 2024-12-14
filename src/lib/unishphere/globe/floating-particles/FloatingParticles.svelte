<script lang="ts">
	import { T, useStage, useTask } from '@threlte/core';
	import { Vector3, MathUtils, ShaderMaterial } from 'three';

	import vertexShader from './shaders/vertex-shader.glsl?raw';
	import fragmentShader from './shaders/fragment-shader.glsl?raw';

	const PARTICLES_COUNT = 50;
	const RADIUS = 2.5;

	let shaderRef: ShaderMaterial | undefined = $state(undefined);

	const positions = new Float32Array(PARTICLES_COUNT * 3);

	for (let i = 0; i < PARTICLES_COUNT; i++) {
		const distance = Math.sqrt(Math.random() + 0.2) * RADIUS;
		const theta = MathUtils.randFloatSpread(360);
		const phi = MathUtils.randFloatSpread(360);

		let x = distance * Math.sin(theta) * Math.cos(phi);
		let y = distance * Math.sin(theta) * Math.sin(phi);
		let z = distance * Math.cos(theta);

		positions.set([x, y, z], i * 3);
	}

	useTask((delta) => {
		if (shaderRef) {
			shaderRef.uniforms.uTime.value += delta;
		}
	});
</script>

<T.Points position={new Vector3(0, 0, 0).toArray()}>
	<T.BufferGeometry>
		<T.BufferAttribute
			attach="attributes.position"
			count={positions.length / 3}
			array={positions}
			itemSize={3}
		/>
	</T.BufferGeometry>

	<T.ShaderMaterial
		oncreate={(c) => {
			shaderRef = c;
		}}
		{fragmentShader}
		{vertexShader}
		uniforms={{
			uTime: {
				value: 0.0
			},
			uRadius: {
				value: RADIUS
			}
		}}
	/>
</T.Points>
