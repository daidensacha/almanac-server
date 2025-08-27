/**
 * Archive (or unarchive) any Mongoose document
 * - Ensures uniqueness of name/title when archiving
 * - Adds [archived TIMESTAMP] suffix
 * - Optional uniqueness check per user (created_by)
 *
 * @param {Object} opts
 * @param {Mongoose.Model} opts.Model - Mongoose model (Category, Plant, Event)
 * @param {String} opts.id - Document _id
 * @param {String} opts.userId - Current user id
 * @param {Boolean} opts.archivedFlag - true = archive, false = unarchive
 * @param {String} [opts.nameField='name'] - field in schema to rename (e.g. category_name, common_name, event_name)
 */
async function archiveDoc({
  Model,
  id,
  userId,
  archivedFlag,
  nameField = 'name',
}) {
  const doc = await Model.findOne({ _id: id, created_by: userId });
  if (!doc) return null;

  // No-op if already correct state
  if (!!doc.archived === !!archivedFlag) return doc.toObject();

  const updates = { archived: !!archivedFlag };

  if (archivedFlag) {
    const stamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const base = doc[nameField] || Model.modelName;
    let newName = `${base} [archived ${stamp}]`;

    let suffix = 1;
    while (
      await Model.exists({
        _id: { $ne: doc._id },
        created_by: userId,
        [nameField]: newName,
      })
    ) {
      suffix++;
      newName = `${base} [archived ${stamp}] #${suffix}`;
    }

    updates[nameField] = newName;
    updates.archived_at = new Date();
  } else {
    updates.archived_at = null;
  }

  const updated = await Model.findOneAndUpdate(
    { _id: id, created_by: userId },
    { $set: updates },
    { new: true, lean: true },
  );
  return updated;
}

module.exports = { archiveDoc };
