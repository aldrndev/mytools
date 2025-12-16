export const config = {
  port: Number(process.env.PORT) || 3001,
  host: process.env.HOST || "0.0.0.0",
  cors: {
    origin: process.env.CORS_ORIGIN || "https://localhost:5173",
    credentials: true,
  },
  upload: {
    maxFileSize: 50 * 1024 * 1024, // 50MB
    allowedMimeTypes: ["application/pdf"],
  },
  storage: {
    tempDir: "./temp",
    outputDir: "./output",
  },
};
