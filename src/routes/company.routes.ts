import { Router } from "express";
import { prisma } from "../lib/prisma";
import { CreateCompanyRequest, toCompanyResponse } from "../dto";

const router = Router();

// POST /companies
router.post("/", async (req, res, next) => {
  try {
    const { name, registrationNumber } = (req.body ?? {}) as Partial<CreateCompanyRequest>;

    if (
      typeof name !== "string" || !name.trim() ||
      typeof registrationNumber !== "string" || !registrationNumber.trim()
    ) {
      res.status(400).json({ error: "name and registrationNumber are required non-empty strings" });
      return;
    }

    const company = await prisma.company.create({
      data: { name: name.trim(), registrationNumber: registrationNumber.trim() },
      include: { services: true },
    });

    res.status(201).json(toCompanyResponse(company));
  } catch (err) {
    next(err);
  }
});

// GET /companies
router.get("/", async (_req, res, next) => {
  try {
    const companies = await prisma.company.findMany({
      include: { services: true },
      orderBy: { id: "asc" },
    });

    res.status(200).json(companies.map(toCompanyResponse));
  } catch (err) {
    next(err);
  }
});

export default router;
