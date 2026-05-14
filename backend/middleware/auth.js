export const authorize = (roles = []) => {
  return (req, res, next) => {
    // In a real project with JWT, we would decode the token and get the user role
    // For now, we use a custom header to simulate this
    const userRole = req.header("x-user-role")?.toLowerCase();
    const userId = req.header("x-user-id");
    const agencyId = req.header("x-agency-id") || "default";

    if (!userRole) {
      return res.status(401).json({ message: "Authentication required." });
    }

    if (roles.length && !roles.includes(userRole)) {
      // Superadmin has access to everything admin has
      if (userRole === "superadmin" && roles.includes("admin")) {
        // Allow
      } else {
        return res.status(403).json({ message: "Forbidden: Access denied." });
      }
    }

    req.user = { id: userId, role: userRole, agencyId: agencyId };
    next();
  };
};

export const auth = authorize();
export const adminOnly = authorize(["admin"]);
