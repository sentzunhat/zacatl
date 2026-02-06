import { injectable } from "tsyringe";
import type { Request, Response } from "express";
import { GreetingService } from "../../domain/services/greeting.service";

@injectable()
export class DeleteGreetingHandler {
  constructor(private readonly greetingService: GreetingService) {}

  async handle(req: Request, res: Response): Promise<void> {
    try {
      await this.greetingService.deleteGreeting(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(404).json({ error: (error as Error).message });
    }
  }
}
