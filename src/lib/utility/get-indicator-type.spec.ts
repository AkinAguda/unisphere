import { describe, it, expect } from 'vitest';
import { getIndicatorType } from './get-indicator-type';
import type { Point, PointIntensityThresholds, PointStyles } from '$lib/types/unisphere';

type PointTypes = 'miner' | 'validator';

const POINTS_OF_INTEREST: Point<PointTypes>[] = [
	{
		id: '1',
		coords: { lat: 40.7128, lon: -74.006 },
		intensity: 0.1,
		type: 'miner'
	},
	{
		id: '2',
		coords: { lat: 40.7128, lon: -74.006 },
		intensity: 0.1,
		type: 'validator'
	},
	{
		id: '2',
		coords: { lat: 40.7128, lon: -74.006 },
		intensity: 0.2,
		type: 'validator'
	},
	{
		id: '3',
		coords: { lat: 40.7128, lon: -74.006 },
		intensity: 0.2,
		type: 'miner'
	},
	{
		id: '4',
		coords: { lat: 40.7128, lon: -74.006 },
		intensity: 0.31,
		type: 'validator'
	},
	{
		id: '5',
		coords: { lat: 40.7128, lon: -74.006 },
		intensity: 0.9,
		type: 'miner'
	},
	{
		id: '6',
		coords: { lat: 40.7128, lon: -74.006 },
		intensity: 0.9,
		type: 'validator'
	},
	{
		id: '7',
		coords: { lat: 40.7128, lon: -74.006 },
		intensity: 0.05,
		type: 'validator'
	}
];

const DEFAULT_STYLES: PointStyles<PointTypes> = {
	sm: 'tower',
	md: {
		validator: 'beacon',
		miner: {
			type: 'sparkling-beacon',
			meta: {
				particleCount: 10
			}
		}
	},
	lg: { validator: 'beacon', miner: 'tower' }
};

const DEFAULT_INTENSITIES: PointIntensityThresholds<PointTypes> = {
	sm: 0.1,
	md: { miner: 0.2, validator: 0.3 },
	lg: { validator: 0.5, miner: 0.5 }
};

describe('getIndicatorType tests', () => {
	it('Works as expected', () => {
		const it1 = getIndicatorType(POINTS_OF_INTEREST[0], DEFAULT_STYLES, DEFAULT_INTENSITIES);
		expect(it1.type).toBe('tower');

		const it2 = getIndicatorType(POINTS_OF_INTEREST[1], DEFAULT_STYLES, DEFAULT_INTENSITIES);
		expect(it2.type).toBe('tower');

		const it3 = getIndicatorType(POINTS_OF_INTEREST[2], DEFAULT_STYLES, DEFAULT_INTENSITIES);
		expect(it3.type).toBe('tower');

		const it4 = getIndicatorType(POINTS_OF_INTEREST[3], DEFAULT_STYLES, DEFAULT_INTENSITIES);
		expect(it4.type).toBe('sparkling-beacon');

		if (it4.type === 'sparkling-beacon') {
			expect(!!it4.meta).toBe(true);
			if (it4.meta && it4.meta.particleCount === 10) {
				expect(it4.meta.particleCount).toBe(10);
			}
		}

		const it5 = getIndicatorType(POINTS_OF_INTEREST[4], DEFAULT_STYLES, DEFAULT_INTENSITIES);
		expect(it5.type).toBe('beacon');

		const it6 = getIndicatorType(POINTS_OF_INTEREST[5], DEFAULT_STYLES, DEFAULT_INTENSITIES);
		expect(it6.type).toBe('tower');

		const it7 = getIndicatorType(POINTS_OF_INTEREST[6], DEFAULT_STYLES, DEFAULT_INTENSITIES);
		expect(it7.type).toBe('beacon');

		const it8 = getIndicatorType(POINTS_OF_INTEREST[7], DEFAULT_STYLES, DEFAULT_INTENSITIES);
		expect(it8.type).toBe('tower');
	});

	// TODO - Add more tests to stress this. Need to ensure this always works by design as its a major part of this component's public facing API
});
