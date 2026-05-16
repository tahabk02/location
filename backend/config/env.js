import dotenv from "dotenv";
import path from "path";

// Load .env from the current working directory (root of the project on Vercel)
dotenv.config();

// Also try loading from one level up just in case of local dev structure
dotenv.config({ path: path.join(process.cwd(), ".env") });

console.log("Environment variables loaded. MONGODB_URI exists:", !!process.env.MONGODB_URI);
