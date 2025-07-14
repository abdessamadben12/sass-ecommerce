/* DateRangePicker.jsx */
import { useState, useRef, useEffect } from "react";

/**
 * Formate une date JS → “July 07, 2025”
 */
const formatDate = (d) =>
  d.toLocaleDateString("en-US", {
    month: "long",
    day: "2-digit",
    year: "numeric",
  });

/**
 * Calcule la date en soustrayant n jours
 */
const minusDays = (d, n) => {
  const copy = new Date(d);
  copy.setDate(copy.getDate() - n);
  return copy;
};

/**
 * Toutes les périodes prédéfinies
 */
const presets = [
  {
    id: "today",
    label: "Today",
    getRange: () => {
      const today = new Date();
      return [today, today];
    },
  },
  {
    id: "yesterday",
    label: "Yesterday",
    getRange: () => {
      const y = minusDays(new Date(), 1);
      return [y, y];
    },
  },
  {
    id: "last7",
    label: "Last 7 Days",
    getRange: () => [minusDays(new Date(), 6), new Date()],
  },
  {
    id: "last15",
    label: "Last 15 Days",
    getRange: () => [minusDays(new Date(), 14), new Date()],
  },
  {
    id: "last30",
    label: "Last 30 Days",
    getRange: () => [minusDays(new Date(), 29), new Date()],
  },
  {
    id: "thisMonth",
    label: "This Month",
    getRange: () => {
      const now = new Date();
      return [new Date(now.getFullYear(), now.getMonth(), 1), now];
    },
  },
  {
    id: "lastMonth",
    label: "Last Month",
    getRange: () => {
      const now = new Date();
      const first = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const last = new Date(now.getFullYear(), now.getMonth(), 0);
      return [first, last];
    },
  },
  {
    id: "last6",
    label: "Last 6 Months",
    getRange: () => [minusDays(new Date(), 182), new Date()],
  },
  {
    id: "thisYear",
    label: "This Year",
    getRange: () => {
      const now = new Date();
      return [new Date(now.getFullYear(), 0, 1), now];
    },
  },
];

export default function DateRangePicker({ onChange }) {
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState(false);
  const [start, setStart] = useState(minusDays(new Date(), 6));
  const [end, setEnd] = useState(new Date());

  const box = useRef(null);

  // Ferme le menu quand on clique dehors
  useEffect(() => {
    const handleClick = (e) => {
      if (box.current && !box.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Propage au parent
  useEffect(() => {
    onChange?.([start, end]);
  }, [start, end, onChange]);

  const display = `${formatDate(start)} - ${formatDate(end)}`;

  return (
    <div className="relative w-fit" ref={box}>
      {/* Input principal --------------------------------------------------- */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-gray-50 focus:outline-none"
      >
        <span>{display}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 opacity-60"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1012 19.5a7.5 7.5 0 004.65-2.85z"
          />
        </svg>
      </button>

      {/* Dropdown --------------------------------------------------------- */}
      {open && (
        <div className="absolute z-20 mt-2 w-48 rounded-md border border-gray-200 bg-white shadow-lg">
          {!custom ? (
            <ul className="max-h-64 overflow-auto py-2 text-sm">
              {presets.map((p) => (
                <li key={p.id}>
                  <button
                    onClick={() => {
                      const [s, e] = p.getRange();
                      setStart(s);
                      setEnd(e);
                      setOpen(false);
                    }}
                    className="block w-full px-4 py-2 text-left hover:bg-indigo-600 hover:text-white"
                  >
                    {p.label}
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => setCustom(true)}
                  className="block w-full px-4 py-2 text-left hover:bg-indigo-600 hover:text-white"
                >
                  Custom Range
                </button>
              </li>
            </ul>
          ) : (
            /* Sélection manuelle ---------------------------------------- */
            <div className="p-4 space-y-2 text-sm">
              <div className="flex flex-col gap-1">
                <label className="font-medium">From</label>
                <input
                  type="date"
                  value={start.toISOString().slice(0, 10)}
                  onChange={(e) => setStart(new Date(e.target.value))}
                  className="rounded-md border border-gray-300 px-2 py-1"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-medium">To</label>
                <input
                  type="date"
                  value={end.toISOString().slice(0, 10)}
                  onChange={(e) => setEnd(new Date(e.target.value))}
                  className="rounded-md border border-gray-300 px-2 py-1"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setCustom(false)}
                  className="rounded-md px-3 py-1 text-gray-600 hover:bg-gray-100"
                >
                  Back
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-md bg-indigo-600 px-3 py-1 text-white hover:bg-indigo-700"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
