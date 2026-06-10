"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import type { StudentProfile } from "@/lib/members/types";

interface StudentSearchSelectProps {
  students: StudentProfile[];
  value: string;
  onChange: (studentId: string) => void;
  placeholder?: string;
}

function studentLabel(student: StudentProfile): string {
  return student.fullName?.trim() || student.email;
}

export default function StudentSearchSelect({
  students,
  value,
  onChange,
  placeholder = "Search by name or email…",
}: StudentSearchSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  const sortedStudents = useMemo(
    () =>
      [...students].sort((a, b) =>
        studentLabel(a).localeCompare(studentLabel(b))
      ),
    [students]
  );

  const selected = useMemo(
    () => sortedStudents.find((student) => student.id === value) ?? null,
    [sortedStudents, value]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sortedStudents.slice(0, 50);
    return sortedStudents
      .filter((student) => {
        const haystack = [student.fullName, student.email, student.phone ?? ""]
          .join(" ")
          .toLowerCase();
        return haystack.includes(q);
      })
      .slice(0, 50);
  }, [query, sortedStudents]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function selectStudent(student: StudentProfile) {
    onChange(student.id);
    setQuery("");
    setOpen(false);
  }

  function clearSelection() {
    onChange("");
    setQuery("");
    setOpen(true);
  }

  return (
    <div ref={rootRef} className="relative max-w-xl">
      {selected && !open ? (
        <div className="form-field flex items-center justify-between gap-2 py-2.5">
          <div className="min-w-0">
            <p className="truncate font-dm text-sm text-cream">{studentLabel(selected)}</p>
            <p className="truncate font-dm text-xs text-cream/55">{selected.email}</p>
          </div>
          <button
            type="button"
            onClick={clearSelection}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-cream/50 hover:bg-white/[0.06] hover:text-cream"
            aria-label="Clear student"
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>
      ) : (
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cream/40" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            className="form-field w-full py-2.5 ps-10 pe-10"
            autoComplete="off"
          />
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cream/40" />
        </div>
      )}

      {open && (
        <ul className="student-glass absolute z-20 mt-2 max-h-56 w-full overflow-y-auto !rounded-xl !p-1 shadow-2xl">
          {filtered.length === 0 ? (
            <li className="px-3 py-4 text-center font-dm text-sm text-cream/50">
              No students match your search.
            </li>
          ) : (
            filtered.map((student) => (
              <li key={student.id}>
                <button
                  type="button"
                  onClick={() => selectStudent(student)}
                  className={`flex w-full flex-col items-start rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-white/[0.06] ${
                    student.id === value ? "bg-orange/10" : ""
                  }`}
                >
                  <span className="font-dm text-sm text-cream">{studentLabel(student)}</span>
                  <span className="font-dm text-xs text-cream/55">{student.email}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
