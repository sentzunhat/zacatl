import { injectable } from "tsyringe";
import type { Request, Response } from "express";
import { GreetingService } from "../../domain/services/greeting.service";

@injectable()
export class GetAllGreetingsHandler {
  constructor(private readonly greetingService: GreetingService) {}

  async handle(req: Request, res: Response): Promise<void> {
    const language = req.query.language as string | undefined;
    const greetings = await this.greetingService.getAllGreetings(language);
    res.json(greetings);
  }
}
