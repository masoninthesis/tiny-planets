import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// Path to the models directory
const basePath = "/lowpoly_nature/";

const lowPolyNatureCollectionModels: Record<
  string,
  { versions?: number; materials: string[] }
> = {
  BirchTree: {
    versions: 5,
    materials: ["White", "Black", "DarkGreen", "Green"],
  },
  BirchTree_Dead: { versions: 5, materials: ["White", "Black"] },
  BirchTree_Dead_Snow: { versions: 5, materials: ["White", "Snow", "Black"] },
  BirchTree_Snow: {
    versions: 5,
    materials: ["White", "Black", "DarkGreen", "Green", "Snow"],
  },
  Bush: { versions: 2, materials: ["Green"] },
  Bush_Snow: { versions: 2, materials: ["Snow", "Green"] },
  BushBerries: { versions: 2, materials: ["Green", "Red"] },
  Cactus: { versions: 5, materials: ["Green", "LightOrange"] },
  CactusFlowers: { versions: 5, materials: ["Green", "Pink"] },
  CommonTree: { versions: 5, materials: ["Brown", "Green", "DarkGreen"] },
  CommonTree_Dead: { versions: 5, materials: ["Brown"] },
  CommonTree_Dead_Snow: { versions: 5, materials: ["Brown", "Snow"] },
  CommonTree_Snow: {
    versions: 5,
    materials: ["Brown", "Green", "Snow", "DarkGreen"],
  },
  Corn: { versions: 2, materials: ["Green", "Yellow"] },
  Flowers: { materials: ["Green", "Cyan", "Yellow"] },
  Grass: { versions: 3, materials: ["Green"] },
  Lilypad: { materials: ["Green", "Pink"] },
  PalmTree: { versions: 4, materials: ["Brown", "Green", "DarkGreen"] },
  PineTree: { versions: 5, materials: ["Brown", "Green"] },
  PineTree_Snow: { versions: 5, materials: ["Brown", "Green", "Snow"] },
  Plant: {
    versions: 5,
    materials: ["Brown", "Green", "DarkGreen", "Yellow", "Pink"],
  },
  Rock: { versions: 7, materials: ["Gray"] },
  Rock_Moss: { versions: 7, materials: ["Gray", "Green"] },
  Rock_Snow: { versions: 7, materials: ["Gray", "Snow"] },
  TreeStump_Moss: { materials: ["Brown", "Green"] },
  TreeStump_Snow: { materials: ["Brown", "Snow"] },
  TreeStump: { materials: ["Brown", "LightBrown", "Green"] },
  Wheat: { materials: ["Yellow"] },
  Willow: { versions: 5, materials: ["Brown", "DarkGreen"] },
  Willow_Dead: { versions: 5, materials: ["Brown"] },
  Willow_Dead_Snow: { versions: 5, materials: ["Brown", "Snow"] },
  Willow_Snow: { versions: 5, materials: ["Brown", "Snow", "DarkGreen"] },
  WoodLog_Moss: {
    materials: [
      "Brown",
      "Green",
      "Mushroom_Top",
      "Mushroom_Bottom",
      "DarkGreen",
    ],
  },
  WoodLog_Snow: { materials: ["Brown", "Snow"] },
  WoodLog: { materials: ["Brown", "Mushroom_Top", "Mushroom_Bottom"] },
};

type Collection = {
  models: Record<string, { versions?: number; materials: string[] }>;
  name: string;
};

export const lowPolyNatureCollection = {
  models: lowPolyNatureCollectionModels,
  name: "lowpoly_nature",
};

type Collections = "lowpoly_nature";

export const collections: Record<Collections, Collection> = {
  lowpoly_nature: lowPolyNatureCollection,
};

export function getModels(
  collection: Collections = "lowpoly_nature",
): string[] {
  return Object.keys(collections[collection].models);
}

export function getModelPathsAndMaterials(
  name: string,
  collection: Collections = "lowpoly_nature",
): {
  filePaths: string[];
  materials: string[];
} | null {
  const model = collections[collection].models[name];
  if (!model) {
    console.error(`Model ${name} not found.`);
    return null;
  }

  // Construct file paths based on the number of versions
  const filePaths: string[] = [];
  if (model.versions) {
    for (let i = 1; i <= model.versions; i++) {
      filePaths.push(
        `${basePath}${name}_${i}.gltf`,
      );
    }
  } else {
    filePaths.push(`${basePath}${name}.gltf`);
  }

  return {
    filePaths,
    materials: model.materials,
  };
}

export async function loadModels(
  name: string,
  collection: Collections = "lowpoly_nature",
): Promise<THREE.Object3D[]> {
  const loader = new GLTFLoader();
  const modelInfo = getModelPathsAndMaterials(name, collection);

  if (!modelInfo) {
    console.error(`No model info found for ${name}`);
    return [];
  }

  console.log(`Loading ${modelInfo.filePaths.length} models for ${name}:`, modelInfo.filePaths);

  const promises = modelInfo.filePaths.map((filePath) => {
    return new Promise<THREE.Object3D>((resolve, reject) => {
      console.log(`Loading model from path: ${filePath}`);
      loader.load(
        filePath,
        (gltf) => {
          console.log(`Successfully loaded model: ${filePath}`);
          
          // Check if the model has any meshes
          let hasMeshes = false;
          gltf.scene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              hasMeshes = true;
              child.receiveShadow = true;
              child.castShadow = true;
            }
          });
          
          if (!hasMeshes) {
            console.warn(`Model ${filePath} has no meshes`);
          }
          
          gltf.scene.userData = {
            name,
            path: filePath,
          };
          
          resolve(gltf.scene);
        },
        (progress) => {
          console.log(`Loading progress for ${filePath}:`, progress);
        },
        (error) => {
          console.error(`Failed to load model ${filePath}:`, error);
          reject(error);
        },
      );
    });
  });

  try {
    const models = await Promise.all(promises);
    console.log(`Successfully loaded ${models.length} models for ${name}`);
    return models;
  } catch (error) {
    console.error(`Error loading models for ${name}:`, error);
    return [];
  }
}
