/** The prototype's convex squircle bevel, viewed vertically through n=1.5 glass. */
export function refractionProfile(bezel: number, thickness = 20, samples = 128): Float32Array {
  const heightAt = (t: number) => (1 - (1 - Math.min(1, Math.max(0, t))) ** 4) ** 0.25;
  const profile = new Float32Array(samples);
  if (bezel <= 0 || thickness <= 0) return profile;
  for (let i = 0; i < samples; i++) {
    const t = (i + 0.5) / samples;
    const slope = (heightAt(t + 0.001) - heightAt(t - 0.001)) / 0.002 * thickness / bezel;
    const theta1 = Math.atan(slope);
    const theta2 = Math.asin(Math.sin(theta1) / 1.5);
    profile[i] = heightAt(t) * thickness * Math.tan(theta1 - theta2);
  }
  return profile;
}

/** Pure RG displacement texture. Geometry is in CSS pixels, resolution only scales the raster. */
export function buildLensMap(w: number, h: number, radius: number, bezel: number, thickness = 20, resolution = 1) {
  const width = Math.max(2, Math.round(w * resolution));
  const height = Math.max(2, Math.round(h * resolution));
  const data = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = data[i + 1] = data[i + 2] = 128;
    data[i + 3] = 255;
  }
  if (bezel <= 0 || thickness <= 0) return { width, height, data };
  const r = Math.max(0, Math.min(radius, w / 2, h / 2));
  const hx = w / 2 - r, hy = h / 2 - r;
  const profile = refractionProfile(bezel, thickness);
  const max = Math.max(1e-6, ...profile);
  const write = (x: number, y: number, nx: number, ny: number) => {
    const i = (y * width + x) * 4;
    // Round the signed offset first so mirrored channels sum to exactly 256.
    data[i] = 128 + Math.sign(nx) * Math.round(Math.abs(nx) * 127);
    data[i + 1] = 128 + Math.sign(ny) * Math.round(Math.abs(ny) * 127);
  };
  // Only the bottom-right quarter's bevel ring needs SDF/normal evaluation.
  for (let y = Math.floor(height / 2); y < height; y++) {
    const py = (y + 0.5) * h / height - h / 2;
    const qy = py - hy;
    const oy = Math.max(qy, 0);
    const innerR = r - bezel;
    const innerX = innerR >= 0
      ? (oy < innerR ? hx + Math.sqrt(innerR * innerR - oy * oy) : 0)
      : (py < h / 2 - bezel ? w / 2 - bezel : 0);
    const outerX = hx + Math.sqrt(Math.max(0, r * r - oy * oy));
    const start = Math.max(Math.floor(width / 2), Math.floor((w / 2 + innerX) * width / w));
    const end = Math.min(width, Math.ceil((w / 2 + outerX) * width / w));
    for (let x = start; x < end; x++) {
      const px = (x + 0.5) * w / width - w / 2;
      const qx = px - hx;
      const ox = Math.max(qx, 0);
      const length = Math.hypot(ox, oy);
      const depth = r - length - Math.min(Math.max(qx, qy), 0);
      if (depth <= 0 || depth >= bezel) continue;
      const shift = profile[Math.min(profile.length - 1, Math.floor(depth / bezel * profile.length))] / max;
      const nx = px === 0 ? 0 : (qx > 0 && qy > 0 ? ox / length : qx > qy ? 1 : 0) * shift;
      const ny = py === 0 ? 0 : (qx > 0 && qy > 0 ? oy / length : qx > qy ? 0 : 1) * shift;
      write(x, y, nx, ny);
      write(width - 1 - x, y, -nx, ny);
      write(x, height - 1 - y, nx, -ny);
      write(width - 1 - x, height - 1 - y, -nx, -ny);
    }
  }
  return { width, height, data };
}
