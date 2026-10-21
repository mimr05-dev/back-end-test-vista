import { NextFunction, Request, Response, Router } from "express";
import { body } from "express-validator";
import { prisma } from "../lib/prisma";
import { CreateCompanyRequest, toCompanyResponse } from "../dto";
import { validate } from "../middleware/validate";

const router = Router();

const createCompanyRules = [
  body("name")
    .isString().withMessage("name must be a string").bail()
    .trim().notEmpty().withMessage("name is required").bail()
    .isLength({ max: 191 }).withMessage("name must be at most 191 characters"),
  body("registrationNumber")
    .isString().withMessage("registrationNumber must be a string").bail()
    .trim().notEmpty().withMessage("registrationNumber is required").bail()
    .isLength({ max: 191 }).withMessage("registrationNumber must be at most 191 characters"),
];

// POST /companies
router.post("/", createCompanyRules, validate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, registrationNumber } = req.body as CreateCompanyRequest;

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