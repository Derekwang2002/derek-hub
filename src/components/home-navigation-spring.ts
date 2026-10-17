export type Spring = { value: number; velocity: number };

/** Retarget without resetting velocity. Substeps keep low-refresh frames stable. */
export function stepSpring(
  spring: Spring, target: number, elapsed: number, stiffness: number, damping: number,
) {
  const duration = Math.min(Math.max(elapsed, 0), .064);
  const steps = Math.max(1, Math.ceil(duration / (1 / 240)));
  const dt = duration / steps;
  for (let i = 0; i < steps; i++) {
    spring.velocity += ((target - spring.value) * stiffness - spring.velocity * damping) * dt;
    spring.value += spring.velocity * dt;
  }
  const moving = Math.abs(target - spring.value) > .0001 || Math.abs(spring.velocity) > .001;
  if (!moving) {
    spring.value = target;
    spring.velocity = 0;
  }
  return moving;
}
