const { prisma } = require("../prisma/prisma-client");

const DepartmentController = {
  getDepartments: async (req, res) => {
    try {
      const departments = await prisma.department.findMany({
        orderBy: { name: "asc" },
      });
      res.json(departments);
    } catch (error) {
      console.error("Get departments error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};

module.exports = DepartmentController;
