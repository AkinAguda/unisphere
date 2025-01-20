import type { MakeOptional } from '$lib/utility/make-optional';

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

export type PointIndicatorTypesWithMetadata =
	| {
			type: 'sparkling-beacon';
			meta: {
				particleCount: number;
			};
	  }
	| {
			type: 'sparkling-tower';
			meta: {
				particleCount: number;
			};
	  };

export type PointStyleBreakpoints = 'sm' | 'md' | 'lg';

type PointStyleBreakpointValue = PointInidicatorTypes | PointIndicatorTypesWithMetadata;

export type PointStyleBreakpointValueObject =
	| MakeOptional<PointIndicatorTypesWithMetadata, 'meta'>
	| { type: Exclude<PointInidicatorTypes, PointIndicatorTypesWithMetadata['type']> };

export type PointStyles<T extends string> = Record<
	PointStyleBreakpoints,
	PointInidicatorTypes | Record<T, PointStyleBreakpointValue>
>;

export type PointIntensityThresholds<T extends string> = Record<
	PointStyleBreakpoints,
	number | Record<T, number>
>;
