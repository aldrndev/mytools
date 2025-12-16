import cron from "node-cron";
import fs from "node:fs/promises";
import path from "node:path";
import { config } from "../config/index.js";

const CLEANUP_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

async function cleanDirectory(directory: string) {
  try {
    // Check if directory exists
    try {
      await fs.access(directory);
    } catch {
      return; // Directory doesn't exist, skip
    }

    const files = await fs.readdir(directory);
    const now = Date.now();
    let deletedCount = 0;

    for (const file of files) {
      if (file === ".gitkeep") continue;

      const filePath = path.join(directory, file);
      try {
        const stats = await fs.stat(filePath);
        if (now - stats.mtimeMs > CLEANUP_AGE_MS) {
          await fs.unlink(filePath);
          deletedCount++;
        }
      } catch (err) {
        console.error(`Error processing file ${filePath}:`, err);
      }
    }

    if (deletedCount > 0) {
      console.log(
        `[Cleanup] Deleted ${deletedCount} old files from ${directory}`
      );
    }
  } catch (err) {
    console.error(`[Cleanup] Error cleaning directory ${directory}:`, err);
  }
}

export function startCleanupJob() {
  // Run every day at 00:00
  cron.schedule("0 0 * * *", async () => {
    console.log("[Cleanup] Starting daily cleanup job...");

    // Clean temp directory
    await cleanDirectory(config.storage.tempDir);

    // Clean public salary slips
    // output directory is at project root/output/salary-slips
    const salarySlipsDir = path.join(process.cwd(), "output/salary-slips");
    await cleanDirectory(salarySlipsDir);

    console.log("[Cleanup] Job finished.");
  });

  console.log("[Cleanup] Job scheduled (Daily at 00:00)");
}
