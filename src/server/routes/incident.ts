import { Router } from 'express';
import type { Incident } from '../types/incident.ts';
import { routerWrapper } from '../wrappers/routerWrapper.js';
import { getIncidents, insertIncident, resolveDismissIncident } from '../controllers/dbController.js';

const router = Router();

router.get('/', async (_req, res) => {
  await routerWrapper(async () => {
    const dismissed = _req.query.dismissed as string;
    const resolved = _req.query.resolved as string;
    const orderBy = ['created_at', 'severity', 'location'].includes(_req.query.order as string) ? _req.query.order as string : 'created_at';
    return await getIncidents(dismissed, resolved, orderBy);
  }, res);
});

router.post('/create', async (req, res) => {
  await routerWrapper(async () => {
    const payload = req.body as Partial<Incident>;

    return await insertIncident(payload);
  }, res);
});

router.patch('/resolve/:id', async (req, res) => {
  await routerWrapper(async () => {
    const { id } = req.params;

    return await resolveDismissIncident(id, 'resolve');
  }, res);
});

router.patch('/dismiss/:id', async (req, res) => {
  await routerWrapper(async () => {
    const { id } = req.params;

    return await resolveDismissIncident(id, 'dismiss');
  }, res);
});

export default router;
