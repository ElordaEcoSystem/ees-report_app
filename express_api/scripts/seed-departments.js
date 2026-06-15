/**
 * Создаёт 3 отдела в БД (idempotent — повторный запуск безопасен)
 * Запуск: node express_api/scripts/seed-departments.js
 */

const { prisma } = require("../prisma/prisma-client");

const DEPARTMENTS = [
  { code: "asutP",        name: "АСУТП" },
  { code: "exploitation", name: "Отдел эксплуатации НС" },
  { code: "emergency",    name: "Отдел аварийных ситуаций" },
];

async function main() {
  for (const dept of DEPARTMENTS) {
    const existing = await prisma.department.findUnique({ where: { code: dept.code } });
    if (existing) {
      console.log(`Уже существует: ${dept.name}`);
      continue;
    }
    await prisma.department.create({ data: dept });
    console.log(`Создан: ${dept.name}`);
  }
  console.log("Готово.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
