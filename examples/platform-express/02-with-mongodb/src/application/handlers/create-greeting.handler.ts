import { injectable } from "tsyringe";
import type { Request, Response } from "express";
import { GreetingService } from "../../domain/services/greeting.service";

@injectable()
export class CreateGreetingHandler {
  constructor(private readonly greetingService: GreetingService) {}

  async handle(req: Request, res: Response): Promise<void> {
    try {
      const greeting = await this.greetingService.createGreeting(req.body);
      res.status(201).json(greeting);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }
}
