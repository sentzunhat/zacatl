import { injectable } from "tsyringe";
import type { Request, Response } from "express";
import { GreetingService } from "../../domain/services/greeting.service";

@injectable()
export class GetRandomGreetingHandler {
  constructor(private readonly greetingService: GreetingService) {}

  async handle(req: Request, res: Response): Promise<void> {
    const language = req.query.language as string;
    if (!language) {
      res.status(400).json({ error: "Language parameter is required" });
      return;
    }
    const greeting = await this.greetingService.getRandomGreeting(language);
    if (!greeting) {
      res.status(404).json({ error: "No greetings found for this language" });
      return;
    }
    res.json(greeting);
  }
}
