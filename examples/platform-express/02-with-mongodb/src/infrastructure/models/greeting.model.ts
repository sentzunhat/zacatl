/**
 * Mongoose Model for Greeting Entity
 */

import mongoose, { Schema, type Document } from "mongoose";
import type { Greeting } from "../../domain/models/greeting";

export interface GreetingDocument extends Omit<Greeting, "id">, Document {
  _id: mongoose.Types.ObjectId;
}

const greetingSchema = new Schema<GreetingDocument>(
  {
    message: {
      type: String,
      required: true,
      trim: true,
    },
    language: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

export const GreetingModel = mongoose.model<GreetingDocument>(
  "Greeting",
  greetingSchema,
);
