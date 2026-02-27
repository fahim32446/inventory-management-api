import configureOpenAPI from './config/configure-open-api';
import createApp from './config/create-app';
import { seedRBAC } from './db/seed-rbac';
import { v1Routes } from './routes';

const app = createApp();

configureOpenAPI(app);

app.route('/api/v1', v1Routes);

app.get('/api/rbac/seed', async (c) => {
  await seedRBAC();
  return c.text('RBAC seeded successfully');
});

app.get('/', (c) => {
  return c.text('SERVER IS RUNNING APP.TS ');
});

export { app };
