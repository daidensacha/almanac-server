// controllers/category.js
const Category = require('../models/category');
const { ok, fail } = require('../utils/http');
const loggerRoot = require('../utils/logger');
const log = loggerRoot.child({ ctrl: 'category' });
const { archiveDoc } = require('../utils/archiveHelper');

// Small helpers
const norm = (s = '') => s.toString().trim().replace(/\s+/g, ' ');

const pickCreate = (body = {}) => ({
  category_name: norm(body.category_name || ''),
  description: norm(body.description || ''),
});

const pickUpdate = (body = {}) => {
  const out = {};
  if (body.category_name !== undefined)
    out.category_name = norm(body.category_name);
  if (body.description !== undefined) out.description = norm(body.description);
  return out;
};

// ───────────────────────────────────────────────
// GET ALL (GET /categories)
// ───────────────────────────────────────────────

exports.listCategories = async (req, res) => {
  try {
    const uid = req.user?._id || req.auth?._id; // tolerate either shape
    if (!uid) return res.status(401).json({ error: 'Unauthorized' });

    const archived = req.query.archived === 'true';
    const categories = await Category.find({ created_by: uid, archived })
      .sort({ category_name: 1 })
      .lean();
    console.info('category:list ok', { count: categories.length });
    return res.json({ ok: true, categories });
  } catch (e) {
    console.error('category:list error', e);
    return res.status(500).json({ error: 'Fetch failed' });
  }
};

// ───────────────────────────────────────────────
// GET ONE  (GET /category/:id)
// ───────────────────────────────────────────────
exports.getCategory = async (req, res) => {
  try {
    const doc = await Category.findOne({
      _id: req.params.id,
      created_by: req.user._id,
    }).lean();

    if (!doc) return fail(res, 404, 'not_found');
    log.info({ id: doc._id, user: req.user._id }, 'category:getOne ok');
    return ok(res, doc);
  } catch (e) {
    log.error(
      { err: e, id: req.params.id, user: req.user?._id },
      'category:getOne fail',
    );
    return fail(res, 500, 'fetch_failed');
  }
};

// ───────────────────────────────────────────────
// CREATE   (POST /category/create)
// ───────────────────────────────────────────────
// controllers/category.js (top of file)
// const escapeRegex = (s = '') => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

exports.createCategory = async (req, res) => {
  try {
    // Validate incoming shape
    const category_name = (req.body?.category_name || '').trim();
    if (!category_name) {
      return fail(res, 400, 'missing_category_name');
    }
    if (!req.user?._id) {
      return fail(res, 401, 'unauthorized');
    }
    // Optional: prevent duplicates per user (case-insensitive)
    const existing = await Category.findOne({
      created_by: req.user._id,
      archived: false,
      category_name: { $regex: new RegExp(`^${category_name}$`, 'i') },
    }).lean();

    if (existing) {
      return fail(res, 409, 'duplicate_category_name');
    }

    const payload = {
      category_name,
      description: (req.body.description || '').trim() || undefined,
      created_by: req.user._id,
    };

    const doc = await Category.create(payload);
    return ok(res, doc);
  } catch (e) {
    // Help yourself in dev
    console.error('category:create error:', e?.code, e?.message, e);
    return fail(res, 500, 'create_failed');
  }
};

// ───────────────────────────────────────────────
// UPDATE   (PUT /category/update/:id)
// ───────────────────────────────────────────────
exports.updateCategory = async (req, res) => {
  try {
    const $set = pickUpdate(req.body);
    // guard against empty string names
    if ($set.category_name !== undefined && !$set.category_name) {
      return fail(res, 400, 'category_name_required');
    }

    // Optional: uniqueness check (ignore self)
    if ($set.category_name) {
      const dupe = await Category.exists({
        _id: { $ne: req.params.id },
        created_by: req.user._id,
        category_name: $set.category_name,
        archived: { $ne: true },
      });
      if (dupe) return fail(res, 409, 'category_name_exists');
    }

    const doc = await Category.findOneAndUpdate(
      { _id: req.params.id, created_by: req.user._id },
      { $set },
      { new: true },
    ).lean();

    if (!doc) return fail(res, 404, 'not_found');
    log.info({ id: doc._id, user: req.user._id }, 'category:update ok');
    return ok(res, doc);
  } catch (e) {
    log.error(
      { err: e, id: req.params.id, user: req.user?._id },
      'category:update fail',
    );
    return fail(res, 500, 'update_failed');
  }
};

// ───────────────────────────────────────────────
// ARCHIVE  (PATCH /category/archive/:id)
// body: { archived: true|false } (default true)
// ───────────────────────────────────────────────

exports.archiveCategory = async (req, res) => {
  try {
    const updated = await archiveDoc({
      Model: Category,
      id: req.params.id,
      userId: req.user._id,
      archivedFlag: req.body?.archived ?? true,
      nameField: 'category_name',
    });
    if (!updated) return fail(res, 404, 'not_found');
    return ok(res, updated);
  } catch (e) {
    console.error('category:archive error:', e);
    return fail(res, 500, 'archive_failed');
  }
};
// exports.archiveCategory = async (req, res) => {
//   try {
//     const archived = req.body?.archived ?? true;
//     const doc = await Category.findOneAndUpdate(
//       { _id: req.params.id, created_by: req.user._id },
//       archived
//         ? {
//             $set: {
//               archived,
//               category_name: `${Date.now()}__${Math.random()
//                 .toString(36)
//                 .slice(2)}__${'ARCHIVED__'}`,
//             },
//           }
//         : { $set: { archived } },
//       { new: true },
//     ).lean();
//     if (!doc) return fail(res, 404, 'not_found');
//     return ok(res, doc);
//   } catch (e) {
//     return fail(res, 500, 'archive_failed');
//   }
// };
// exports.archiveCategory = async (req, res) => {
//   try {
//     const archived = req.body?.archived ?? true;

//     const doc = await Category.findOneAndUpdate(
//       { _id: req.params.id, created_by: req.user._id },
//       { $set: { archived: !!archived } },
//       { new: true },
//     ).lean();

//     if (!doc) return fail(res, 404, 'not_found');
//     log.info(
//       { id: doc._id, archived: !!archived, user: req.user._id },
//       'category:archive ok',
//     );
//     return ok(res, doc);
//   } catch (e) {
//     log.error(
//       { err: e, id: req.params.id, user: req.user?._id },
//       'category:archive fail',
//     );
//     return fail(res, 500, 'archive_failed');
//   }
// };

// ───────────────────────────────────────────────
// DELETE   (DELETE /category/delete/:id)
// NOTE: still a hard delete. If you prefer the
// archive-only model, you can forbid hard delete.
// ───────────────────────────────────────────────
exports.deleteCategory = async (req, res) => {
  try {
    const out = await Category.deleteOne({
      _id: req.params.id,
      created_by: req.user._id,
    });

    if (out.deletedCount === 0) return fail(res, 404, 'not_found');
    log.info({ id: req.params.id, user: req.user._id }, 'category:remove ok');
    return ok(res, { deleted: true });
  } catch (e) {
    log.error(
      { err: e, id: req.params.id, user: req.user?._id },
      'category:remove fail',
    );
    return fail(res, 500, 'delete_failed');
  }
};
// exports.getOne = async (req, res) => {
//   try {
//     const doc = await Category.findOne({
//       _id: req.params.id,
//       created_by: req.user._id,
//     }).lean();
//     if (!doc) return fail(res, 404, 'not_found');
//     return ok(res, doc);
//   } catch (e) {
//     return fail(res, 500, 'fetch_failed');
//   }
// };

// exports.create = async (req, res) => {
//   try {
//     const payload = {
//       category_name: (req.body.category_name || '').trim(),
//       description: (req.body.description || '').trim() || undefined,
//       created_by: req.user._id,
//     };
//     const doc = await Category.create(payload);
//     return ok(res, doc);
//   } catch (e) {
//     return fail(res, 500, 'create_failed');
//   }
// };

// exports.update = async (req, res) => {
//   try {
//     const updates = {
//       category_name: req.body.category_name?.trim(),
//       description: req.body.description?.trim(),
//     };
//     const doc = await Category.findOneAndUpdate(
//       { _id: req.params.id, created_by: req.user._id },
//       { $set: updates },
//       { new: true },
//     ).lean();
//     if (!doc) return fail(res, 404, 'not_found');
//     return ok(res, doc);
//   } catch (e) {
//     return fail(res, 500, 'update_failed');
//   }
// };

// exports.archive = async (req, res) => {
//   try {
//     const archived = req.body?.archived ?? true;
//     const doc = await Category.findOneAndUpdate(
//       { _id: req.params.id, created_by: req.user._id },
//       { $set: { archived } },
//       { new: true },
//     ).lean();
//     if (!doc) return fail(res, 404, 'not_found');
//     return ok(res, doc);
//   } catch (e) {
//     return fail(res, 500, 'archive_failed');
//   }
// };

// exports.remove = async (req, res) => {
//   try {
//     const out = await Category.deleteOne({
//       _id: req.params.id,
//       created_by: req.user._id,
//     });
//     if (out.deletedCount === 0) return fail(res, 404, 'not_found');
//     return ok(res, { deleted: true });
//   } catch (e) {
//     return fail(res, 500, 'delete_failed');
//   }
// };

// const Category = require('../models/category');
// const loggerRoot = require('../utils/logger');

// const normName = (s = '') =>
//   s
//     .toString()
//     .trim()
//     .replace(/\s+/g, ' ')
//     .replace(/\b\w/g, c => c.toUpperCase()); // Title Case-ish

// const pickBody = (body = {}) => {
//   // accept both new and legacy
//   const category_name = body.category_name ?? body.category ?? '';
//   return {
//     category_name: normName(category_name),
//     description: (body.description || '').toString().trim(),
//     archived: typeof body.archived === 'boolean' ? body.archived : undefined,
//   };
// };

// exports.createCategory = async (req, res) => {
//   const log = req.log || loggerRoot;
//   try {
//     const { category_name, description } = pickBody(req.body);
//     if (!category_name)
//       return res.status(400).json({ error: 'Category name is required' });

//     // prevent duplicates for this user (case-insensitive)
//     const exists = await Category.findOne({
//       created_by: req.user._id,
//       category_name,
//     }).collation({ locale: 'en', strength: 2 });

//     if (exists)
//       return res.status(409).json({ error: 'Category already exists' });

//     const doc = await Category.create({
//       category_name,
//       description,
//       created_by: req.user._id,
//     });

//     log.info({ id: doc._id, category_name }, 'category:create ok');
//     return res.json({ ok: true, category: doc });
//   } catch (err) {
//     log.error({ msg: err.message }, 'category:create fail');
//     return res.status(500).json({ error: 'Create failed' });
//   }
// };

// exports.listCategories = async (req, res) => {
//   const log = req.log || loggerRoot;
//   try {
//     const { archived } = req.query;
//     const q = { created_by: req.user._id };
//     if (archived !== undefined) q.archived = archived === 'true';

//     const items = await Category.find(q).sort({ category_name: 1 }).lean();
//     log.info({ count: items.length }, 'category:list ok');
//     // keep legacy response key too if you used allCategories before
//     return res.json({ ok: true, categories: items, allCategories: items });
//   } catch (err) {
//     log.error({ msg: err.message }, 'category:list fail');
//     return res.status(500).json({ error: 'Fetch failed' });
//   }
// };

// exports.getCategory = async (req, res) => {
//   const log = req.log || loggerRoot;
//   try {
//     const item = await Category.findOne({
//       _id: req.params.id,
//       created_by: req.user._id,
//     }).lean();

//     if (!item) return res.status(404).json({ error: 'Not found' });
//     return res.json({ ok: true, category: item });
//   } catch (err) {
//     log.error({ msg: err.message }, 'category:get fail');
//     return res.status(500).json({ error: 'Fetch failed' });
//   }
// };

// exports.updateCategory = async (req, res) => {
//   const log = req.log || loggerRoot;
//   try {
//     const { category_name, description, archived } = pickBody(req.body);
//     if (!category_name)
//       return res.status(400).json({ error: 'Category name is required' });

//     // duplicate guard (exclude self)
//     const dup = await Category.findOne({
//       _id: { $ne: req.params.id },
//       created_by: req.user._id,
//       category_name,
//     }).collation({ locale: 'en', strength: 2 });
//     if (dup) return res.status(409).json({ error: 'Category already exists' });

//     const update = { category_name, description };
//     if (typeof archived === 'boolean') update.archived = archived;

//     const doc = await Category.findOneAndUpdate(
//       { _id: req.params.id, created_by: req.user._id },
//       { $set: update },
//       { new: true },
//     ).lean();

//     if (!doc) return res.status(404).json({ error: 'Not found' });
//     log.info({ id: doc._id }, 'category:update ok');
//     return res.json({ ok: true, category: doc, updatedCategory: doc });
//   } catch (err) {
//     log.error({ msg: err.message }, 'category:update fail');
//     return res.status(500).json({ error: 'Update failed' });
//   }
// };

// exports.archiveCategory = async (req, res) => {
//   const log = req.log || loggerRoot;
//   try {
//     const archived = req.body?.archived ?? true;
//     const doc = await Category.findOneAndUpdate(
//       { _id: req.params.id, created_by: req.user._id },
//       { $set: { archived } },
//       { new: true },
//     ).lean();

//     if (!doc) return res.status(404).json({ error: 'Not found' });
//     log.info({ id: doc._id, archived }, 'category:archive ok');
//     return res.json({ ok: true, category: doc });
//   } catch (err) {
//     log.error({ msg: err.message }, 'category:archive fail');
//     return res.status(500).json({ error: 'Archive failed' });
//   }
// };

// exports.deleteCategory = async (req, res) => {
//   const log = req.log || loggerRoot;
//   try {
//     const out = await Category.deleteOne({
//       _id: req.params.id,
//       created_by: req.user._id,
//     });
//     if (out.deletedCount === 0)
//       return res.status(404).json({ error: 'Not found' });
//     log.info({ id: req.params.id }, 'category:delete ok');
//     return res.json({ ok: true });
//   } catch (err) {
//     log.error({ msg: err.message }, 'category:delete fail');
//     return res.status(500).json({ error: 'Delete failed' });
//   }
// };
