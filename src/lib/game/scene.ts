/** Visual unlocks reuse earned milestones and do not change the player's money. */
export function sceneUnlocks(progress: number, milestones: number[]) {
  const earned = Math.max(Math.max(0, Math.min(1, progress)) * 100, ...milestones, 0);
  return { tree: earned >= 25, bench: earned >= 50, flowers: earned >= 75, goal: earned >= 100 };
}