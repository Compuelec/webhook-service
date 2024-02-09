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

    if (!secret || !this.verifySignature(req, secret)) {
      res.status(401).send('Unauthorized');
      return;
    }

    const payload = req.body;

    this.executeLocalCommands(project, rutaProyecto);

    res.status(200).send('Webhook received successfully');
  }

  private verifySignature(req: Request, secret: string): boolean {
    const signature = req.headers.get('x-hub-signature-256');

    if (!signature) {
      return false;
    }

    const hmac = crypto.createHmac('sha256', secret);
    const digest = `sha256=${hmac.update(JSON.stringify(req.body)).digest('hex')}`;

    console.log('Calculated Signature:', digest);
    console.log('Received Signature:', signature);

    // Perform a simple string comparison
    return digest === signature;
  }

  private executeLocalCommands(project: string, ruta: string): void {
    try {
      // Change to the project directory
      process.chdir(ruta);
      // Execute git pull
      execSync('git pull', { stdio: 'inherit' });

      // Execute npm ci
      // execSync('npm ci', { stdio: 'inherit' });

      // Execute npm run server
      // execSync('npm run server', { stdio: 'inherit' });
    } catch (error) {
      console.error('Error executing local commands:', error.message);
    } finally {
      // Return to the original directory
      process.chdir(__dirname);
    }
  }
}
