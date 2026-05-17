let app;
try {
  const server = await import("../backend/server.js");
  app = server.default;
} catch (error) {
  console.error("FATAL: Failed to import backend/server.js:", error);
  // Fallback express app to reveal the error
  const express = (await import("express")).default;
  app = express();
  app.all("*", (req, res) => {
    res.status(500).json({
      success: false,
      message: "FATAL_IMPORT_ERROR",
      error: error.message,
      stack: error.stack
    });
  });
}

export default app;
