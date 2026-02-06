import { injectable } from "tsyringe";
import type { Request, Response } from "express";
import { GreetingService } from "../../domain/services/greeting.service";

@injectable()
export class GetGreetingByIdHandler {
  constructor(private readonly greetingService: GreetingService) {}

  async handle(req: Request, res: Response): Promise<void> {
    const greeting = await this.greetingService.getGreeting(req.params.id);
    if (!greeting) {
      res.status(404).json({ error: "Greeting not found" });
      return;
    }
    res.json(greeting);
  }
}
