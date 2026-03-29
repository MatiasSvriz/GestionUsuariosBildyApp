import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema(
  {
    street: {
      type: String,
      trim: true,
      default: null
    },
    number: {
      type: String,
      trim: true,
      default: null
    },
    postal: {
      type: String,
      trim: true,
      default: null
    },
    city: {
      type: String,
      trim: true,
      default: null
    },
    province: {
      type: String,
      trim: true,
      default: null
    }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      select: false
    },
    name: {
      type: String,
      trim: true,
      default: null
    },
    lastName: {
      type: String,
      trim: true,
      default: null
    },
    nif: {
      type: String,
      trim: true,
      default: null
    },
    role: {
      type: String,
      enum: ['admin', 'guest'],
      default: 'admin'
    },
    status: {
      type: String,
      enum: ['pending', 'verified'],
      default: 'pending'
    },
    verificationCode: {
      type: String,
      default: null,
      select: false
    },
    verificationAttempts: {
      type: Number,
      default: 3
    },
    refreshToken: {
      type: String,
      default: null,
      select: false
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      default: null
    },
    address: {
      type: addressSchema,
      default: () => ({})
    },
    deleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ company: 1 });
userSchema.index({ status: 1 });
userSchema.index({ role: 1 });

userSchema.virtual('fullName').get(function () {
  const name = this.name ?? '';
  const lastName = this.lastName ?? '';
  return `${name} ${lastName}`.trim();
});

export default mongoose.model('User', userSchema);