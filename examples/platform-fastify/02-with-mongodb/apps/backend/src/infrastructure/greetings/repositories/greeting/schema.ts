import { Schema } from "mongoose";

import type { Greeting } from "../../../../domain/models/greeting";

const greetingSchemaFactory = (): Schema<Greeting> => {
  const schema = new Schema<Greeting>(
    {
      message: {
        type: Schema.Types.String,
        required: true,
        trim: true,
      },
      language: {
        type: Schema.Types.String,
        required: true,
        lowercase: true,
        trim: true,
      },
    },
    {
      _id: true,
      id: true,
      timestamps: true,
    },
  );

  schema.index({
    language: 1,
  });

  return schema;
};

export const greetingSchema = greetingSchemaFactory();
