const PALETTES = [
  ["#e7ddc8", "#efe7d6"],
  ["#d9e0cb", "#e4e8d8"],
  ["#e6dcd2", "#efe6dd"],
  ["#dce1d0", "#e6ead9"],
];

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function IdeaCover({
  id,
  height = 96,
  children,
}: {
  id: string;
  height?: number;
  children?: React.ReactNode;
}) {
  const [c1, c2] = PALETTES[hashString(id) % PALETTES.length];
  return (
    <div
      className="diagonal-cover relative w-full"
      style={{ height, ["--c1" as string]: c1, ["--c2" as string]: c2 }}
    >
      {children}
    </div>
  );
}
