import StudentGlassCard from "@/components/members/StudentGlassCard";

function Block({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-white/[0.06] ${className}`.trim()}
      aria-hidden
    />
  );
}

export default function StudentPortalPageSkeleton() {
  return (
    <div
      className="flex flex-col gap-5 pb-10 sm:gap-6"
      aria-busy="true"
      aria-label="Loading"
    >
      <StudentGlassCard>
        <Block className="h-8 w-48 max-w-[70%]" />
        <Block className="mt-3 h-4 w-full max-w-xl" />
        <Block className="mt-2 h-4 w-2/3 max-w-md" />
      </StudentGlassCard>

      <StudentGlassCard>
        <div className="grid gap-3 sm:grid-cols-2">
          <Block className="h-28" />
          <Block className="h-28" />
          <Block className="h-28 sm:col-span-2" />
        </div>
      </StudentGlassCard>
    </div>
  );
}
