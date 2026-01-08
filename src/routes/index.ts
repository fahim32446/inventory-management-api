import { createRouter } from '@/config/create-app';
import { publicRoutes } from './public.routes';
import { privateRoutes } from './private.routes';

export const v1Routes = createRouter();

v1Routes.route('/public', publicRoutes);
v1Routes.route('/', privateRoutes);
