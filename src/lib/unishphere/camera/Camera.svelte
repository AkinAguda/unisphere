<script lang="ts" generics="T extends string">
	import { T, useTask } from '@threlte/core';
	import { OrbitControls } from '@threlte/extras';
	import { PerspectiveCamera, Vector3, MathUtils, Euler, Quaternion } from 'three';

	import { latLonToSphereCoords } from '$lib/utility/lat-lon-to-sphere-coords';
	import { CAMERA_INIT_POSITION, EASINGS } from '$lib/constants/unisphere';
	import type { Point } from '$lib/types/unisphere';
	import { globeGroup } from '$lib/stores/globe';

	let camera: PerspectiveCamera | undefined = undefined;

	interface Props<T extends string> {
		pointsMap: Record<Point<T>['id'], Point<T>>;
		selectedPoint?: Point<T>['id'];
		velocity?: number;
	}

	const DEFAULT_VELOCITY = 15;

	const { pointsMap, selectedPoint, velocity = DEFAULT_VELOCITY }: Props<T> = $props();

	const selectedPointData = $derived(selectedPoint ? pointsMap[selectedPoint] : undefined);

	const slerpWithEasing = (
		start: Vector3,
		end: Vector3,
		t: number,
		easeFn: (t: number) => number,
		baseVelocity: number
	): Vector3 => {
		const startNorm = start.clone().normalize();
		const endNorm = end.clone().normalize();

		const cosAngle = startNorm.dot(endNorm);
		const angle = Math.acos(MathUtils.clamp(cosAngle, -1, 1));

		// Dynamically adjust velocity based on angle
		const velocityScale = 1 + angle / Math.PI; // Increases velocity for longer distances
		const scaledVelocity = baseVelocity * velocityScale;

		const movementDuration = angle / ((scaledVelocity * Math.PI) / 180);
		const scaledProgress = Math.min(t / movementDuration, 1);

		const easedT = easeFn(scaledProgress);

		if (angle < 0.001) {
			return start.clone().lerp(end, easedT);
		}

		const sinAngle = Math.sin(angle);
		const a = Math.sin(angle * (1 - easedT)) / sinAngle;
		const b = Math.sin(angle * easedT) / sinAngle;

		// Preserve the original distance of the start position
		const originalDistance = start.length();

		return startNorm
			.multiplyScalar(a)
			.add(endNorm.multiplyScalar(b))
			.normalize()
			.multiplyScalar(originalDistance);
	};

	let startTime: number | null = null;
	let startPosition: Vector3 | null = null;
	let targetPosition: Vector3 | null = null;
	let currentSelectedPoint: Point<T>['id'] | undefined = undefined;

	$effect(() => {
		if (!camera || !selectedPointData) return;

		if (selectedPoint !== currentSelectedPoint) {
			currentSelectedPoint = selectedPoint;

			startPosition = camera.position.clone();

			// Get the current rotation of the globe
			const globeRotation = globeGroup.$ ? globeGroup.$.rotation : new Euler();

			// Create a quaternion from the globe's current rotation
			const rotationQuaternion = new Quaternion().setFromEuler(globeRotation);

			// Calculate the initial coordinate
			const initialCoords = latLonToSphereCoords(
				selectedPointData.coords.lat,
				selectedPointData.coords.lon,
				startPosition.length() // Use the current camera distance
			);

			// Create a vector from the initial coordinates
			const initialPosition = new Vector3(initialCoords.x, initialCoords.y, initialCoords.z);

			// Apply the globe's rotation to the initial position
			targetPosition = initialPosition.applyQuaternion(rotationQuaternion);

			startTime = performance.now() / 1000;
		}
	});

	useTask(() => {
		if (!camera || !startTime || !startPosition || !targetPosition) return;

		const currentTime = performance.now() / 1000;
		const elapsedTime = currentTime - startTime;

		const startNorm = startPosition.clone().normalize();
		const endNorm = targetPosition.clone().normalize();
		const angle = Math.acos(MathUtils.clamp(startNorm.dot(endNorm), -1, 1));

		const movementDuration = angle / ((velocity * Math.PI) / 180);
		const progress = Math.min(elapsedTime / movementDuration, 1);

		const interpolatedPosition = slerpWithEasing(
			startPosition,
			targetPosition,
			elapsedTime,
			EASINGS.easeOutCubic,
			velocity
		);

		camera.position.copy(interpolatedPosition);

		camera.lookAt(new Vector3(0, 0, 0));

		if (progress >= 1) {
			startTime = null;
			startPosition = null;
			targetPosition = null;
		}
	});
</script>

<T.PerspectiveCamera
	oncreate={(cam) => {
		camera = cam;
	}}
	makeDefault
	position={CAMERA_INIT_POSITION.toArray()}
	fov={15}
>
	<OrbitControls maxDistance={15} minDistance={9} enableZoom={true} enableDamping />
</T.PerspectiveCamera>
