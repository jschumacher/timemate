import { useState, useRef, useEffect } from "react";
import { Search, Plus } from "lucide-react";
import { searchCities, CityTimezone } from "@/lib/timezone-data";

interface LocationSearchProps {
  onAdd: (city: CityTimezone) => void;
  disabled: boolean;
  compact?: boolean;
}

export function LocationSearch({ onAdd, disabled, compact = false }: LocationSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CityTimezone[]>([]);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setResults(searchCities(query));
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSelect(city: CityTimezone) {
    onAdd(city);
    setQuery("");
    setOpen(false);
    setFocused(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
      setFocused(false);
      inputRef.current?.blur();
    }
  }

  return (
    <div
      ref={containerRef}
      className={`relative transition-all duration-200 ease-out ${
        compact
          ? focused ? "w-72" : "w-40"
          : "w-full max-w-md"
      }`}
    >
      <div className="relative">
        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground ${compact ? "h-3.5 w-3.5" : "h-4 w-4"}`} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => { setOpen(true); setFocused(true); }}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={disabled ? "Max 5 locations" : "Add a city…"}
          className={`w-full pl-9 pr-4 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all disabled:opacity-50 ${
             compact ? "h-8 text-xs" : "h-10 text-base"
          }`}
        />
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-50 top-full mt-1 w-full min-w-[280px] rounded-lg border border-border bg-popover shadow-lg overflow-hidden">
          {results.map((city, i) => (
            <button
              key={`${city.city}-${city.timezone}`}
              onClick={() => handleSelect(city)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left transition-colors ${
                i === selectedIndex ? "bg-accent" : "hover:bg-accent/50"
              }`}
            >
              <span className="text-base">{city.flag}</span>
              <span className="text-foreground font-medium">{city.city}</span>
              <span className="text-muted-foreground text-xs ml-auto">{city.country}</span>
              <Plus className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}