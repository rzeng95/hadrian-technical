import "./model.css";

import * as React from "react";
import * as THREE from "three";
import { Edges, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { GLTFLoader } from "three-stdlib";

import RGB_ID_TO_ENTITY_ID from "../../../data_dump/rgb_id_to_entity_id_map.json";
import ADJACENCY_GRAPH_EDGE_METADATA from "../../../data_dump/adjacency_graph_edge_metadata.json";
import ADJACENCY_GRAPH from "../../../data_dump/adjacency_graph.json";
import { generateDistinctHexColors, getHexCodeFromEntityId } from "../util";
import { PocketMetadata } from "./PocketMetadata";

interface ModelEntity {
  bufferGeometry: THREE.BufferGeometry;
  color: string;
  entityId: string;
}

const ENTITY_ID_TO_RGB = {};

Object.keys(RGB_ID_TO_ENTITY_ID).forEach((rgbCode) => {
  const entityId = RGB_ID_TO_ENTITY_ID[rgbCode];

  ENTITY_ID_TO_RGB[entityId] = rgbCode.replace(/-/g, ",");
});

const UNIQUE_CONCAVE_FACES = new Set([]);
Object.keys(ADJACENCY_GRAPH_EDGE_METADATA).forEach((pair) => {
  if (
    ADJACENCY_GRAPH_EDGE_METADATA[pair].includes(0) &&
    !ADJACENCY_GRAPH_EDGE_METADATA[pair].includes(1) &&
    !ADJACENCY_GRAPH_EDGE_METADATA[pair].includes(2)
  ) {
    const [first, second] = pair.split("-");
    UNIQUE_CONCAVE_FACES.add(first);
    UNIQUE_CONCAVE_FACES.add(second);
  }
});

const UNIQUE_CONCAVE_FACES_ARR = Array.from(UNIQUE_CONCAVE_FACES);

const UNIQUE_POCKETS = [];
UNIQUE_CONCAVE_FACES_ARR.forEach((face) => {
  const adjacentEntities = ADJACENCY_GRAPH[face];

  // look for only adjacent entities that are also concave
  const adjacentConcaveEntities = adjacentEntities.filter((entityId) =>
    UNIQUE_CONCAVE_FACES_ARR.includes(entityId)
  );

  let found = false;

  for (let i = 0; i < UNIQUE_POCKETS.length; i += 1) {
    const isOverlap = UNIQUE_POCKETS[i].some((ele) =>
      adjacentConcaveEntities.includes(ele)
    );

    if (isOverlap) {
      found = true;
      UNIQUE_POCKETS[i].push(face);
      break;
    }
  }

  if (!found) {
    // if current face isn't adjacent to any existing groups, create a new group
    UNIQUE_POCKETS.push([face]);
  }
});

const hexCodes = generateDistinctHexColors(UNIQUE_POCKETS.length);

export const Model = (): JSX.Element => {
  const [modelEnts, setModelEnts] = React.useState<ModelEntity[]>([]);
  const [selectedPocketIdx, setSelectedPocketIdx] = React.useState(-1);

  const [uniquePockets, setUniquePockets] =
    React.useState<string[][]>(UNIQUE_POCKETS);

  React.useEffect(() => {
    new GLTFLoader().load("./colored_glb.glb", (gltf) => {
      const newModuleEntities: ModelEntity[] = [];
      gltf.scene.traverse((element) => {
        if (element.type !== "Mesh") return;

        const meshElement = element as THREE.Mesh;
        const entityId = `${meshElement?.geometry?.id ?? ""}`;

        newModuleEntities.push({
          bufferGeometry: meshElement.geometry as THREE.BufferGeometry,
          color: "#787878",
          entityId,
        });
      });

      setModelEnts(newModuleEntities);
    });
  }, []);

  React.useEffect(() => {
    if (modelEnts.length > 0 && uniquePockets) {
      setModelEnts((prev) => {
        return prev.map((entity) => ({
          ...entity,
          color: getHexCodeFromEntityId(
            entity.entityId,
            hexCodes,
            uniquePockets
          ),
        }));
      });
    }
  }, [modelEnts.length, JSON.stringify(uniquePockets)]);

  const handleSelectEntity = React.useCallback(
    (entityId: string) => {
      if (selectedPocketIdx === -1) {
        return;
      }

      setUniquePockets((prev) => {
        return prev.map((pocket, idx) => {
          if (idx === selectedPocketIdx) {
            if (pocket.includes(entityId)) {
              return pocket.filter((ele) => ele !== entityId);
            }
            return [...pocket, entityId];
          }
          return pocket;
        });
      });
    },
    [selectedPocketIdx]
  );

  const handleReset = React.useCallback(() => {
    setUniquePockets(UNIQUE_POCKETS);
    setSelectedPocketIdx(-1);
  }, []);

  return (
    <>
      {uniquePockets.map((pocket, idx) => {
        return (
          <PocketMetadata
            key={idx}
            pocket={pocket}
            pocketIdx={idx}
            color={getHexCodeFromEntityId(pocket[0], hexCodes, uniquePockets)}
            isSelectedPocket={idx === selectedPocketIdx}
            onSelectPocket={() => setSelectedPocketIdx(idx)}
          />
        );
      })}

      {selectedPocketIdx !== -1 && (
        <div>
          Click on a face below to add/remove it from&nbsp;
          <b>pocket {selectedPocketIdx}</b>
        </div>
      )}

      <button onClick={handleReset}>Reset</button>

      <div className="canvas-container">
        <Canvas camera={{ position: [0, 0, 300] }}>
          <ambientLight />
          <OrbitControls makeDefault />
          <group>
            {modelEnts.map((ent, index) => (
              <mesh
                geometry={ent.bufferGeometry}
                key={index}
                onClick={() => handleSelectEntity(ent.entityId)}
              >
                <meshStandardMaterial color={ent.color} />
                <Edges>
                  <lineBasicMaterial color="#333333" />
                </Edges>
              </mesh>
            ))}
          </group>
        </Canvas>
      </div>
    </>
  );
};
