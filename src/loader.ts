import path from "path";

const EXTENSIONS = [".js", ".mjs", ".cjs", ".json"];

const isRelativeOrAbsolute = (specifier: string) =>
  specifier.startsWith("./") ||
  specifier.startsWith("../") ||
  specifier.startsWith("/");

const hasExtension = (specifier: string) => path.extname(specifier) !== "";

const expandCandidates = (specifier: string) => [
  ...EXTENSIONS.map((ext) => `${specifier}${ext}`),
  ...EXTENSIONS.map((ext) => `${specifier}/index${ext}`),
];

export const resolve = async (
  specifier: string,
  context: { parentURL?: string },
  nextResolve: (
    nextSpecifier: string,
    nextContext: { parentURL?: string },
  ) => Promise<{ url: string }>,
) => {
  if (
    !isRelativeOrAbsolute(specifier) ||
    hasExtension(specifier) ||
    specifier.includes("?") ||
    specifier.includes("#")
  ) {
    return nextResolve(specifier, context);
  }

  for (const candidate of expandCandidates(specifier)) {
    try {
      return await nextResolve(candidate, context);
    } catch {
      // Try the next candidate.
    }
  }

  return nextResolve(specifier, context);
};
