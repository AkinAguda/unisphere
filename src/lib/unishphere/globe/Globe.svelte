<script lang="ts" generics="T extends string">
	import {
		Texture,
		TextureLoader,
		PlaneGeometry,
		ShaderMaterial,
		Mesh,
		WebGLRenderTarget,
		Scene,
		OrthographicCamera,
		LinearFilter
	} from 'three';
	import { useLoader, useThrelte } from '@threlte/core';
	import worldMapVertexShader from './world-map-shaders/vertex-shader.glsl?raw';
	import worldMapFragmentShader from './world-map-shaders/fragment-shader.glsl?raw';

	import worldRoughnessVertexShader from './world-roughness-shaders/vertex-shader.glsl?raw';
	import worldRoughnessFragmentShader from './world-roughness-shaders/fragment-shader.glsl?raw';

	import GlobeInner from './GlobeInner.svelte';
	import type { BaseGlobeProps } from './types';
	import { getMaxTextureDimension } from '$lib/utility/get-max-texture-dimension';

	const loader = useLoader(TextureLoader);
	const { renderer } = useThrelte();

	const loadTextures = async () => {
		const earthSpecularMap = await loader.load('/assets/earth/earth-specular-map.png');
		earthSpecularMap.magFilter = LinearFilter;
		return { earthSpecularMap };
	};

	const generateMapTexture = (earthSpecularMap: Texture): Texture => {
		const dimension = getMaxTextureDimension();

		const renderTarget = new WebGLRenderTarget(dimension, dimension / 2);

		const rtScene = new Scene();

		const rtCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

		const geometry = new PlaneGeometry(2, 2);

		const material = new ShaderMaterial({
			fragmentShader: worldMapFragmentShader,
			vertexShader: worldMapVertexShader,
			uniforms: {
				earthSpecularMap: { value: earthSpecularMap }
			}
		});
		const mesh = new Mesh(geometry, material);
		rtScene.add(mesh);

		// Render to target
		renderer.setRenderTarget(renderTarget);
		renderer.render(rtScene, rtCamera);
		renderer.setRenderTarget(null);

		return renderTarget.texture;
	};

	const generateRoughnessTexture = (earthSpecularMap: Texture): Texture => {
		const dimension = getMaxTextureDimension();

		const renderTarget = new WebGLRenderTarget(dimension, dimension / 2);

		renderTarget.texture.magFilter = LinearFilter;

		const rtScene = new Scene();

		const rtCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

		const geometry = new PlaneGeometry(2, 2);

		const material = new ShaderMaterial({
			fragmentShader: worldRoughnessFragmentShader,
			vertexShader: worldRoughnessVertexShader,
			uniforms: {
				earthSpecularMap: { value: earthSpecularMap }
			}
		});
		const mesh = new Mesh(geometry, material);
		rtScene.add(mesh);

		// Render to target
		renderer.setRenderTarget(renderTarget);
		renderer.render(rtScene, rtCamera);
		renderer.setRenderTarget(null);

		return renderTarget.texture;
	};

	const generateTextures = async () => {
		const textures = await loadTextures();

		const map = generateMapTexture(textures.earthSpecularMap);
		const bumpMap = generateRoughnessTexture(textures.earthSpecularMap);

		return {
			map,
			bumpMap
		};
	};

	interface Props<T extends string> extends BaseGlobeProps<T> {}

	let {
		connections,
		points,
		thresholds,
		pointStyles,
		selectedPoint = $bindable(),
		pointsMap
	}: Props<T> = $props();
</script>

{#await generateTextures() then { map, bumpMap }}
	<GlobeInner
		bind:selectedPoint
		{pointsMap}
		{thresholds}
		{pointStyles}
		{points}
		{map}
		{bumpMap}
		{connections}
	/>
{/await}
