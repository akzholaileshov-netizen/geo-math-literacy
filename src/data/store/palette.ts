export const AVATAR_COLORS = [
  '#8d6a2e',
  '#1f6b45',
  '#8e342c',
  '#3d4f7c',
  '#6b4c7a',
  '#2f5d62',
  '#a15c38',
  '#4a5568',
] as const;

export function avatarColorOrDefault(color: string | undefined): string {
  if (color && AVATAR_COLORS.includes(color as (typeof AVATAR_COLORS)[number])) return color;
  return AVATAR_COLORS[0];
}
