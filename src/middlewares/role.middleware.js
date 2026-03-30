const isAdmin = async (req, res, next) => {
  const { username, role } = req.user;
  if (role !== 'admin') {
    return res.status(403).json({ message: `${username} is not admin` });
  }
  next();
};

const isWaiter = async (req, res, next) => {
  const { username, role } = req.user;
  if (role !== 'Mesero') {
    return res.status(403).json({ message: `${username} is not waiter` });
  }
  next();
};

const isChef = async (req, res, next) => {
  const { username, role } = req.user;
  if (role !== 'Cocinero') {
    return res.status(403).json({ message: `${username} is not chef` });
  }
  next();
};

const isCashier = async (req, res, next) => {
  const { username, role } = req.user;
  if (role !== 'Cajero') {
    return res.status(403).json({ message: `${username} is not cashier` });
  }
  next();
};

const isManager = async (req, res, next) => {
  const { username, role } = req.user;
  if (role !== 'Gerente') {
    return res.status(403).json({ message: `${username} is not manager` });
  }
  next();
};

/**
 * Permite el acceso a múltiples roles.
 * @param {...string} roles - Roles permitidos (ej: 'admin', 'Gerente', 'Cajero')
 * @example router.get('/ruta', authenticate, allowRoles('admin', 'Gerente'), controller)
 */
const allowRoles = (...roles) => {
  return (req, res, next) => {
    const { username, role } = req.user;
    if (!roles.includes(role)) {
      return res.status(403).json({
        message: `${username} does not have the required role. Required: ${roles.join(' or ')}`,
      });
    }
    next();
  };
};

module.exports = {
  isAdmin,
  isWaiter,
  isChef,
  isCashier,
  isManager,
  allowRoles,
};
