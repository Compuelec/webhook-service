// src/webhook/webhook.controller.ts
import { Controller, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import crypto from 'crypto';

const SECRET_MAP: Record<string, string> = {
  prueba: 'clave_secreta_1',
  project2: 'clave_secreta_2',
};

@Controller('webhook')
export class WebhookController {
  @Post(':project')
  handleWebhook(@Req() req: Request, @Res() res: Response): void {
    const project = req.params.project;
    const secret = SECRET_MAP[project];

    if (
      !secret ||
      !this.verificarFirma(req.body, req.headers['x-hub-signature'], secret)
    ) {
      res.status(403).send('Firma no válida');
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const payload = req.body;

    this.ejecutarComandosLocales(project);

    res.status(200).send('Webhook recibido correctamente');
  }

  private verificarFirma(
    data: any,
    signature: string | string[] | undefined,
    secret: string,
  ): boolean {
    if (!signature) {
      return false;
    }

    // Verifica si la firma es un array de strings y toma el primer elemento
    const signatureString = Array.isArray(signature) ? signature[0] : signature;

    const secretBytes = Buffer.from(secret, 'utf-8');
    const hmac = crypto.createHmac('sha1', secretBytes);
    const digest = 'sha1=' + hmac.update(JSON.stringify(data)).digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(digest),
      Buffer.from(signatureString),
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private ejecutarComandosLocales(project: string): void {
    // Implementa la lógica para ejecutar comandos locales en el proyecto
    // Puedes utilizar execSync o cualquier otra forma de ejecución de comandos que prefieras
    // ...
  }
}
