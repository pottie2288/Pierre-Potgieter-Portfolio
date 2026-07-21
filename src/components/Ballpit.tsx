"use client";

import { useEffect, useRef } from "react";
import {
  Vector3,
  Vector2,
  Color,
  Object3D,
  MathUtils,
  MeshPhysicalMaterial,
  InstancedMesh,
  Timer,
  AmbientLight,
  SphereGeometry,
  ShaderChunk,
  Scene,
  SRGBColorSpace,
  PMREMGenerator,
  WebGLRenderer,
  PerspectiveCamera,
  PointLight,
  ACESFilmicToneMapping,
  Plane,
  Raycaster,
  type WebGLProgramParametersWithUniforms,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

interface BallpitConfig {
  count: number;
  colors: number[];
  ambientColor: number;
  ambientIntensity: number;
  lightIntensity: number;
  materialParams: {
    metalness: number;
    roughness: number;
    clearcoat: number;
    clearcoatRoughness: number;
  };
  minSize: number;
  maxSize: number;
  size0: number;
  gravity: number;
  friction: number;
  wallBounce: number;
  maxVelocity: number;
  maxX: number;
  maxY: number;
  maxZ: number;
  controlSphere0: boolean;
  followCursor: boolean;
}

const DEFAULT_CONFIG: BallpitConfig = {
  count: 200,
  colors: [0, 0, 0],
  ambientColor: 16777215,
  ambientIntensity: 1,
  lightIntensity: 200,
  materialParams: {
    metalness: 0.5,
    roughness: 0.5,
    clearcoat: 1,
    clearcoatRoughness: 0.15,
  },
  minSize: 0.5,
  maxSize: 1,
  size0: 1,
  gravity: 0.5,
  friction: 0.988,
  wallBounce: 0.85,
  maxVelocity: 0.5,
  maxX: 5,
  maxY: 5,
  maxZ: 2,
  controlSphere0: false,
  followCursor: true,
};

interface RendererSize {
  width: number;
  height: number;
  wWidth: number;
  wHeight: number;
  ratio: number;
  pixelRatio: number;
}

interface RendererAppOptions {
  canvas: HTMLCanvasElement;
  size?: "parent" | { width: number; height: number };
  rendererOptions?: THREE_RendererOptions;
}

type THREE_RendererOptions = ConstructorParameters<typeof WebGLRenderer>[0];

/** Thin wrapper around a WebGLRenderer + PerspectiveCamera that handles
 * resize (incl. parent-relative sizing), visibility pausing, and the
 * render loop. Adapted from the React Bits Ballpit source. */
class RendererApp {
  canvas: HTMLCanvasElement;
  camera: PerspectiveCamera;
  cameraFov: number;
  cameraMinAspect?: number;
  cameraMaxAspect?: number;
  maxPixelRatio?: number;
  minPixelRatio?: number;
  scene: Scene;
  renderer: WebGLRenderer;
  size: RendererSize = { width: 0, height: 0, wWidth: 0, wHeight: 0, ratio: 0, pixelRatio: 0 };
  render: () => void = () => this.#renderFrame();
  onBeforeRender: (info: { elapsed: number; delta: number }) => void = () => {};
  onAfterRender: (info: { elapsed: number; delta: number }) => void = () => {};
  onAfterResize: (size: RendererSize) => void = () => {};
  isDisposed = false;

  #options: RendererAppOptions;
  #isVisible = false;
  #isAnimating = false;
  #intersectionObserver?: IntersectionObserver;
  #resizeObserver?: ResizeObserver;
  #resizeTimeout?: ReturnType<typeof setTimeout>;
  #timer = new Timer();
  #frameInfo = { elapsed: 0, delta: 0 };
  #rafId?: number;

  constructor(options: RendererAppOptions) {
    this.#options = { ...options };
    this.camera = new PerspectiveCamera();
    this.cameraFov = this.camera.fov;
    this.scene = new Scene();
    this.canvas = this.#options.canvas;
    this.canvas.style.display = "block";
    this.renderer = new WebGLRenderer({
      canvas: this.canvas,
      powerPreference: "high-performance",
      ...(this.#options.rendererOptions ?? {}),
    });
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.resize();
    this.#bindLifecycleEvents();
  }

  #bindLifecycleEvents() {
    if (!(this.#options.size instanceof Object)) {
      window.addEventListener("resize", this.#scheduleResize);
      if (this.#options.size === "parent" && this.canvas.parentNode) {
        this.#resizeObserver = new ResizeObserver(this.#scheduleResize);
        this.#resizeObserver.observe(this.canvas.parentNode as Element);
      }
    }
    this.#intersectionObserver = new IntersectionObserver(this.#handleIntersection, {
      root: null,
      rootMargin: "0px",
      threshold: 0,
    });
    this.#intersectionObserver.observe(this.canvas);
    document.addEventListener("visibilitychange", this.#handleVisibilityChange);
  }

  #unbindLifecycleEvents() {
    window.removeEventListener("resize", this.#scheduleResize);
    this.#resizeObserver?.disconnect();
    this.#intersectionObserver?.disconnect();
    document.removeEventListener("visibilitychange", this.#handleVisibilityChange);
  }

  #handleIntersection = (entries: IntersectionObserverEntry[]) => {
    this.#isVisible = entries[0].isIntersecting;
    if (this.#isVisible) {
      this.#startAnimating();
    } else {
      this.#stopAnimating();
    }
  };

  #handleVisibilityChange = () => {
    if (this.#isVisible) {
      if (document.hidden) {
        this.#stopAnimating();
      } else {
        this.#startAnimating();
      }
    }
  };

  #scheduleResize = () => {
    if (this.#resizeTimeout) clearTimeout(this.#resizeTimeout);
    this.#resizeTimeout = setTimeout(() => this.resize(), 100);
  };

  resize() {
    let width: number;
    let height: number;
    if (this.#options.size instanceof Object) {
      width = this.#options.size.width;
      height = this.#options.size.height;
    } else if (this.#options.size === "parent" && this.canvas.parentNode) {
      const parent = this.canvas.parentNode as HTMLElement;
      width = parent.offsetWidth;
      height = parent.offsetHeight;
    } else {
      width = window.innerWidth;
      height = window.innerHeight;
    }
    this.size.width = width;
    this.size.height = height;
    this.size.ratio = width / height;
    this.#updateCamera();
    this.#updateRendererSize();
    this.onAfterResize(this.size);
  }

  #updateCamera() {
    this.camera.aspect = this.size.width / this.size.height;
    if (this.camera.isPerspectiveCamera && this.cameraFov) {
      if (this.cameraMinAspect && this.camera.aspect < this.cameraMinAspect) {
        this.#adjustFovToAspect(this.cameraMinAspect);
      } else if (this.cameraMaxAspect && this.camera.aspect > this.cameraMaxAspect) {
        this.#adjustFovToAspect(this.cameraMaxAspect);
      } else {
        this.camera.fov = this.cameraFov;
      }
    }
    this.camera.updateProjectionMatrix();
    this.updateWorldSize();
  }

  #adjustFovToAspect(aspect: number) {
    const t = Math.tan(MathUtils.degToRad(this.cameraFov / 2)) / (this.camera.aspect / aspect);
    this.camera.fov = 2 * MathUtils.radToDeg(Math.atan(t));
  }

  updateWorldSize() {
    if (this.camera.isPerspectiveCamera) {
      const vFov = (this.camera.fov * Math.PI) / 180;
      this.size.wHeight = 2 * Math.tan(vFov / 2) * this.camera.position.length();
      this.size.wWidth = this.size.wHeight * this.camera.aspect;
    }
  }

  #updateRendererSize() {
    this.renderer.setSize(this.size.width, this.size.height);
    let pixelRatio = window.devicePixelRatio;
    if (this.maxPixelRatio && pixelRatio > this.maxPixelRatio) {
      pixelRatio = this.maxPixelRatio;
    } else if (this.minPixelRatio && pixelRatio < this.minPixelRatio) {
      pixelRatio = this.minPixelRatio;
    }
    this.renderer.setPixelRatio(pixelRatio);
    this.size.pixelRatio = pixelRatio;
  }

  #startAnimating() {
    if (this.#isAnimating) return;
    const animate = () => {
      this.#rafId = requestAnimationFrame(animate);
      this.#timer.update();
      this.#frameInfo.delta = this.#timer.getDelta();
      this.#frameInfo.elapsed += this.#frameInfo.delta;
      this.onBeforeRender(this.#frameInfo);
      this.render();
      this.onAfterRender(this.#frameInfo);
    };
    this.#isAnimating = true;
    this.#timer.reset();
    animate();
  }

  #stopAnimating() {
    if (this.#isAnimating) {
      if (this.#rafId) cancelAnimationFrame(this.#rafId);
      this.#isAnimating = false;
    }
  }

  #renderFrame() {
    this.renderer.render(this.scene, this.camera);
  }

  clear() {
    this.scene.traverse((obj) => {
      const mesh = obj as unknown as { isMesh?: boolean; material?: Record<string, unknown>; geometry?: { dispose(): void } };
      if (mesh.isMesh && mesh.material) {
        Object.values(mesh.material).forEach((value) => {
          if (value && typeof value === "object" && typeof (value as { dispose?: unknown }).dispose === "function") {
            (value as { dispose(): void }).dispose();
          }
        });
        (mesh.material as unknown as { dispose(): void }).dispose();
        mesh.geometry?.dispose();
      }
    });
    this.scene.clear();
  }

  dispose() {
    this.#unbindLifecycleEvents();
    this.#stopAnimating();
    this.#timer.dispose?.();
    this.clear();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
    this.isDisposed = true;
  }
}

interface PointerTracker {
  position: Vector2;
  nPosition: Vector2;
  hover: boolean;
  touching: boolean;
  onEnter: (t: PointerTracker) => void;
  onMove: (t: PointerTracker) => void;
  onClick: (t: PointerTracker) => void;
  onLeave: (t: PointerTracker) => void;
  dispose: () => void;
}

const trackedElements = new Map<HTMLElement, PointerTracker>();
const pointerScreen = new Vector2();
let pointerListenersAttached = false;

function trackPointer(
  domElement: HTMLElement,
  handlers: Partial<Pick<PointerTracker, "onEnter" | "onMove" | "onClick" | "onLeave">>
): PointerTracker {
  const tracker: PointerTracker = {
    position: new Vector2(),
    nPosition: new Vector2(),
    hover: false,
    touching: false,
    onEnter: () => {},
    onMove: () => {},
    onClick: () => {},
    onLeave: () => {},
    ...handlers,
    dispose: () => {},
  };

  if (!trackedElements.has(domElement)) {
    trackedElements.set(domElement, tracker);
    if (!pointerListenersAttached) {
      document.body.addEventListener("pointermove", handlePointerMove);
      document.body.addEventListener("pointerleave", handlePointerLeave);
      document.body.addEventListener("click", handleClick);
      document.body.addEventListener("touchstart", handleTouchStart, { passive: false });
      document.body.addEventListener("touchmove", handleTouchMove, { passive: false });
      document.body.addEventListener("touchend", handleTouchEnd, { passive: false });
      document.body.addEventListener("touchcancel", handleTouchEnd, { passive: false });
      pointerListenersAttached = true;
    }
  }

  tracker.dispose = () => {
    trackedElements.delete(domElement);
    if (trackedElements.size === 0) {
      document.body.removeEventListener("pointermove", handlePointerMove);
      document.body.removeEventListener("pointerleave", handlePointerLeave);
      document.body.removeEventListener("click", handleClick);
      document.body.removeEventListener("touchstart", handleTouchStart);
      document.body.removeEventListener("touchmove", handleTouchMove);
      document.body.removeEventListener("touchend", handleTouchEnd);
      document.body.removeEventListener("touchcancel", handleTouchEnd);
      pointerListenersAttached = false;
    }
  };

  return tracker;
}

function handlePointerMove(e: PointerEvent) {
  pointerScreen.x = e.clientX;
  pointerScreen.y = e.clientY;
  processInteraction();
}

function processInteraction() {
  for (const [elem, tracker] of trackedElements) {
    const rect = elem.getBoundingClientRect();
    if (isPointerInRect(rect)) {
      updateTrackerPosition(tracker, rect);
      if (!tracker.hover) {
        tracker.hover = true;
        tracker.onEnter(tracker);
      }
      tracker.onMove(tracker);
    } else if (tracker.hover && !tracker.touching) {
      tracker.hover = false;
      tracker.onLeave(tracker);
    }
  }
}

function handleClick(e: MouseEvent) {
  pointerScreen.x = e.clientX;
  pointerScreen.y = e.clientY;
  for (const [elem, tracker] of trackedElements) {
    const rect = elem.getBoundingClientRect();
    updateTrackerPosition(tracker, rect);
    if (isPointerInRect(rect)) tracker.onClick(tracker);
  }
}

function handlePointerLeave() {
  for (const tracker of trackedElements.values()) {
    if (tracker.hover) {
      tracker.hover = false;
      tracker.onLeave(tracker);
    }
  }
}

function handleTouchStart(e: TouchEvent) {
  if (e.touches.length > 0) {
    e.preventDefault();
    pointerScreen.x = e.touches[0].clientX;
    pointerScreen.y = e.touches[0].clientY;
    for (const [elem, tracker] of trackedElements) {
      const rect = elem.getBoundingClientRect();
      if (isPointerInRect(rect)) {
        tracker.touching = true;
        updateTrackerPosition(tracker, rect);
        if (!tracker.hover) {
          tracker.hover = true;
          tracker.onEnter(tracker);
        }
        tracker.onMove(tracker);
      }
    }
  }
}

function handleTouchMove(e: TouchEvent) {
  if (e.touches.length > 0) {
    e.preventDefault();
    pointerScreen.x = e.touches[0].clientX;
    pointerScreen.y = e.touches[0].clientY;
    for (const [elem, tracker] of trackedElements) {
      const rect = elem.getBoundingClientRect();
      updateTrackerPosition(tracker, rect);
      if (isPointerInRect(rect)) {
        if (!tracker.hover) {
          tracker.hover = true;
          tracker.touching = true;
          tracker.onEnter(tracker);
        }
        tracker.onMove(tracker);
      } else if (tracker.hover && tracker.touching) {
        tracker.onMove(tracker);
      }
    }
  }
}

function handleTouchEnd() {
  for (const tracker of trackedElements.values()) {
    if (tracker.touching) {
      tracker.touching = false;
      if (tracker.hover) {
        tracker.hover = false;
        tracker.onLeave(tracker);
      }
    }
  }
}

function updateTrackerPosition(tracker: PointerTracker, rect: DOMRect) {
  const { position, nPosition } = tracker;
  position.x = pointerScreen.x - rect.left;
  position.y = pointerScreen.y - rect.top;
  nPosition.x = (position.x / rect.width) * 2 - 1;
  nPosition.y = (-position.y / rect.height) * 2 + 1;
}

function isPointerInRect(rect: DOMRect) {
  const { x, y } = pointerScreen;
  return x >= rect.left && x <= rect.left + rect.width && y >= rect.top && y <= rect.top + rect.height;
}

const { randFloat, randFloatSpread } = MathUtils;

// Scratch vectors reused every frame to avoid per-frame allocation/GC churn.
const scratchControlPos = new Vector3();
const scratchPosA = new Vector3();
const scratchPosB = new Vector3();
const scratchVelA = new Vector3();
const scratchVelB = new Vector3();
const scratchDelta = new Vector3();
const scratchOverlap = new Vector3();
const scratchImpulseA = new Vector3();
const scratchImpulseB = new Vector3();

/** Verlet-ish sphere-packing physics: gravity, wall bounds, and pairwise
 * collision resolution between every ball (O(n^2), fine for n in the low
 * hundreds). Ball 0 doubles as an invisible cursor-controlled sphere when
 * enabled — it's never rendered (see Spheres.update), it just physically
 * shoves the visible balls out of the way as it follows the pointer. */
class BallpitPhysics {
  config: BallpitConfig;
  positionData: Float32Array;
  velocityData: Float32Array;
  sizeData: Float32Array;
  center = new Vector3();

  constructor(config: BallpitConfig) {
    this.config = config;
    this.positionData = new Float32Array(3 * config.count).fill(0);
    this.velocityData = new Float32Array(3 * config.count).fill(0);
    this.sizeData = new Float32Array(config.count).fill(1);
    this.#scatterInitialPositions();
    this.setSizes();
  }

  #scatterInitialPositions() {
    const { config, positionData } = this;
    this.center.toArray(positionData, 0);
    for (let i = 1; i < config.count; i++) {
      const base = 3 * i;
      positionData[base] = randFloatSpread(2 * config.maxX);
      positionData[base + 1] = randFloatSpread(2 * config.maxY);
      positionData[base + 2] = randFloatSpread(2 * config.maxZ);
    }
  }

  setSizes() {
    const { config, sizeData } = this;
    sizeData[0] = config.size0;
    for (let i = 1; i < config.count; i++) {
      sizeData[i] = randFloat(config.minSize, config.maxSize);
    }
  }

  update(frame: { delta: number }) {
    const { config, center, positionData, sizeData, velocityData } = this;
    const startIdx = config.controlSphere0 ? 1 : 0;

    if (config.controlSphere0) {
      scratchControlPos.fromArray(positionData, 0);
      scratchControlPos.lerp(center, 0.1).toArray(positionData, 0);
      scratchVelA.set(0, 0, 0).toArray(velocityData, 0);
    }

    for (let idx = startIdx; idx < config.count; idx++) {
      const base = 3 * idx;
      scratchPosA.fromArray(positionData, base);
      scratchVelA.fromArray(velocityData, base);
      scratchVelA.y -= frame.delta * config.gravity * sizeData[idx];
      scratchVelA.multiplyScalar(config.friction);
      scratchVelA.clampLength(0, config.maxVelocity);
      scratchPosA.add(scratchVelA);
      scratchPosA.toArray(positionData, base);
      scratchVelA.toArray(velocityData, base);
    }

    for (let idx = startIdx; idx < config.count; idx++) {
      const base = 3 * idx;
      scratchPosA.fromArray(positionData, base);
      scratchVelA.fromArray(velocityData, base);
      const radius = sizeData[idx];

      for (let jdx = idx + 1; jdx < config.count; jdx++) {
        const otherBase = 3 * jdx;
        scratchPosB.fromArray(positionData, otherBase);
        scratchVelB.fromArray(velocityData, otherBase);
        const otherRadius = sizeData[jdx];
        scratchDelta.copy(scratchPosB).sub(scratchPosA);
        const dist = scratchDelta.length();
        const sumRadius = radius + otherRadius;
        if (dist < sumRadius) {
          const overlap = sumRadius - dist;
          scratchOverlap.copy(scratchDelta).normalize().multiplyScalar(0.5 * overlap);
          scratchImpulseA.copy(scratchOverlap).multiplyScalar(Math.max(scratchVelA.length(), 1));
          scratchImpulseB.copy(scratchOverlap).multiplyScalar(Math.max(scratchVelB.length(), 1));
          scratchPosA.sub(scratchOverlap);
          scratchVelA.sub(scratchImpulseA);
          scratchPosA.toArray(positionData, base);
          scratchVelA.toArray(velocityData, base);
          scratchPosB.add(scratchOverlap);
          scratchVelB.add(scratchImpulseB);
          scratchPosB.toArray(positionData, otherBase);
          scratchVelB.toArray(velocityData, otherBase);
        }
      }

      if (config.controlSphere0) {
        scratchDelta.copy(scratchControlPos).sub(scratchPosA);
        const dist = scratchDelta.length();
        const sumRadius0 = radius + sizeData[0];
        if (dist < sumRadius0) {
          const diff = sumRadius0 - dist;
          scratchOverlap.copy(scratchDelta.normalize()).multiplyScalar(diff);
          scratchImpulseA.copy(scratchOverlap).multiplyScalar(Math.max(scratchVelA.length(), 2));
          scratchPosA.sub(scratchOverlap);
          scratchVelA.sub(scratchImpulseA);
        }
      }

      if (Math.abs(scratchPosA.x) + radius > config.maxX) {
        scratchPosA.x = Math.sign(scratchPosA.x) * (config.maxX - radius);
        scratchVelA.x = -scratchVelA.x * config.wallBounce;
      }
      if (config.gravity === 0) {
        if (Math.abs(scratchPosA.y) + radius > config.maxY) {
          scratchPosA.y = Math.sign(scratchPosA.y) * (config.maxY - radius);
          scratchVelA.y = -scratchVelA.y * config.wallBounce;
        }
      } else if (scratchPosA.y - radius < -config.maxY) {
        scratchPosA.y = -config.maxY + radius;
        scratchVelA.y = -scratchVelA.y * config.wallBounce;
      }
      const maxBoundary = Math.max(config.maxZ, config.maxSize);
      if (Math.abs(scratchPosA.z) + radius > maxBoundary) {
        scratchPosA.z = Math.sign(scratchPosA.z) * (config.maxZ - radius);
        scratchVelA.z = -scratchVelA.z * config.wallBounce;
      }
      scratchPosA.toArray(positionData, base);
      scratchVelA.toArray(velocityData, base);
    }
  }
}

/** MeshPhysicalMaterial patched with a cheap subsurface-scattering-style
 * term so backlit spheres pick up a soft glow instead of reading flat. */
class SpheresMaterial extends MeshPhysicalMaterial {
  uniforms: {
    thicknessDistortion: { value: number };
    thicknessAmbient: { value: number };
    thicknessAttenuation: { value: number };
    thicknessPower: { value: number };
    thicknessScale: { value: number };
  };

  constructor(params: ConstructorParameters<typeof MeshPhysicalMaterial>[0]) {
    super(params);
    this.uniforms = {
      thicknessDistortion: { value: 0.1 },
      thicknessAmbient: { value: 0 },
      thicknessAttenuation: { value: 0.1 },
      thicknessPower: { value: 2 },
      thicknessScale: { value: 10 },
    };
    this.defines = { ...this.defines, USE_UV: "" };
    this.onBeforeCompile = (shader: WebGLProgramParametersWithUniforms) => {
      Object.assign(shader.uniforms, this.uniforms);
      shader.fragmentShader =
        `
        uniform float thicknessPower;
        uniform float thicknessScale;
        uniform float thicknessDistortion;
        uniform float thicknessAmbient;
        uniform float thicknessAttenuation;
      ` + shader.fragmentShader;
      shader.fragmentShader = shader.fragmentShader.replace(
        "void main() {",
        `
        void RE_Direct_Scattering(const in IncidentLight directLight, const in vec2 uv, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, inout ReflectedLight reflectedLight) {
          vec3 scatteringHalf = normalize(directLight.direction + (geometryNormal * thicknessDistortion));
          float scatteringDot = pow(saturate(dot(geometryViewDir, -scatteringHalf)), thicknessPower) * thicknessScale;
          #ifdef USE_COLOR
            vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * vColor.rgb;
          #else
            vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * diffuse;
          #endif
          reflectedLight.directDiffuse += scatteringIllu * thicknessAttenuation * directLight.color;
        }

        void main() {
      `
      );
      const patchedChunk = ShaderChunk.lights_fragment_begin.replaceAll(
        "RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );",
        `
          RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
          RE_Direct_Scattering(directLight, vUv, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, reflectedLight);
        `
      );
      shader.fragmentShader = shader.fragmentShader.replace("#include <lights_fragment_begin>", patchedChunk);
    };
  }
}

const dummyObject = new Object3D();

/** Instanced-mesh sphere swarm: owns the physics sim and writes results
 * into the instance matrix / color buffers each frame. */
class Spheres extends InstancedMesh<SphereGeometry, SpheresMaterial> {
  config: BallpitConfig;
  physics: BallpitPhysics;
  ambientLight: AmbientLight;
  light: PointLight;

  constructor(renderer: WebGLRenderer, config: Partial<BallpitConfig> = {}) {
    const mergedConfig: BallpitConfig = { ...DEFAULT_CONFIG, ...config };
    const environment = new RoomEnvironment();
    const envMap = new PMREMGenerator(renderer).fromScene(environment, 0.04).texture;
    const geometry = new SphereGeometry();
    const material = new SpheresMaterial({ envMap, ...mergedConfig.materialParams });
    material.envMapRotation.x = -Math.PI / 2;
    super(geometry, material, mergedConfig.count);
    this.config = mergedConfig;
    this.physics = new BallpitPhysics(mergedConfig);
    this.ambientLight = new AmbientLight(this.config.ambientColor, this.config.ambientIntensity);
    this.add(this.ambientLight);
    this.light = new PointLight(0xffffff, this.config.lightIntensity);
    this.light.position.set(0, this.config.maxY, 10);
    this.add(this.light);
    this.setColors(this.config.colors);
  }

  /** Assigns each ball a random pick from the given palette — a mix of
   * distinct colors, not a gradient blend across the swarm. */
  setColors(colors: number[]) {
    if (Array.isArray(colors) && colors.length > 0) {
      const parsedColors = colors.map((c) => new Color(c));
      for (let idx = 0; idx < this.count; idx++) {
        const color = parsedColors[Math.floor(Math.random() * parsedColors.length)];
        this.setColorAt(idx, color);
      }
      if (this.instanceColor) this.instanceColor.needsUpdate = true;
    }
  }

  update(frame: { delta: number }) {
    this.physics.update(frame);
    for (let idx = 0; idx < this.count; idx++) {
      dummyObject.position.fromArray(this.physics.positionData, 3 * idx);
      // Ball 0 is the cursor-control sphere — it's a physics-only presence
      // (shoves the real balls around) and is never actually rendered, so
      // there's never a visible shape stuck to the pointer.
      dummyObject.scale.setScalar(idx === 0 ? 0 : this.physics.sizeData[idx]);
      dummyObject.updateMatrix();
      this.setMatrixAt(idx, dummyObject.matrix);
    }
    this.instanceMatrix.needsUpdate = true;
  }
}

interface BallpitHandle {
  three: RendererApp;
  spheres: Spheres;
  setCount: (count: number) => void;
  togglePause: () => void;
  dispose: () => void;
}

function createBallpit(canvas: HTMLCanvasElement, config: Partial<BallpitConfig> = {}): BallpitHandle {
  const app = new RendererApp({
    canvas,
    size: "parent",
    rendererOptions: { antialias: true, alpha: true },
  });
  let spheres: Spheres;
  app.renderer.toneMapping = ACESFilmicToneMapping;
  app.camera.position.set(0, 0, 20);
  app.camera.lookAt(0, 0, 0);
  app.cameraMaxAspect = 1.5;
  app.resize();

  let isPaused = false;
  const raycaster = new Raycaster();
  const groundPlane = new Plane(new Vector3(0, 0, 1), 0);
  const intersection = new Vector3();

  const pointer = trackPointer(canvas, {
    onMove(t) {
      if (!spheres.config.followCursor) return;
      raycaster.setFromCamera(t.nPosition, app.camera);
      app.camera.getWorldDirection(groundPlane.normal);
      raycaster.ray.intersectPlane(groundPlane, intersection);
      spheres.physics.center.copy(intersection);
      spheres.config.controlSphere0 = true;
    },
    onLeave() {
      spheres.config.controlSphere0 = false;
    },
  });

  function initialize(cfg: Partial<BallpitConfig>) {
    if (spheres) {
      app.clear();
      app.scene.remove(spheres);
    }
    spheres = new Spheres(app.renderer, cfg);
    app.scene.add(spheres);
  }
  initialize(config);

  app.onBeforeRender = (frame) => {
    if (!isPaused) spheres.update(frame);
  };
  app.onAfterResize = (size) => {
    spheres.config.maxX = size.wWidth / 2;
    spheres.config.maxY = size.wHeight / 2;
  };

  return {
    three: app,
    get spheres() {
      return spheres;
    },
    setCount(count: number) {
      initialize({ ...spheres.config, count });
    },
    togglePause() {
      isPaused = !isPaused;
    },
    dispose() {
      pointer.dispose();
      app.dispose();
    },
  };
}

export interface BallpitProps extends Partial<BallpitConfig> {
  className?: string;
}

/**
 * Full-bleed WebGL ball-pit background. Mount inside a positioned,
 * explicitly-sized container (the canvas sizes itself to its parent).
 * The balls physically react to the cursor (set followCursor={false} to
 * disable), but the canvas itself has pointer-events: none, so it never
 * intercepts real clicks or blocks touch scrolling.
 */
export default function Ballpit({ className = "", ...props }: BallpitProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handleRef = useRef<BallpitHandle | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    handleRef.current = createBallpit(canvas, props);

    return () => {
      handleRef.current?.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas
      className={className}
      ref={canvasRef}
      style={{ width: "100%", height: "100%", pointerEvents: "none" }}
    />
  );
}
