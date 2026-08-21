interface OptionGroupProps<T extends string | number | boolean> {
  label: string;
  value: T;
  options: { label: string; value: T }[];
  onChange: (value: T) => void;
}

export function OptionGroup<T extends string | number | boolean>({
  label,
  value,
  options,
  onChange,
}: OptionGroupProps<T>) {
  return (
    <fieldset>
      <legend className="mb-2 text-base font-medium text-gray-700">{label}</legend>
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}>
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <button
              key={String(option.value)}
              type="button"
              onClick={() => onChange(option.value)}
              className={`h-12 rounded-lg border-2 text-base font-semibold transition-colors ${
                selected
                  ? 'border-primary bg-primary text-white'
                  : 'border-gray-200 bg-white text-gray-700 active:bg-gray-50'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
