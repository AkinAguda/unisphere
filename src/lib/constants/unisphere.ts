import { Vector3 } from 'three';
import type { PointIntensityThresholds, PointStyles } from '$lib/types/unisphere';

export const CENTER_POSITION = new Vector3(0, 0, 0);

export const CAMERA_INIT_POSITION = new Vector3(
	13.675044592268783,
	2.510300430176524,
	2.370115089691584
);

export const FOCUSED_CAMERA_DISTANCE_FROM_POINT = 10;

export const INITIAL_SUN_POSITION = new Vector3(-5, 8, -12);

export const INITIAL_SUN_INTENSITY = 14;

export const EASINGS = {
	linear: (t: number) => t,
	easeInQuad: (t: number) => t * t,
	easeOutQuad: (t: number) => t * (2 - t),
	easeInOutQuad: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
	easeInCubic: (t: number) => t * t * t,
	easeOutCubic: (t: number) => --t * t * t + 1,
	easeInOutCubic: (t: number) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1)
};

export const PLANET_RADIUS = 1;

export const DEFAULT_POINT_STYlES: PointStyles<string> = {
	sm: 'beacon',
	md: 'tower',
	lg: 'sparkling-beacon'
};

export const DEFAULT_POINT_THRESHOLDS: PointIntensityThresholds<string> = {
	sm: 0.3,
	md: 0.6,
	lg: 0.9
};
