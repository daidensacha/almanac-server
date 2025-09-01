// controllers/event.js
const Event = require('../models/event');
const { ok, fail } = require('../utils/http');
const { archiveDoc } = require('../utils/archiveHelper');
const logger = require('../utils/logger');

// --- List ---
// controllers/event.js
exports.listEvents = async (req, res) => {
  const log = logger;
  try {
    // Build query; only filter by created_by if we actually have a user
    const { archived } = req.query;
    const q = {};
    if (req.user?._id) q.created_by = req.user._id;
    if (archived !== undefined) q.archived = archived === 'true';

    const docs = await Event.find(q)
      .populate('category', 'category_name')
      .populate('plant', 'common_name')
      .sort({ occurs_at: 1 })
      .lean();

    log.info(
      { count: docs.length, user: req.user?._id || null },
      'event:list ok',
    );
    return ok(res, { events: docs }); // <-- return docs, not "data"
  } catch (err) {
    log.error({ err, msg: err.message }, 'event:list fail');
    return fail(res, 500, 'fetch_failed');
  }
};

// --- Get One ---
// GET /api/event/:id
exports.getEvent = async (req, res) => {
  try {
    if (!req.user?._id) return fail(res, 401, 'unauthorized');

    const doc = await Event.findOne({
      _id: req.params.id,
      created_by: req.user._id,
    })
      .populate('category', 'category_name')
      .populate('plant')
      .lean();

    if (!doc) return fail(res, 404, 'not_found');
    return ok(res, doc);
  } catch (err) {
    return fail(res, 500, 'fetch_failed');
  }
};

// --- Create ---
// --- Create ---
exports.createEvent = async (req, res) => {
  try {
    const payload = {
      event_name: (req.body.event_name || '').trim(),
      description: (req.body.description || '').trim() || undefined,
      occurs_at: req.body.occurs_at || null,
      occurs_to: req.body.occurs_to || null,
      repeat_cycle: req.body.repeat_cycle || '',
      repeat_frequency:
        typeof req.body.repeat_frequency === 'number'
          ? req.body.repeat_frequency
          : parseInt(req.body.repeat_frequency, 10) || 0,
      repeat_yearly: !!req.body.repeat_yearly, // ✅ add this
      notes: req.body.notes || '',
      category: req.body.category_id || null,
      plant: req.body.plant_id || null,
      created_by: req.user._id,
    };
    const doc = await Event.create(payload);
    return ok(res, doc);
  } catch (err) {
    console.error('event:create error', err);
    return fail(res, 500, 'create_failed');
  }
};

// --- Update ---
exports.updateEvent = async (req, res) => {
  try {
    const updates = {
      event_name: req.body.event_name?.trim(),
      description: req.body.description?.trim(),
      occurs_at: req.body.occurs_at || null,
      occurs_to: req.body.occurs_to || null,
      repeat_cycle: req.body.repeat_cycle || '',
      repeat_frequency:
        typeof req.body.repeat_frequency === 'number'
          ? req.body.repeat_frequency
          : parseInt(req.body.repeat_frequency, 10) || 0,
      repeat_yearly: !!req.body.repeat_yearly, // ✅ add this
      notes: req.body.notes || '',
      category: req.body.category_id || null,
      plant: req.body.plant_id || null,
    };

    const doc = await Event.findOneAndUpdate(
      { _id: req.params.id, created_by: req.user._id },
      { $set: updates },
      { new: true },
    ).lean();

    if (!doc) return fail(res, 404, 'not_found');
    return ok(res, doc);
  } catch (err) {
    console.error('event:update error', err);
    return fail(res, 500, 'update_failed');
  }
};

// --- Archive ---
exports.archiveEvent = async (req, res) => {
  try {
    const updated = await archiveDoc({
      Model: Event,
      id: req.params.id,
      userId: req.user._id,
      archivedFlag: req.body?.archived ?? true,
      nameField: 'event_name',
    });
    if (!updated) return fail(res, 404, 'not_found');
    return ok(res, updated);
  } catch (err) {
    console.error('event:archive error', err);
    return fail(res, 500, 'archive_failed');
  }
};

// --- Delete ---
exports.deleteEvent = async (req, res) => {
  try {
    const out = await Event.deleteOne({
      _id: req.params.id,
      created_by: req.user._id,
    });
    if (out.deletedCount === 0) return fail(res, 404, 'not_found');
    return ok(res, { deleted: true });
  } catch (err) {
    console.error('event:delete error', err);
    return fail(res, 500, 'delete_failed');
  }
};
