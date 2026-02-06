/**
 * Mongoose Model for Greeting Entity
 */

import mongoose, { Schema, type Document } from "mongoose";
import type { Greeting } from "../../domain/models/greeting";

export interface GreetingDocument extends Document {
  _id: mongoose.Types.ObjectId;
  text: string;
  language: string;
  createdAt: Date;
  updatedAt: Date;
}

const greetingSchema = new Schema<GreetingDocument>(
  {
    text: {
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
