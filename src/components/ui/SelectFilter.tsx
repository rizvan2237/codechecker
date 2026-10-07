import type { SelectOption } from '../../features/students/studentFilters';

interface SelectFilterProps {
  label: string;
  value: string;
  options: readonly SelectOption[];
  onChange: (value: string) => void;
}

export function SelectFilter({ label, value, options, onChange }: SelectFilterProps) {
  return (
    <label className="select-filter">
      <span>{label}</span>
      <select className="select-input" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
