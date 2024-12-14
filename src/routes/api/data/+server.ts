import type { Connection } from '$lib/types/unisphere';
import type { RequestHandler } from '@sveltejs/kit';

export const config = {
	runtime: 'edge'
};

type LonLat = { lat: number; lon: number };
type PointId = string;

type Point<T extends string> = {
	id: PointId;
	coords: LonLat;
	intensity: number;
	type: T;
};

type PointTypes = 'miner' | 'validator';

// Refined land area coordinates for continents
const LAND_AREAS = [
	{ minLat: 24, maxLat: 71, minLon: -126, maxLon: -66 }, // North America
	{ minLat: -56, maxLat: 13, minLon: -82, maxLon: -34 }, // South America
	{ minLat: 36, maxLat: 71, minLon: -10, maxLon: 40 }, // Europe
	{ minLat: -35, maxLat: 37, minLon: -20, maxLon: 50 }, // Africa
	{ minLat: 10, maxLat: 65, minLon: 60, maxLon: 140 }, // Asia
	{ minLat: -35, maxLat: -10, minLon: 110, maxLon: 155 }, // Australia
	{ minLat: 20, maxLat: 35, minLon: 70, maxLon: 90 } // Indian subcontinent
];

function generateRandomId(length: number = 6): string {
	return Math.random()
		.toString(36)
		.substring(2, 2 + length);
}

function generateLandCoords(): LonLat {
	const continent = LAND_AREAS[Math.floor(Math.random() * LAND_AREAS.length)];
	return {
		lat: continent.minLat + Math.random() * (continent.maxLat - continent.minLat),
		lon: continent.minLon + Math.random() * (continent.maxLon - continent.minLon)
	};
}

function generatePointsOfInterest(count: number = 6): Point<PointTypes>[] {
	const pointTypes: PointTypes[] = ['miner', 'validator'];

	return Array.from({ length: count }, () => ({
		id: generateRandomId(),
		coords: generateLandCoords(),
		intensity: Math.random(),
		type: pointTypes[Math.floor(Math.random() * pointTypes.length)]
	}));
}

const getRandomItems = <T>(arr: T[], n: number): T[] => {
	const count = Math.min(n, arr.length);

	const shuffled = [...arr];

	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}

	return shuffled.slice(0, count);
};

const getRandomNumberInRange = (min: number, max: number): number => {
	const adjustedMin = Math.min(min, max);
	const adjustedMax = Math.max(min, max);

	return Math.floor(Math.random() * (adjustedMax - adjustedMin + 1) + adjustedMin);
};

const getRandomConnection = (points: Point<PointTypes>[]): Connection => {
	const randomPointPair = getRandomItems(points, 2);

	return {
		from: randomPointPair[0].id,
		to: randomPointPair[1].id,
		id: Math.random().toString()
	};
};

type ConnectionsInfoMap = Record<
	Connection['id'],
	{
		shouldSweep: boolean;
		connection: Connection;
	}
>;

export const GET: RequestHandler = async () => {
	const points = generatePointsOfInterest(255);

	return new Response(JSON.stringify(points));
};

export const POST: RequestHandler = async ({ request }) => {
	const { points }: { points: Point<PointTypes>[] } = await request.json();

	const connections: ConnectionsInfoMap = {};

	const store = {
		connections
	};

	const addNewConnections = () => {
		const connectionsToAdd = new Array(getRandomNumberInRange(0, 3))
			.fill(null)
			.map(() => getRandomConnection(points));

		connectionsToAdd.forEach((conn) => {
			store.connections[conn.id] = {
				shouldSweep: false,
				connection: conn
			};
			setTimeout(() => {
				if (store.connections[conn.id]) {
					store.connections[conn.id].shouldSweep = true;
				}
			}, 5000);
		});
	};

	setInterval(() => {
		addNewConnections();
	}, 1000);

	setInterval(() => {
		addNewConnections();
	}, 3000);

	let isClosed = false;

	const stream = new ReadableStream({
		async start(controller) {
			isClosed = false;
			const sendConnections = () => {
				if (!isClosed) {
					const encoder = new TextEncoder();
					const validConnections = Object.values(store.connections).filter(
						(conn) => conn.shouldSweep !== true
					);
					store.connections = validConnections.reduce((a, b) => {
						a[b.connection.id] = b;
						return a;
					}, {} as ConnectionsInfoMap);
					const connectionsData = validConnections.map((v) => v.connection);
					controller.enqueue(encoder.encode(`data: ${JSON.stringify(connectionsData)}\n\n`));
				}
			};

			sendConnections();

			setInterval(() => {
				sendConnections();
			}, 500);
		},
		cancel() {
			isClosed = true;
		}
	});

	return new Response(stream, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive'
		}
	});
};
