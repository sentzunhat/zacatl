import { injectable } from "tsyringe";
import type { Request, Response } from "express";
import { GreetingServiceAdapter } from "../../domain/greetings/service/adapter";

@injectable()
export class DeleteGreetingHandler {
  constructor(private readonly greetingService: GreetingServiceAdapter) {}

  async handle(req: Request, res: Response): Promise<void> {
    try {
      const id =
        typeof req.params.id === "string" ? req.params.id : req.params.id[0];
      await this.greetingService.deleteGreeting(id);
      res.status(204).send();
    } catch (error) {
      res.status(404).json({ error: (error as Error).message });
    }
  }
}
