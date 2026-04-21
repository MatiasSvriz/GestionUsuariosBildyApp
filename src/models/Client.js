import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema(
  {
    street: String,
    number: String,
    postal: String,
    city: String,
    province: String
  },
  {
    _id: false
  }
);

const clientSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    cif: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    address: {
      type: addressSchema,
      default: {}
    },
    deleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Índice para evitar CIF repetido dentro de una misma compañía
clientSchema.index({ company: 1, cif: 1 }, { unique: true });

const Client = mongoose.model('Client', clientSchema);

export default Client;