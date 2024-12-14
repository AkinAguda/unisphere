<script lang="ts" generics="const T extends string[]">
	import { T, useThrelte } from '@threlte/core';
	import { interactivity } from '@threlte/extras';
	import {
		BackSide,
		LinearFilter,
		Mesh,
		OrthographicCamera,
		PlaneGeometry,
		Scene,
		ShaderMaterial,
		Vector2,
		WebGLRenderTarget
	} from 'three';
	import { CENTER_POSITION } from '$lib/constants/unisphere';

	import vertexShader from './shaders/vertex-shader.glsl?raw';
	import fragmentShader from './shaders/fragment-shader.glsl?raw';
	import type { Snippet } from 'svelte';
	import type { Point } from '$lib/types/unisphere';

	const STAR_CUBE_SIZE = 30;

	type Props<T extends string[]> = {
		selectedPoint?: Point<T[number]>['id'];
		children: Snippet;
	};

	let { children, selectedPoint = $bindable() }: Props<T> = $props();

	const maxWindowDimension = $derived(
		Math.min(Math.max(window.innerWidth, window.innerHeight), 900)
	);

	interactivity();

	const { renderer } = useThrelte();

	const renderToTexture = (seed: number) => {
		const renderTarget = new WebGLRenderTarget(2000, 2000);

		renderTarget.texture.magFilter = LinearFilter;

		const rtScene = new Scene();

		const rtCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

		const geometry = new PlaneGeometry(2, 2);

		const material = new ShaderMaterial({
			fragmentShader,
			vertexShader,
			uniforms: {
				time: { value: 0.0 },
				resolution: { value: new Vector2(maxWindowDimension, maxWindowDimension) }
			}
		});
		material.side = BackSide;
		const mesh = new Mesh(geometry, material);
		rtScene.add(mesh);

		renderer.setRenderTarget(renderTarget);
		renderer.render(rtScene, rtCamera);
		renderer.setRenderTarget(null);

		return material;
	};

	const materialArray = new Array(6).fill(null).map((i) => renderToTexture(i));
	let isMouseDown = $state(false);
</script>

<T.Mesh
	onpointerup={() => {
		isMouseDown = false;
	}}
	onpointerdown={() => {
		isMouseDown = true;
	}}
	onpointermove={() => {
		if (isMouseDown && selectedPoint) {
			selectedPoint = undefined;
		}
	}}
	position={CENTER_POSITION.toArray()}
	material={materialArray}
>
	<T.BoxGeometry args={[STAR_CUBE_SIZE, STAR_CUBE_SIZE, STAR_CUBE_SIZE]} />
	{@render children()}
</T.Mesh>
