import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

export const authorize = (roles = []) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // Fallback for transition period if needed, but better to enforce JWT
      const userRole = req.header("x-user-role")?.toLowerCase();
      const userId = req.header("x-user-id");
      const agencyId = req.header("x-agency-id") || "default";

      if (userRole && userId) {
        console.warn("Using insecure headers for auth. Please update frontend.");
        req.user = { id: userId, role: userRole, agencyId: agencyId };
        return next();
      }
      
      return res.status(401).json({ message: "Authentication required." });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;

      if (roles.length && !roles.includes(req.user.role)) {
        // Superadmin has access to everything admin has
        if (req.user.role === "superadmin" && roles.includes("admin")) {
          // Allow
        } else {
          return res.status(403).json({ message: "Forbidden: Access denied." });
        }
      }

      next();
    } catch (error) {
      return res.status(401).json({ message: "Invalid or expired token." });
    }
  };
};

export const optionalAuthorize = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    // Ignore invalid token for optional auth
    next();
  }
};

export const auth = authorize();
export const adminOnly = authorize(["admin"]);
