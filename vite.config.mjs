import { gzipSync, brotliCompressSync, constants as zlibConstants } from "node:zlib";
import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { defineConfig } from "vite";

const SHOULD_COMPRESS_EXTENSIONS = new Set([".js", ".css", ".html", ".svg", ".json", ".txt"]);

const hasCompressibleExtension = (filePath) => {
  for (const extension of SHOULD_COMPRESS_EXTENSIONS) {
    if (filePath.endsWith(extension)) {
      return true;
    }
  }
  return false;
};

const walkFiles = async (directory) => {
  const entries = await readdir(directory);
  const files = await Promise.all(
    entries.map(async (entry) => {
      const absolutePath = join(directory, entry);
      const entryStat = await stat(absolutePath);
      if (entryStat.isDirectory()) {
        return await walkFiles(absolutePath);
      }
      return [absolutePath];
    }),
  );
  return files.flat();
};

const precompressBuildOutput = () => ({
  name: "precompress-build-output",
  apply: "build",
  async closeBundle() {
    try {
      const outputDir = join(process.cwd(), "dist");
      const files = await walkFiles(outputDir);
      const candidates = files.filter((filePath) => hasCompressibleExtension(filePath));

      await Promise.all(
        candidates.map(async (filePath) => {
          try {
            const content = await readFile(filePath);
            const gzip = gzipSync(content, { level: 9 });
            const brotli = brotliCompressSync(content, {
              params: {
                [zlibConstants.BROTLI_PARAM_QUALITY]: 11,
              },
            });

            await Promise.all([
              writeFile(`${filePath}.gz`, gzip),
              writeFile(`${filePath}.br`, brotli),
            ]);
          } catch (error) {
            this.warn(
              `[precompress-build-output] Skipped ${filePath}: ${error instanceof Error ? error.message : String(error)}`,
            );
          }
        }),
      );
    } catch (error) {
      this.warn(
        `[precompress-build-output] Disabled due to error: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
});

const shouldPrecompress = process.env.ENABLE_PRECOMPRESS === "true";

export default defineConfig({
  plugins: shouldPrecompress ? [precompressBuildOutput()] : [],
  build: {
    rollupOptions: {
      external: ["some-node-only-package"],
    },
  },
});
