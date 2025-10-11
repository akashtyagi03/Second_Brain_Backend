import "express";

declare global {
  namespace Express {
    export interface Request {
      userId?: string; // add your custom property
    }
  }
}
