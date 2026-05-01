// Tiny CLI arg parser. We don't pull in commander/yargs to keep dependencies thin.

export type ArgValue = string | boolean;
export type Args = Record<string, ArgValue>;

export function parseArgs(argv: string[] = process.argv.slice(2)): Args {
  const out: Args = {};
  let positionalIndex = 0;
  for (let i = 0; i < argv.length; i++) {
    const tok = argv[i]!;
    if (tok.startsWith("--")) {
      const key = tok.slice(2);
      const next = argv[i + 1];
      if (!next || next.startsWith("--")) {
        out[key] = true;
      } else {
        out[key] = next;
        i++;
      }
    } else {
      out[`_${positionalIndex++}`] = tok;
    }
  }
  return out;
}

export function requireArg(args: Args, key: string, hint?: string): string {
  const v = args[key];
  if (typeof v !== "string" || !v) {
    throw new Error(`Missing --${key}${hint ? ` (${hint})` : ""}`);
  }
  return v;
}

export function optionalArg(args: Args, key: string, fallback?: string): string | undefined {
  const v = args[key];
  if (typeof v === "string") return v;
  return fallback;
}

export function positional(args: Args, idx: number): string | undefined {
  const v = args[`_${idx}`];
  return typeof v === "string" ? v : undefined;
}
