import { Scalar } from '@scalar/hono-api-reference';
import packageJSON from '../../package.json';
import type { AppOpenAPI } from './types';
import { bearerAuthScheme } from './security';

export default function configureOpenAPI(app: AppOpenAPI) {
  // Generate the OpenAPI 3.0.0 specification
  app.doc('/doc', {
    openapi: '3.0.0',
    info: {
      version: packageJSON.version,
      title: 'Inventory Management API',
      description:
        "Official API documentation for the Inventory Management System. Features comprehensive endpoints for handling inventory tracking, order management, user administration, and role-based access control (RBAC). Enable authorization by providing your JWT token in the 'Authorize' section.",
      contact: {
        name: 'Developer Support',
        email: 'azmir.ahx@gmail.com',
        url: 'https://inventory-management-client-tau.vercel.app',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
      // termsOfService: 'https://inventoryapp.example.com/terms',
    },
    servers: [
      {
        url: 'http://localhost:5050',
        description: 'Local Development Environment',
      },
      {
        url: 'https://hapiq7gib5wcs36wugqkrjzreu0nbxos.lambda-url.ap-southeast-1.on.aws',
        description: 'Production Environment',
      },
    ],
    security: [{ bearerAuth: [] }],
  });

  // Register the global security scheme
  app.openAPIRegistry.registerComponent('securitySchemes', 'bearerAuth', bearerAuthScheme);

  // Register the Scalar API reference interface
  app.get(
    '/reference',
    Scalar({
      url: '/doc',
      pageTitle: 'Inventory Management API Reference',
      theme: 'kepler',
      layout: 'modern',
      defaultHttpClient: {
        targetKey: 'js',
        clientKey: 'fetch',
      },
      authentication: {
        preferredSecurityScheme: 'bearerAuth',
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      customCss: `
        /* Custom professional branding */
        :root {
          --scalar-color-accent: #4f46e5;
          --scalar-background-1: #0f172a;
          --scalar-background-2: #1e293b;
          --scalar-background-3: #334155;
          --scalar-color-1: #f8fafc;
          --scalar-color-2: #cbd5e1;
          --scalar-color-3: #94a3b8;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }
        .scalar-app {
          background-color: var(--scalar-background-1);
        }
        .scalar-sidebar {
          border-right: 1px solid rgba(255,255,255,0.1) !important;
        }
      `,
    }),
  );
}
