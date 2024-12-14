import type {
	Connection,
	Point,
	PointIntensityThresholds,
	PointStyles
} from '$lib/types/unisphere';

export type BaseGlobeProps<T extends string> = {
	connections: Connection[];
	points: Point<T>[];
	pointStyles: PointStyles<T>;
	thresholds: PointIntensityThresholds<T>;
	selectedPoint?: Point<T>['id'];
	pointsMap: Record<Point<T>['id'], Point<T>>;
};
