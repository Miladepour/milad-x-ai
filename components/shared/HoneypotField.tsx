/** Hidden field — bots that fill every input get rejected server-side. */
export default function HoneypotField() {
  return (
    <input
      type="text"
      name="website"
      tabIndex={-1}
      autoComplete="off"
      aria-hidden
      className="absolute left-[-9999px] h-0 w-0 opacity-0 pointer-events-none"
    />
  );
}
