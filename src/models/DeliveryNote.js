import mongoose from 'mongoose';

const workerSchema = new mongoose.Schema(
  {
    name: String,
    hours: Number
  },
  {
    _id: false
  }
);

const deliveryNoteSchema = new mongoose.Schema(
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
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true
    },
    format: {
      type: String,
      enum: ['material', 'hours'],
      required: true
    },
    description: {
      type: String,
      trim: true
    },
    workDate: {
      type: Date,
      required: true
    },

    // Para albarán de material
    material: {
      type: String,
      trim: true
    },
    quantity: {
      type: Number
    },
    unit: {
      type: String,
      trim: true
    },

    // Para albarán de horas
    hours: {
      type: Number
    },
    workers: {
      type: [workerSchema],
      default: []
    },

    // Firma
    signed: {
      type: Boolean,
      default: false
    },
    signedAt: {
      type: Date
    },
    signatureUrl: {
      type: String,
      trim: true
    },
    pdfUrl: {
      type: String,
      trim: true
    },

    // Soft delete
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

const DeliveryNote = mongoose.model('DeliveryNote', deliveryNoteSchema);

export default DeliveryNote;