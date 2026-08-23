"use client";

import { useRef } from "react";

type DatePickerFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  optional?: boolean;
  min?: string;
  max?: string;
  helperText?: string;
};

export function DatePickerField({
  id,
  label,
  value,
  onChange,
  required = false,
  optional = false,
  min,
  max,
  helperText,
}: DatePickerFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const descriptionId = helperText ? `${id}-description` : undefined;

  const openCalendar = () => {
    const input = inputRef.current;
    if (!input) return;

    input.focus();
    try {
      input.showPicker?.();
    } catch {
      // Focusing the native date input remains a usable fallback.
    }
  };

  return (
    <div>
      <label
        htmlFor={id}
        className="text-sm font-semibold text-slate-800 dark:text-slate-200"
      >
        {label}
        {optional && (
          <span className="font-normal text-slate-500"> (optional)</span>
        )}
      </label>
      <div className="relative mt-2">
        <input
          ref={inputRef}
          id={id}
          name={id}
          type="date"
          required={required}
          min={min}
          max={max}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-describedby={descriptionId}
          className="block min-h-11 w-full cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2 pr-12 text-slate-950 shadow-sm outline-none [color-scheme:light] [&::-webkit-calendar-picker-indicator]:opacity-0 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:[color-scheme:dark]"
        />
        <button
          type="button"
          onClick={openCalendar}
          aria-label={`Open calendar for ${label}`}
          className="absolute inset-y-1 right-1 grid w-10 place-items-center rounded-md text-indigo-600 hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-indigo-300 dark:hover:bg-indigo-950"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-5 w-5"
          >
            <path d="M7 2v3M17 2v3M3.5 9h17M5 4h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
          </svg>
        </button>
      </div>
      {helperText && (
        <p
          id={descriptionId}
          className="mt-2 text-sm text-slate-500 dark:text-slate-400"
        >
          {helperText}
        </p>
      )}
    </div>
  );
}
