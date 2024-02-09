// src/webhook/webhook.controller.ts
import { Controller, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { execSync } from 'child_process';
import * as crypto from 'crypto';

const SECRET_MAP: Record<string, string> = {
  prueba: 'losbar191184',
};

const RUTA_PROYECTO: Record<string, string> = {
  prueba: '../webhook-prueba',
};

@Controller('webhook')
export class WebhookController {
  @Post(':project')
  handleWebhook(@Req() req: Request, @Res() res: Response): void {
    const project = req.params.project;
    const secret = SECRET_MAP[project];
    const rutaProyecto = RUTA_PROYECTO[project];

    if (
      !secret ||
      !this.verificarFirma(req.body, req.headers['x-hub-signature'], secret)
    ) {
      res.status(403).send('Firma no válida');
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const payload = req.body;

    this.ejecutarComandosLocales(project, rutaProyecto);

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
  private ejecutarComandosLocales(project: string, ruta: string): void {
    try {
      // Cambia al directorio del proyecto
      process.chdir(ruta);
      // Ejecuta git pull
      execSync('git pull', { stdio: 'inherit' });

      // Ejecuta npm ci
      // execSync('npm ci', { stdio: 'inherit' });

      // Ejecuta npm run server
      // execSync('npm run server', { stdio: 'inherit' });
    } catch (error) {
      console.error('Error al ejecutar comandos locales:', error.message);
    } finally {
      // Vuelve al directorio original
      process.chdir(__dirname);
    }
  }
}
