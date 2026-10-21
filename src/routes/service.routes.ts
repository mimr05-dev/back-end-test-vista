import { Router } from "express";
import { prisma } from "../lib/prisma";
import { CreateServiceRequest, toServiceResponse } from "../dto";

const router = Router();

// POST /services
router.post("/", async (req, res, next) => {
  try {
    const { companyId, name, description, price } = (req.body ?? {}) as Partial<CreateServiceRequest>;

    if (typeof companyId !== "number" || !Number.isInteger(companyId)) {
      res.status(400).json({ error: "companyId must be an integer" });
      return;
    }
    if (typeof name !== "string" || !name.trim()) {
      res.status(400).json({ error: "name is required" });
      return;
    }
    if (typeof description !== "string" || !description.trim()) {
      res.status(400).json({ error: "description is required" });
      return;
    }
    if (typeof price !== "number" || !Number.isFinite(price) || price < 0) {
      res.status(400).json({ error: "price must be a non-negative number" });
      return;
    }

    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company) {
      res.status(404).json({ error: `Company ${companyId} not found` });
      return;
    }

    const service = await prisma.service.create({
      data: { companyId, name: name.trim(), description: description.trim(), price },
    });

    res.status(201).json(toServiceResponse(service));
  } catch (err) {
    next(err);
  }
});

// GET /services/:id
router.get("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      res.status(400).json({ error: "id must be an integer" });
      return;
    }

    const service = await prisma.service.findUnique({ where: { id } });
    if (!service) {
      res.status(404).json({ error: `Service ${id} not found` });
      return;
    }

    res.status(200).json(toServiceResponse(service));
  } catch (err) {
    next(err);
  }
});

export default router;
