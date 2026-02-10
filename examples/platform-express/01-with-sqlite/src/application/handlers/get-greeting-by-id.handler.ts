import { injectable } from "tsyringe";
import type { Request, Response } from "express";
import { GreetingServiceAdapter } from "../../domain/greetings/service/adapter";

@injectable()
export class GetGreetingByIdHandler {
  constructor(private readonly greetingService: GreetingServiceAdapter) {}

  async handle(req: Request, res: Response): Promise<void> {
    const id =
      typeof req.params.id === "string" ? req.params.id : req.params.id[0];
    const greeting = await this.greetingService.getGreeting(id);
    if (!greeting) {
      res.status(404).json({ error: "Greeting not found" });
      return;
    }
    res.json(greeting);
  }
}
