const { prisma } = require("../../prisma/prisma-client");
const fs = require("fs");
const path = require("path");
const { addWatermark } = require("./workLog-service");

const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const WORKLOG_INCLUDE = {
  author: { select: { id: true, fullName: true, position: true, email: true } },
  executors: { select: { id: true, fullName: true, position: true } },
  department: { select: { id: true, code: true, name: true } },
};

const WorkLogController = {
  createWorkLog: async (req, res) => {
    const userId = req.user.userId;
    const userName = req.user.fullName;
    const { object, content, objectType, recordType, executorIds: executorIdsRaw, extraFields: extraFieldsRaw } = req.body;

    const photoFiles = req.files?.photos || [];
    const beforePhotoFiles = req.files?.beforePhotos || [];

    if (!object || !content || photoFiles.length === 0) {
      return res.status(400).json({ error: "Все поля обязательны" });
    }

    const validRecordTypes = ["WORK", "DEFECT", "INSTALLATION"];
    const normalizedRecordType = validRecordTypes.includes(recordType) ? recordType : "WORK";

    let executorIds = [];
    try { executorIds = JSON.parse(executorIdsRaw || "[]"); } catch {}

    let extraFields = {};
    try { extraFields = JSON.parse(extraFieldsRaw || "{}"); } catch {}

    try {
      const authorUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { departmentId: true },
      });
      const photoUrls = [];
      for (const file of photoFiles) {
        const filePath = path.join(uploadDir, file.filename);
        await addWatermark(filePath, objectType || object, object, userName);
        photoUrls.push(`/uploads/${path.basename(filePath)}`);
      }

      const beforePhotoUrls = [];
      for (const file of beforePhotoFiles) {
        const filePath = path.join(uploadDir, file.filename);
        await addWatermark(filePath, objectType || object, object, userName);
        beforePhotoUrls.push(`/uploads/${path.basename(filePath)}`);
      }

      const workLog = await prisma.workLog.create({
        data: {
          object,
          objectType: objectType || null,
          recordType: normalizedRecordType,
          content,
          photoUrls,
          beforePhotoUrls,
          extraFields,
          authorId: userId,
          departmentId: authorUser?.departmentId || null,
          executors: executorIds.length > 0
            ? { connect: executorIds.map((id) => ({ id })) }
            : undefined,
        },
        include: WORKLOG_INCLUDE,
      });

      res.json(workLog);
    } catch (error) {
      console.error("Create WorkLog error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },

  deleteWorkLog: async (req, res) => {
    const { id } = req.params;
    try {
      const workLog = await prisma.workLog.findUnique({ where: { id } });
      if (!workLog) return res.status(404).json({ error: "Запись не найдена" });

      // Удаляем файлы с диска
      const allUrls = [...(workLog.photoUrls ?? []), ...(workLog.beforePhotoUrls ?? [])];
      for (const url of allUrls) {
        const filePath = path.join(__dirname, "../../", url);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }

      await prisma.workLog.delete({ where: { id } });
      res.json({ success: true });
    } catch (error) {
      console.error("Delete WorkLog error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },

  getAllWorkLog: async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(200, Math.max(1, parseInt(req.query.limit) || 100));
    const skip = (page - 1) * limit;

    const { role, userId } = req.user;

    try {
      let where = {};
      if (role !== "ADMIN") {
        const user = await prisma.user.findUnique({ where: { id: userId }, select: { departmentId: true } });
        where = user?.departmentId
          ? { departmentId: user.departmentId }
          : { authorId: userId };
      }

      const [items, total] = await Promise.all([
        prisma.workLog.findMany({
          where,
          include: WORKLOG_INCLUDE,
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.workLog.count({ where }),
      ]);

      res.json({ items, total, page, limit });
    } catch (error) {
      console.error("get all WorkLog error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
};

module.exports = WorkLogController;
