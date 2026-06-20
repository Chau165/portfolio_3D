import { useCallback, useEffect, useMemo, useRef } from "react";
import { ThreeEvent, useFrame, useLoader, useThree } from "@react-three/fiber";
import { useAnimations } from "@react-three/drei";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import {
  AnimationAction,
  AnimationMixer,
  Bone,
  Box3,
  Euler,
  Group,
  LoopOnce,
  MathUtils,
  Mesh,
  Object3D,
  Vector3,
} from "three";

type AvatarProps = {
  activationSignal: number;
  onActivate: () => void;
};

const clampMouse = (value: number, min: number, max: number) =>
  MathUtils.clamp(value, min, max);

function isBone(object: Object3D): object is Bone {
  return object.type === "Bone";
}

function isMesh(object: Object3D): object is Mesh {
  return "isMesh" in object && Boolean((object as Mesh).isMesh);
}

function isRootMotionBoneName(name: string) {
  const lowerName = name.toLowerCase();
  return (
    lowerName === "root" ||
    lowerName.includes("root") ||
    lowerName.includes("hips") ||
    lowerName.includes("hip") ||
    lowerName.includes("pelvis") ||
    lowerName.includes("armature")
  );
}

function getActionByName(
  actions: Record<string, AnimationAction | null>,
  keywords: string[],
) {
  return (
    Object.entries(actions).find(([name]) =>
      keywords.some((keyword) => name.toLowerCase().includes(keyword)),
    )?.[1] ?? null
  );
}

export default function Avatar({ activationSignal, onActivate }: AvatarProps) {
  const groupRef = useRef<Group>(null);
  const fbx = useLoader(FBXLoader, "/models/Waving.fbx");
  const { actions, names } = useAnimations(fbx.animations, groupRef);
  const { mouse, viewport } = useThree();
  const activeWaveAction = useRef<AnimationAction | null>(null);
  const initialGroupTransform = useRef<{
    position: Vector3;
    rotation: Euler;
    scale: Vector3;
  }>();
  const initialModelTransform = useRef<{
    position: Vector3;
    rotation: Euler;
    scale: Vector3;
  }>();

  const modelFit = useMemo(() => {
    const box = new Box3().setFromObject(fbx);
    const size = box.getSize(new Vector3());
    const center = box.getCenter(new Vector3());
    const scale = size.y > 0 ? 2.58 / size.y : 1;

    return {
      position: [-center.x * scale, -box.min.y * scale, -center.z * scale] as [
        number,
        number,
        number,
      ],
      scale,
    };
  }, [fbx]);

  const rigInfo = useMemo(() => {
    const headBones: Bone[] = [];
    const neckBones: Bone[] = [];
    const rootMotionBones: Bone[] = [];
    const boneNames: string[] = [];
    const rootBoneInitialY = new Map<Bone, number>();

    fbx.traverse((object) => {
      const lowerName = object.name.toLowerCase();

      if (isBone(object)) {
        boneNames.push(object.name);
        if (lowerName.includes("head")) headBones.push(object);
        if (lowerName.includes("neck")) neckBones.push(object);
        if (isRootMotionBoneName(object.name)) {
          rootMotionBones.push(object);
          rootBoneInitialY.set(object, object.position.y);
        }
      }

      if (isMesh(object)) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });

    return {
      headBones,
      neckBones,
      rootMotionBones,
      rootBoneInitialY,
      boneNames,
    };
  }, [fbx]);

  const baseRotations = useMemo(() => {
    const map = new Map<Object3D, Euler>();
    [...rigInfo.headBones, ...rigInfo.neckBones].forEach((bone) => {
      map.set(bone, bone.rotation.clone());
    });
    return map;
  }, [rigInfo.headBones, rigInfo.neckBones]);

  useEffect(() => {
    if (!rigInfo.headBones.length || !rigInfo.neckBones.length) {
      console.info("[Avatar] Head tracking bone scan", {
        headBones: rigInfo.headBones.map((bone) => bone.name),
        neckBones: rigInfo.neckBones.map((bone) => bone.name),
        allBones: rigInfo.boneNames,
      });
    }
  }, [rigInfo]);

  useEffect(() => {
    if (!groupRef.current) return;

    initialGroupTransform.current = {
      position: groupRef.current.position.clone(),
      rotation: groupRef.current.rotation.clone(),
      scale: groupRef.current.scale.clone(),
    };
    initialModelTransform.current = {
      position: fbx.position.clone(),
      rotation: fbx.rotation.clone(),
      scale: fbx.scale.clone(),
    };
  }, [fbx, modelFit]);

  useEffect(() => {
    const idleAction = getActionByName(actions, ["idle", "breath", "stand"]);

    if (idleAction) {
      idleAction.reset().fadeIn(0.4).play();
    }

    return () => {
      Object.values(actions).forEach((action) => action?.fadeOut(0.2));
    };
  }, [actions]);

  useEffect(() => {
    const handleFinished = (event: { action: AnimationAction }) => {
      if (event.action !== activeWaveAction.current) return;
      activeWaveAction.current.fadeOut(0.2);
      activeWaveAction.current = null;

      const idleAction = getActionByName(actions, ["idle", "breath", "stand"]);
      idleAction?.reset().fadeIn(0.25).play();
    };

    const mixers = new Set<AnimationMixer>();
    Object.values(actions).forEach((action) => {
      if (action) mixers.add(action.getMixer());
    });
    mixers.forEach((mixer) => mixer.addEventListener("finished", handleFinished));

    return () => {
      mixers.forEach((mixer) => mixer.removeEventListener("finished", handleFinished));
    };
  }, [actions]);

  useFrame((_, delta) => {
    if (groupRef.current && initialGroupTransform.current) {
      groupRef.current.position.copy(initialGroupTransform.current.position);
      groupRef.current.rotation.copy(initialGroupTransform.current.rotation);
      groupRef.current.scale.copy(initialGroupTransform.current.scale);
    }

    if (initialModelTransform.current) {
      fbx.position.copy(initialModelTransform.current.position);
      fbx.rotation.copy(initialModelTransform.current.rotation);
      fbx.scale.copy(initialModelTransform.current.scale);
    }

    rigInfo.rootMotionBones.forEach((bone) => {
      const initialY = rigInfo.rootBoneInitialY.get(bone);
      if (initialY !== undefined) {
        bone.position.y = initialY;
      }
    });

    const headTargetY = clampMouse(mouse.x * 0.42, -0.35, 0.35);
    const headTargetX = clampMouse(-mouse.y * 0.24, -0.18, 0.2);
    const neckTargetY = clampMouse(mouse.x * 0.22, -0.18, 0.18);
    const neckTargetX = clampMouse(-mouse.y * 0.12, -0.1, 0.12);
    const alpha = 1 - Math.pow(0.001, delta);

    rigInfo.headBones.forEach((bone) => {
      const base = baseRotations.get(bone);
      if (!base) return;
      bone.rotation.x = MathUtils.lerp(bone.rotation.x, base.x + headTargetX, alpha * 0.18);
      bone.rotation.y = MathUtils.lerp(bone.rotation.y, base.y + headTargetY, alpha * 0.18);
    });

    rigInfo.neckBones.forEach((bone) => {
      const base = baseRotations.get(bone);
      if (!base) return;
      bone.rotation.x = MathUtils.lerp(bone.rotation.x, base.x + neckTargetX, alpha * 0.12);
      bone.rotation.y = MathUtils.lerp(bone.rotation.y, base.y + neckTargetY, alpha * 0.12);
    });
  });

  const playWave = useCallback(() => {
    const waveAction =
      getActionByName(actions, ["wave", "waving", "hello"]) ??
      (names.length ? actions[names[0]] : null);

    if (waveAction) {
      const idleAction = getActionByName(actions, ["idle", "breath", "stand"]);
      idleAction?.fadeOut(0.15);
      waveAction.reset();
      waveAction.setLoop(LoopOnce, 1);
      waveAction.clampWhenFinished = false;
      activeWaveAction.current = waveAction;
      waveAction.fadeIn(0.1).play();
    } else {
      console.info("[Avatar] No animation clips found for waving.", { names });
    }
  }, [actions, names]);

  useEffect(() => {
    if (activationSignal > 0) {
      playWave();
    }
  }, [activationSignal, playWave]);

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    playWave();
    onActivate();
  };

  const avatarY = viewport.width < 6 ? -0.32 : -0.26;

  return (
    <group ref={groupRef} onClick={handleClick} position={[0, avatarY, 0]}>
      <primitive object={fbx} position={modelFit.position} scale={modelFit.scale} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]} receiveShadow>
        <circleGeometry args={[1.35, 72]} />
        <meshStandardMaterial color="#1b1029" roughness={0.82} metalness={0.12} />
      </mesh>
    </group>
  );
}
