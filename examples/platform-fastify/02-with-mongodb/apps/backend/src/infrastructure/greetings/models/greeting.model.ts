/**
 * Mongoose Model for Greeting Entity
 */

import mongoose, { type Document } from "mongoose";
import type { Greeting } from "../../../domain/models/greeting";
import { greetingSchema } from "../repositories/greeting/schema";

export interface GreetingDocument extends Document, Greeting {
  _id: mongoose.Types.ObjectId;
}

export const GreetingModel = mongoose.model<GreetingDocument>(
  "Greeting",
  greetingSchema as any,
);
