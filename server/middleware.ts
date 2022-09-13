import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

// Middleware for checking authentication
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  next();
};

// Middleware for data validation
export const dataValidationErrorManagement = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  next();
};
