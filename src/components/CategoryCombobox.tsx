"use client";

import { useId, useState } from "react";

export default function CategoryCombobox({
  id,
  value,
  onChange,
  options,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const q = value.trim().toLowerCase();
  const exact = options.some((o) => o.toLowerCase() === q);
  const filtered = q && !exact ? options.filter((o) => o.toLowerCase().includes(q)) : options;
  const visible = open && filtered.length > 0;

  function select(option: string) {
    onChange(option);
    setOpen(false);
    setActive(-1);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((a) => Math.min(a + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && visible && active >= 0) {
      e.preventDefault();
      select(filtered[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className="relative">
      <input
        id={id}
        role="combobox"
        aria-expanded={visible}
        aria-controls={listId}
        aria-autocomplete="list"
        autoComplete="off"
        required
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
        className="auth-input pr-10"
      />
      <svg
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-white/60"
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        aria-hidden="true"
      >
        <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      {visible && (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 z-30 mt-2 max-h-56 overflow-auto rounded-xl border border-white/15 bg-[#0b1a33] p-1 shadow-2xl"
        >
          {filtered.map((option, i) => (
            <li
              key={option}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => select(option)}
              onMouseEnter={() => setActive(i)}
              className={`cursor-pointer rounded-lg px-3 py-2 text-sm ${
                i === active ? "bg-white/15 text-white" : "text-white/85 hover:bg-white/10"
              }`}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}