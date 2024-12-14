const makeEven = (value: number) => {
	return value % 2 === 0 ? value : value + (value % 2);
};

export const getMaxTextureDimension = () => {
	return makeEven(
		Math.round(Math.max(window.innerWidth, window.innerHeight) * window.devicePixelRatio)
	);
};
