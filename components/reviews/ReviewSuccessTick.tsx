export default function ReviewSuccessTick() {
  return (
    <div
      className="certificate-verify-badge mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-orange/30 bg-orange/10"
      aria-hidden
    >
      <svg
        viewBox="0 0 48 48"
        className="h-9 w-9 text-orange"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="24"
          cy="24"
          r="22"
          className="certificate-verify-ring"
          stroke="currentColor"
          strokeWidth="2"
          opacity="0.35"
        />
        <path
          d="M14 24.5L21 31.5L34 17.5"
          className="certificate-verify-tick"
          pathLength="1"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
