import { Vector3 } from 'three';

export const latLonToSphereCoords = (lat: number, lon: number, radius: number = 1): Vector3 => {
	const latRad = lat * (Math.PI / 180);
	const lonRad = -lon * (Math.PI / 180);

	const x = radius * Math.cos(latRad) * Math.cos(lonRad);
	const y = radius * Math.sin(latRad);
	const z = radius * Math.cos(latRad) * Math.sin(lonRad);

	return new Vector3(x, y, z);
};

export const createPOICoords = (lat: number, lon: number) => {
	const surfacePoint = latLonToSphereCoords(lat, lon);

	const direction = surfacePoint.clone().normalize();

	return {
		surfacePoint,
		direction
	};
};
