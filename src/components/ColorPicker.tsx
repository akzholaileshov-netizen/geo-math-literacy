import { AVATAR_COLORS } from '../data/store/palette';

export function ColorPicker({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (color: string) => void;
  label: string;
}) {
  return (
    <fieldset>
      <legend className="text-sm text-muted">{label}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {AVATAR_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            aria-label={color}
            aria-pressed={value === color}
            onClick={() => onChange(color)}
            className={`h-11 w-11 rounded-full border-2 ${value === color ? 'border-ink shadow-glow' : 'border-transparent'}`}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    </fieldset>
  );
}
