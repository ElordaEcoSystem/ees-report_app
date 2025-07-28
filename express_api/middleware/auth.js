// require("dotenv").config();
const { prisma } = require("../prisma/prisma-client");
const jwt = require("jsonwebtoken");

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];

  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Unathorized" });
  }
  // jwt.verify(token, process.env.SECRET_KEY, (err, userId) => {
  //   if (err) {
  //     return res.status(403).json({ error: "Invalid json" });
  //   }

  //   req.user = userId;

  //   next();
  // });

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    // console.log("Decoded token:", decoded);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    // console.log("User from DB:", user);

    if (!user) {
      return res.status(403).json({ error: "User not found" });
    }

    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT error:", err.message);
    return res.status(403).json({ error: "Invalid token" });
  }
};

module.exports = authenticateToken;

// const authenticateToken = async (req, res, next) => {
//   console.log("Middleware triggered"); // <-- Убедись, что middleware вызывается

//   const authHeader = req.headers["authorization"];
//   const token = authHeader && authHeader.split(" ")[1];

//   if (!token) {
//     console.log("No token");
//     return res.status(401).json({ error: "Unauthorized" });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.SECRET_KEY);
//     console.log("Decoded token:", decoded);

//     const user = await prisma.user.findUnique({
//       where: { id: decoded.userId },
//     });

//     console.log("User from DB:", user);

//     if (!user) {
//       return res.status(403).json({ error: "User not found" });
//     }

//     req.user = user;
//     console.log(req);
//     next();
//   } catch (err) {
//     console.error("JWT error:", err.message);
//     return res.status(403).json({ error: "Invalid token" });
//   }
// };
