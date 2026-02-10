import { BaseRepository, ORMType } from "@sentzunhat/zacatl";
import type { MongooseModel } from "@sentzunhat/zacatl/third-party/mongoose";
import { singleton } from "tsyringe";

import type {
  CreateGreetingInput,
  Greeting,
} from "../../../../domain/models/greeting";
import type { GreetingRepositoryPort } from "./port";
import { greetingSchema } from "./schema";

@singleton()
export class GreetingRepositoryAdapter
  extends BaseRepository<Greeting, CreateGreetingInput, Greeting>
  implements GreetingRepositoryPort
{
  constructor() {
    super({
      type: ORMType.Mongoose,
      name: "greeting",
      schema: greetingSchema,
    });
  }

  async findAll(): Promise<Greeting[]> {
    const docs = await (this.model as MongooseModel<Greeting>)
      .find()
      .sort({ createdAt: -1 })
      .lean<Greeting[]>()
      .exec();

    return docs
      .map((doc) => this.toLean(doc))
      .filter((item): item is Greeting => item !== null);
  }

  async findByLanguage(language: string): Promise<Greeting[]> {
    const docs = await (this.model as MongooseModel<Greeting>)
      .find({ language })
      .sort({ createdAt: -1 })
      .lean<Greeting[]>()
      .exec();

    return docs
      .map((doc) => this.toLean(doc))
      .filter((item): item is Greeting => item !== null);
  }

  async delete(id: string): Promise<Greeting | null> {
    return super.delete(id);
  }
}
