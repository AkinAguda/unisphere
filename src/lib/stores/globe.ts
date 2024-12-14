import { ion } from 'ionia';
import { DirectionalLight, Group, type Object3DEventMap } from 'three';

export const directionalLight = ion<DirectionalLight | undefined>(undefined);
export const globeGroup = ion<Group<Object3DEventMap> | undefined>(undefined);
