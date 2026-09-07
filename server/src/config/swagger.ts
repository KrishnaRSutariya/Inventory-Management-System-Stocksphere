import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';

export const setupSwagger = (app: Express): void => {
  try {
    const swaggerDocument = YAML.load(path.resolve(__dirname, '../docs/swagger.yaml'));
    app.use(
      '/api-docs',
      swaggerUi.serve,
      swaggerUi.setup(swaggerDocument, {
        customSiteTitle: 'Inventory Management API Documentation',
        customCss: '.swagger-ui .topbar { background-color: #0f172a; }'
      })
    );
    console.log('[Swagger] Interactive API Documentation available at /api-docs');
  } catch (error: any) {
    console.warn(`[Swagger Warning] Could not initialize Swagger documentation: ${error.message}`);
  }
};
