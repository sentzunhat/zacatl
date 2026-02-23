import { promises as fs } from "fs";

async function main() {
  const pkgRaw = await fs.readFile(new URL("../package.json", import.meta.url), "utf8");
  const pkg = JSON.parse(pkgRaw) as { peerDependencies?: Record<string, string> };
  const peers = pkg.peerDependencies || {};

  if (Object.keys(peers).length === 0) {
    console.log("No peerDependencies declared.");
    return 0;
  }

  const failed: string[] = [];

  for (const name of Object.keys(peers)) {
    try {
      console.log("Checking", name);
      // dynamic import to ensure the runtime package is resolvable
       
      // use import() so ESM and CJS both work when run via tsx
       
      await import(name);
      console.log("OK:", name);
    } catch (err: any) {
      console.error("ERROR importing", name, err?.message || err);
      failed.push(name);
    }
  }

  if (failed.length) {
    console.error("Peer import check failed for:", failed.join(", "));
    return 2;
  }

  console.log("All peers importable.");
  return 0;
}

void main()
  .then((code) => process.exit(code))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
