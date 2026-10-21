import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";

export function validate(req: Request, res: Response, next: NextFunction): void {
  const result = validationResult(req);
  if (result.isEmpty()) {
    next();
    return;
  }

  const details = result.array().map((e) => String(e.msg));
  res.status(400).json({ error: "Validation failed", details });
}