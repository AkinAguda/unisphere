export type LonLat = {
	lon: number;
	lat: number;
};

type Id = string;

type PointId = Id;
type DestinationId = Id;

export type Point<T extends string> = {
	id: PointId;
	coords: LonLat;
	intensity: number;
	type: T;
};

export type Connection = {
	id: DestinationId;
	from: PointId;
	to: PointId;
};

export type PointInidicatorTypes = 'beacon' | 'tower' | 'sparkling-beacon' | 'sparkling-tower';

export type PointStyleBreakpoints = 'sm' | 'md' | 'lg';

export type PointStyles<T extends string> = Record<
	PointStyleBreakpoints,
	PointInidicatorTypes | Record<T, PointInidicatorTypes>
>;

export type PointIntensityThresholds<T extends string> = Record<
	PointStyleBreakpoints,
	number | Record<T, number>
>;
