import { NextFunction, Request, Response, Router } from "express";
import { body, param } from "express-validator";
import { prisma } from "../lib/prisma";
import { CreateServiceRequest, toServiceResponse } from "../dto";
import { validate } from "../middleware/validate";

const router = Router();

const createServiceRules = [
  body("companyId")
    .isInt({ min: 1 }).withMessage("companyId must be a positive integer"),
  body("name")
    .isString().withMessage("name must be a string").bail()
    .trim().notEmpty().withMessage("name is required").bail()
    .isLength({ max: 191 }).withMessage("name must be at most 191 characters"),
  body("description")
    .isString().withMessage("description must be a string").bail()
    .trim().notEmpty().withMessage("description is required"),
  body("price")
    .isFloat({ min: 0, max: 99999999.99 })
    .withMessage("price must be a number between 0 and 99999999.99"),
];

const idRules = [
  param("id").isInt({ min: 1 }).withMessage("id must be a positive integer"),
];

// POST /services
router.post("/", createServiceRules, validate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description } = req.body as CreateServiceRequest;
    const companyId = Number(req.body.companyId);
    const price = Number(req.body.price);

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
router.get("/:id", idRules, validate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);

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