import db from "../db/knex.js";
import { Incident } from "../types/incident.js";

export const getIncidents = async (dismissed: string | undefined, resolved: string | undefined, orderBy: string) => {
    let query = db<Incident>('incidents').select('*').orderBy(orderBy, 'desc');

    Object.entries({ dismissed, resolved }).forEach(([key, value]) => {
        if (value === 'true') {
            query = query.where(key, true);
        } else if (value === 'false') {
            query = query.where(key, false);
        }
    });


    return await query;
}

export const insertIncident = async (payload: any) => {
    if (!payload.location) {
        throw new Error('location is required');
    }

    const [inserted] = await db<Incident>('incidents').insert({
        description: payload.description,
        location: payload.location,
        severity: payload.severity ?? 1,
    });

    return await db<Incident>('incidents').where('id', inserted).first();
}

export const resolveDismissIncident = async (id: string, type: 'resolve' | 'dismiss') => {
    const updateData = type === 'resolve' ? { resolved: true } : { dismissed: true };
    const updated = await db<Incident>('incidents').where('id', id).update(updateData);
    if (!updated) {
        throw new Error(`Incident with id ${id} not found`);
    }
    return { message: `Incident ${id} marked as ${type === 'resolve' ? 'resolved' : 'dismissed'}` };
}