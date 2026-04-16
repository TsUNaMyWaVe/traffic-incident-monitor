import { Router } from 'express';
import db from '../db/knex.js';
import type { Incident } from '../types/incident.ts';
import { routerWrapper } from '../wrappers/routerWrapper.js';

const router = Router();

router.get('/', async (_req, res) => {
  await routerWrapper(async () => {
    const dismissed = _req.query.dismissed as string;
    const resolved = _req.query.resolved as string;
    const orderBy = ['created_at', 'severity', 'location'].includes(_req.query.order as string) ? _req.query.order as string : 'created_at';
    let query = db<Incident>('incidents').select('*').orderBy(orderBy, 'desc');

    Object.entries({ dismissed, resolved }).forEach(([key, value]) => {
      if (value === 'true') {
        query = query.where(key, true);
      } else if (value === 'false') {
        query = query.where(key, false);
      }
    });


    return await query;
  }, res);
});

router.post('/create', async (req, res) => {
  await routerWrapper(async () => {
    const payload = req.body as Partial<Incident>;

  if (!payload.location) {
    return res.status(400).json({ message: 'location is required' });
  }

  const [inserted] = await db<Incident>('incidents').insert({
    description: payload.description,
    location: payload.location,
    severity: payload.severity ?? 1,
  });

  return await db<Incident>('incidents').where('id', inserted).first();
  }, res);
});

router.patch('/resolve/:id', async (req, res) => {
  await routerWrapper(async () => {
    const { id } = req.params;

    const updated = await db<Incident>('incidents').where('id', id).update({ resolved: true });
    if (!updated) {
      throw new Error(`Incident with id ${id} not found`);
    }
    return { message: `Incident ${id} marked as resolved` };
  }, res);
});

router.patch('/dismiss/:id', async (req, res) => {
  await routerWrapper(async () => {
    const { id } = req.params;

    const updated = await db<Incident>('incidents').where('id', id).update({ dismissed: true });
    if (!updated) {
      throw new Error(`Incident with id ${id} not found`);
    }
    return { message: `Incident ${id} marked as dismissed` };
  }, res);
});

export default router;
