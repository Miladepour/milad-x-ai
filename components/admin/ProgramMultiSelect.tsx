"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { MemberProgram } from "@/lib/members/types";

interface ProgramMultiSelectProps {
  programs: MemberProgram[];
  value: string[];
  onChange: (programIds: string[]) => void;
}

export default function ProgramMultiSelect({
  programs,
  value,
  onChange,
}: ProgramMultiSelectProps) {
  const [query, setQuery] = useState("");

  const sortedPrograms = useMemo(
    () => [...programs].sort((a, b) => a.title.localeCompare(b.title)),
    [programs]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sortedPrograms;
    return sortedPrograms.filter((program) =>
      program.title.toLowerCase().includes(q)
    );
  }, [query, sortedPrograms]);

  function toggle(programId: string) {
    if (value.includes(programId)) {
      onChange(value.filter((id) => id !== programId));
      return;
    }
    onChange([...value, programId]);
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/[0.08] p-4">
      <div className="relative max-w-xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cream/40" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search programs…"
          className="form-field w-full py-2.5 ps-10"
        />
      </div>
      {value.length > 0 && (
        <p className="font-dm text-xs text-cream/55">
          {value.length} program{value.length === 1 ? "" : "s"} selected
        </p>
      )}
      <ul className="flex max-h-48 flex-col gap-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <li className="py-3 text-center font-dm text-sm text-cream/50">No programs found.</li>
        ) : (
          filtered.map((program) => {
            const checked = value.includes(program.id);
            return (
              <li key={program.id}>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-white/[0.04]">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(program.id)}
                    className="accent-orange"
                  />
                  <span className="font-dm text-sm text-cream">{program.title}</span>
                </label>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
