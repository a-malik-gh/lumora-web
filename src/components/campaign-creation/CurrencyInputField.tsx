type CurrencyInputFieldProps = {
  id: string;
  label: string;
  value: number | "";
  onChange: (value: number) => void;
  required?: boolean;
  min?: number;
  max?: number;
  helperText?: string;
  error?: string;
};

export function CurrencyInputField({
  id,
  label,
  value,
  onChange,
  required = false,
  min = 0,
  max,
  helperText,
  error,
}: CurrencyInputFieldProps) {
  const descriptionId = helperText || error ? `${id}-description` : undefined;

  return (
    <div>
      <label
        htmlFor={id}
        className="text-sm font-semibold text-slate-800 dark:text-slate-200"
      >
        {label}
      </label>
      <div className="relative mt-2">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 font-semibold text-slate-500 dark:text-slate-400"
        >
          $
        </span>
        <input
          id={id}
          name={id}
          type="number"
          required={required}
          min={min}
          max={max}
          step="0.01"
          inputMode="decimal"
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          aria-invalid={Boolean(error)}
          aria-describedby={descriptionId}
          className={`block min-h-11 w-full rounded-lg border bg-white py-2 pl-8 pr-3 text-slate-950 shadow-sm outline-none focus:ring-2 dark:bg-slate-950 dark:text-white ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-500/30"
              : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/30 dark:border-slate-700"
          }`}
        />
      </div>
      {(error || helperText) && (
        <p
          id={descriptionId}
          role={error ? "alert" : undefined}
          className={`mt-2 text-sm ${
            error
              ? "font-medium text-red-700 dark:text-red-300"
              : "text-slate-500 dark:text-slate-400"
          }`}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
}
