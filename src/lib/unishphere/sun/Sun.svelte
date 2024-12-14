<script lang="ts">
	import { INITIAL_SUN_INTENSITY, INITIAL_SUN_POSITION } from '$lib/constants/unisphere';
	import { directionalLight } from '$lib/stores/globe';
	import { T } from '@threlte/core';
	import { type DirectionalLight } from 'three';

	let lightRef: DirectionalLight | undefined = $state(undefined);
</script>

<T.DirectionalLight
	oncreate={(l) => {
		lightRef = l;
		directionalLight.$ = l;
	}}
	color="#eeeee7"
	intensity={INITIAL_SUN_INTENSITY}
	position={INITIAL_SUN_POSITION.toArray()}
></T.DirectionalLight>
