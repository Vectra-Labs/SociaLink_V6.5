import jwt from "jsonwebtoken";
import { prisma } from "../config/db.js";

export const authMiddleware = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies?.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { user_id: decoded.id },
      select: {
        user_id: true,
        email: true,
        role: true,
        status: true,
      },
    });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user; // { user_id, email, role, status }
    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, token invalid" });
  }
};

export const optionalAuthMiddleware = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies?.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    // No token? No problem. Just continue as visitor.
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // We only need basic info (role/status) for filtering
    const user = await prisma.user.findUnique({
      where: { user_id: decoded.id },
      select: {
        user_id: true,
        email: true,
        role: true,
        status: true,
        // subscription_status might be on user or separate table. 
        // For now let's assume it's on user or handled via filtering query
        // If schema doesn't have it, we might crash. 
        // Let's safe check or join.
      },
    });

    if (user) {
      req.user = user;
    }
    next();
  } catch (error) {
    // Token invalid? Treat as visitor.
    next();
  }
};


// Alias pour compatibilité
export const authenticateToken = authMiddleware;
export const protect = authMiddleware;

/**
 * Middleware pour vérifier le rôle de l'utilisateur
 * @param {string[]} roles - Rôles autorisés
 */
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!roles.includes(req.user.role)) {
      console.log(`[AUTH DEBUG] Role denied. Required: ${JSON.stringify(roles)}, User role: ${req.user.role}, User ID: ${req.user.user_id}`);
      return res.status(403).json({
        message: "Access denied. Insufficient permissions.",
        requiredRoles: roles,
        yourRole: req.user.role
      });
    }

    next();
  };
};

/**
 * Middleware pour vérifier que l'utilisateur est validé
 */
export const requireValidated = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }

  // Admins passent toujours
  if (req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN') {
    return next();
  }

  if (req.user.status !== 'VALIDATED') {
    return res.status(403).json({
      message: "Votre compte doit être validé pour effectuer cette action.",
      status: req.user.status,
      action: 'wait_validation'
    });
  }

  next();
};
