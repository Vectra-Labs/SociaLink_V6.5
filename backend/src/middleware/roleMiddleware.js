/**
 * Middleware pour vérifier si l'utilisateur a l'un des rôles autorisés.
 * Si le rôle 'ADMIN' est requis, 'SUPER_ADMIN' est automatiquement autorisé.
 * @param {...string} allowedRoles - Liste des rôles autorisés (ex: 'ADMIN', 'WORKER')
 * @returns {Function} Middleware Express
 */
export const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    // Le middleware d'authentification (authMiddleware) doit s'exécuter avant celui-ci
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        message: "Non authentifié",
      });
    }

    // Vérifie si le rôle de l'utilisateur est autorisé
    // Hiérarchie : SUPER_ADMIN > ADMIN > Autres
    const normalizedAllowed = [...allowedRoles];
    if (normalizedAllowed.includes('ADMIN') && !normalizedAllowed.includes('SUPER_ADMIN')) {
        normalizedAllowed.push('SUPER_ADMIN');
    }

    if (!normalizedAllowed.includes(req.user.role)) {
      return res.status(403).json({
        message: "Accès refusé : permissions insuffisantes",
      });
    }

    next();
  };
};
