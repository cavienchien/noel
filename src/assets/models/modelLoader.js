// Optional GLTF/GLB Model Loader Helper with Automatic Fallback to Procedural 3D Primitives
import { useGLTF } from '@react-three/drei';

export function preloadOptionalModel(url) {
  try {
    useGLTF.preload(url);
  } catch {
    // Graceful fallback to built-in 3D architectural & furniture components
  }
}
