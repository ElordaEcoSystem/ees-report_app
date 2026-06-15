const { prisma } = require("../prisma/prisma-client");
const jwt = require("jsonwebtoken");

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, fullName: true, role: true },
    });

    if (!user) {
      return res.status(403).json({ error: "User not found" });
    }

    req.user = { userId: user.id, fullName: user.fullName, role: user.role };
    next();
  } catch (err) {
    console.error("JWT error:", err.message);
    return res.status(403).json({ error: "Invalid token" });
  }
};

module.exports = authenticateToken;
