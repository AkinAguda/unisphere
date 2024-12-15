const RESPONSIVE_VALUES = ['sm'] as const;

type ResponsiveValueSizes = (typeof RESPONSIVE_VALUES)[number];

const BREAKPOINTS: Record<ResponsiveValueSizes, number> = {
	sm: 500
};

type ResponsiveValueConfig<T> = { base: T } & Partial<Record<ResponsiveValueSizes, T>>;

export const getResponsiveValue = <T>(responsiveValues: ResponsiveValueConfig<T>): T => {
	let value = responsiveValues.base;

	if (typeof window !== 'undefined') {
		for (const size of RESPONSIVE_VALUES) {
			const breakpointValue = responsiveValues[size];
			if (breakpointValue !== undefined) {
				if (window.innerWidth >= BREAKPOINTS[size]) {
					value = breakpointValue;
					break;
				}
			}
		}
	}

	return value;
};
