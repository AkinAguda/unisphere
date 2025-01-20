import type {
	Point,
	PointIntensityThresholds,
	PointStyleBreakpoints,
	PointStyles,
	PointStyleBreakpointValueObject
} from '$lib/types/unisphere';

const getIntensityValue = <T extends string>(
	intensityBreakpoint: PointIntensityThresholds<T>[PointStyleBreakpoints],
	point: Point<T>
) => {
	if (typeof intensityBreakpoint === 'object') {
		return intensityBreakpoint[point.type];
	} else {
		return intensityBreakpoint;
	}
};

const getPointStyle = <T extends string>(
	styleBreakpointVal: PointStyles<T>[PointStyleBreakpoints],
	point: Point<T>
) => {
	if (typeof styleBreakpointVal === 'object') {
		return styleBreakpointVal[point.type];
	} else {
		return styleBreakpointVal;
	}
};

export const getIndicatorType = <T extends string>(
	point: Point<T>,
	pointStyles: PointStyles<T>,
	thresholds: PointIntensityThresholds<T>
): PointStyleBreakpointValueObject => {
	const sortedThresholds = Object.entries(thresholds).sort(
		(a, b) => getIntensityValue(a[1], point) - getIntensityValue(b[1], point)
	) as [PointStyleBreakpoints, PointIntensityThresholds<T>[PointStyleBreakpoints]][];

	const thresholdsWithinBreakpoint = sortedThresholds.filter(
		(breakpointTuple) => getIntensityValue(breakpointTuple[1], point) <= point.intensity
	);

	const threshold = thresholdsWithinBreakpoint.length
		? thresholdsWithinBreakpoint[thresholdsWithinBreakpoint.length - 1]
		: sortedThresholds[0];

	const pointType = getPointStyle(pointStyles[threshold[0]], point);

	if (typeof pointType === 'object') {
		return { type: pointType.type, meta: pointType.meta };
	}

	return { type: pointType };
};
