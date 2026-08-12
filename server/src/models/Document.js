import mongoose from 'mongoose';

const ALLOWED_ROLES = ['viewer', 'editor', 'admin'];
const REQUEST_STATUS = ['pending', 'approved', 'rejected'];

const accessEntrySchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, trim: true },
    role: { type: String, enum: ALLOWED_ROLES, default: 'viewer' },
    grantedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const accessRequestSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, trim: true },
    requestedRole: { type: String, enum: ALLOWED_ROLES, default: 'viewer' },
    status: { type: String, enum: REQUEST_STATUS, default: 'pending' },
    message: { type: String, trim: true, maxlength: 500 },
    reviewedBy: { type: String, trim: true },
    reviewedAt: { type: Date },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

const documentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 180 },
    description: { type: String, trim: true, maxlength: 1000 },
    ownerId: { type: String, required: true, trim: true },
    storageKey: { type: String, trim: true },
    mimeType: { type: String, trim: true },
    size: { type: Number, min: 0 },
    access: { type: [accessEntrySchema], default: [] },
    accessRequests: { type: [accessRequestSchema], default: [] },
  },
  { timestamps: true },
);

documentSchema.index({ ownerId: 1, createdAt: -1 });
documentSchema.index({ 'access.userId': 1 });
documentSchema.index({ 'accessRequests.userId': 1, 'accessRequests.status': 1 });

documentSchema.methods.hasAccess = function hasAccess(userId) {
  return this.ownerId === userId || this.access.some((entry) => entry.userId === userId);
};

documentSchema.methods.upsertAccess = function upsertAccess(userId, role) {
  const existing = this.access.find((entry) => entry.userId === userId);
  if (existing) {
    existing.role = role;
    existing.grantedAt = new Date();
    return;
  }
  this.access.push({ userId, role });
};

export { ALLOWED_ROLES, REQUEST_STATUS };
export default mongoose.model('Document', documentSchema);
