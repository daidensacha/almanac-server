// src/controllers/plantController.js
const Plant = require('../models/plant');
const loggerRoot = require('../utils/logger');
const { archiveDoc } = require('../utils/archiveHelper');
const { ok, fail } = require('../utils/http');

// ───────────────────────────────────────────────
// helpers
// ───────────────────────────────────────────────
const logFromReq = req => req.log || loggerRoot;

const normName = (s = '') =>
  s
    .toString()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());

const toDateOrNull = v => {
  if (!v) return null;
  const d = v instanceof Date ? v : new Date(v);
  return isNaN(d.getTime()) ? null : d;
};

// Only allow expected fields through
// const pickBody = (body = {}) => {
//   const common_name = body.common_name ?? '';
//   return {
//     common_name: normName(common_name),
//     botanical_name: (body.botanical_name || '').toString().trim() || undefined,
//     sow_at: toDateOrNull(body.sow_at),
//     plant_at: toDateOrNull(body.plant_at),
//     harvest_at: toDateOrNull(body.harvest_at),
//     harvest_to: toDateOrNull(body.harvest_to),
//     spacing: (body.spacing || '').toString().trim() || undefined,
//     depth: (body.depth || '').toString().trim() || undefined,
//     fertilise: (body.fertilise || '').toString().trim() || undefined,
//     fertiliser_type:
//       (body.fertiliser_type || '').toString().trim() || undefined,
//     notes: (body.notes || '').toString().trim() || undefined,
//     // archived is handled explicitly where needed
//   };
// };

// controllers/plant.js (or wherever pickBody lives)
// const toDateOrNull = (v) => (v ? new Date(v) : null);

function pickBody(b = {}) {
  return {
    // text fields – keep "" if sent
    common_name: b.common_name ?? '',
    botanical_name: b.botanical_name ?? '',
    fertilise: b.fertilise ?? '',
    fertiliser_type: b.fertiliser_type ?? '',
    spacing: b.spacing ?? '',
    depth: b.depth ?? '',
    notes: b.notes ?? '',

    // dates – null when missing
    sow_at: toDateOrNull(b.sow_at),
    plant_at: toDateOrNull(b.plant_at),
    harvest_at: toDateOrNull(b.harvest_at),
    harvest_to: toDateOrNull(b.harvest_to),
  };
}

// ───────────────────────────────────────────────
// CREATE  (POST /plant/create)
// ───────────────────────────────────────────────
exports.createPlant = async (req, res) => {
  const log = logFromReq(req);
  try {
    if (!req.user?._id) return res.status(401).json({ error: 'Unauthorized' });

    const payload = pickBody(req.body);
    if (!payload.common_name) {
      return res.status(400).json({ error: 'Common name is required' });
    }

    const doc = await Plant.create({
      ...payload,
      archived: !!req.body.archived, // optional, default false in model
      created_by: req.user._id,
    });

    log.info({ id: doc._id, common_name: doc.common_name }, 'plant:create ok');
    return res.json({ ok: true, plant: doc, newPlant: doc });
  } catch (err) {
    log.error({ msg: err.message }, 'plant:create fail');
    return res.status(500).json({ error: 'Create failed' });
  }
};

// ───────────────────────────────────────────────
// LIST (mine)  (GET /plants?archived=true|false)
// ───────────────────────────────────────────────
exports.listPlants = async (req, res) => {
  const log = req.log || loggerRoot;
  try {
    log.info({ user: req.user }, 'plants:list request user');

    if (!req.user?._id) {
      // For debug: return all plants instead of 401
      const items = await Plant.find().sort({ botanical_name: 1 }).lean();
      return res.json({ ok: true, plants: items, allPlants: items });
    }

    const q = { created_by: req.user._id };
    if (req.query.archived !== undefined)
      q.archived = req.query.archived === 'true';

    const items = await Plant.find(q).sort({ botanical_name: 1 }).lean();
    log.info({ count: items.length }, 'plants:list ok');
    return res.json({ ok: true, plants: items, allPlants: items });
  } catch (err) {
    log.error({ msg: err.message }, 'plants:list fail');
    return res.status(500).json({ error: 'Fetch failed' });
  }
};

// ───────────────────────────────────────────────
// GET ONE  (GET /plant/:id)
// ───────────────────────────────────────────────
exports.getPlant = async (req, res) => {
  const log = logFromReq(req);
  try {
    if (!req.user?._id) return res.status(401).json({ error: 'Unauthorized' });

    const item = await Plant.findOne({
      _id: req.params.id,
      created_by: req.user._id,
    }).lean();

    if (!item) {
      log.warn({ id: req.params.id }, 'plant:get not found');
      return res.status(404).json({ error: 'Not found' });
    }

    log.info({ id: item._id }, 'plant:get ok');
    return res.json({ ok: true, plant: item });
  } catch (err) {
    log.error({ msg: err.message }, 'plant:get fail');
    return res.status(500).json({ error: 'Fetch failed' });
  }
};

// ───────────────────────────────────────────────
// UPDATE  (PUT /plant/update/:id)
// ───────────────────────────────────────────────

exports.updatePlant = async (req, res) => {
  const log = logFromReq(req);
  try {
    if (!req.user?._id) return res.status(401).json({ error: 'Unauthorized' });

    const updates = pickBody(req.body);

    // allow archived toggle only if explicitly provided
    if (typeof req.body.archived === 'boolean') {
      updates.archived = req.body.archived;
    }
    delete updates.created_by; // never allow

    const doc = await Plant.findOneAndUpdate(
      { _id: req.params.id, created_by: req.user._id },
      { $set: updates },
      { new: true },
    ).lean();

    if (!doc) {
      log.warn({ id: req.params.id }, 'plant:update not found');
      return res.status(404).json({ error: 'Not found' });
    }

    log.info({ id: doc._id }, 'plant:update ok');
    return res.json({ ok: true, plant: doc, updatedPlant: doc });
  } catch (err) {
    log.error({ msg: err.message }, 'plant:update fail');
    return res.status(500).json({ error: 'Update failed' });
  }
};

// exports.updatePlant = async (req, res) => {
//   const log = logFromReq(req);
//   try {
//     if (!req.user?._id) return res.status(401).json({ error: 'Unauthorized' });

//     const picked = pickBody(req.body);
//     const update = { ...picked };

//     // archived can be toggled here if explicitly provided
//     if (typeof req.body.archived === 'boolean') {
//       update.archived = req.body.archived;
//     }

//     // never allow created_by change
//     delete update.created_by;

//     const doc = await Plant.findOneAndUpdate(
//       { _id: req.params.id, created_by: req.user._id },
//       { $set: update },
//       { new: true },
//     ).lean();

//     if (!doc) {
//       log.warn({ id: req.params.id }, 'plant:update not found');
//       return res.status(404).json({ error: 'Not found' });
//     }

//     log.info({ id: doc._id }, 'plant:update ok');
//     return res.json({ ok: true, plant: doc, updatedPlant: doc });
//   } catch (err) {
//     log.error({ msg: err.message }, 'plant:update fail');
//     return res.status(500).json({ error: 'Update failed' });
//   }
// };

// ───────────────────────────────────────────────
// ARCHIVE/UNARCHIVE  (PATCH /plant/archive/:id)
// body: { archived: true|false }
// ───────────────────────────────────────────────

exports.archivePlant = async (req, res) => {
  try {
    const updated = await archiveDoc({
      Model: Plant,
      id: req.params.id,
      userId: req.user._id,
      archivedFlag: req.body?.archived ?? true,
      nameField: 'common_name', // 👈 important, plants use common_name
    });

    if (!updated) return fail(res, 404, 'not_found');
    return ok(res, updated);
  } catch (e) {
    console.error('plant:archive error:', e);
    return fail(res, 500, 'archive_failed');
  }
};

// ───────────────────────────────────────────────
// DELETE  (DELETE /plant/delete/:id)
// ───────────────────────────────────────────────
exports.deletePlant = async (req, res) => {
  const log = logFromReq(req);
  try {
    if (!req.user?._id) return res.status(401).json({ error: 'Unauthorized' });

    const out = await Plant.deleteOne({
      _id: req.params.id,
      created_by: req.user._id,
    });

    if (out.deletedCount === 0) {
      log.warn({ id: req.params.id }, 'plant:delete not found');
      return res.status(404).json({ error: 'Not found' });
    }

    log.info({ id: req.params.id }, 'plant:delete ok');
    return res.json({ ok: true });
  } catch (err) {
    log.error({ msg: err.message }, 'plant:delete fail');
    return res.status(500).json({ error: 'Delete failed' });
  }
};
