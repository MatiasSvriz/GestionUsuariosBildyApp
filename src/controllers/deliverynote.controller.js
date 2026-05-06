import DeliveryNote from '../models/DeliveryNote.js';
import Project from '../models/Project.js';
import Client from '../models/Client.js';
import cloudinaryService from '../services/cloudinary.service.js';
import pdfService from '../services/pdf.service.js';
import { AppError } from '../utils/AppError.js';
import { emitToCompany } from '../services/socket.service.js';

// Paginación simple
const getPaginationData = (query) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

export const createDeliveryNote = async (req, res, next) => {
  try {
    const {
      client,
      project,
      format,
      description,
      workDate,
      material,
      quantity,
      unit,
      hours,
      workers
    } = req.body;

    const existingClient = await Client.findOne({
      _id: client,
      company: req.user.company,
      deleted: false
    });

    if (!existingClient) {
      throw AppError.notFound('Cliente');
    }

    const existingProject = await Project.findOne({
      _id: project,
      company: req.user.company,
      deleted: false
    });

    if (!existingProject) {
      throw AppError.notFound('Proyecto');
    }

    if (existingProject.client.toString() !== client) {
      throw AppError.badRequest('El proyecto no pertenece a ese cliente');
    }

    if (format === 'material') {
      if (!material || !quantity || !unit) {
        throw AppError.badRequest('Faltan datos de material');
      }
    }

    if (format === 'hours') {
      if (!hours && (!workers || workers.length === 0)) {
        throw AppError.badRequest('Faltan datos de horas');
      }
    }

    const deliveryNote = await DeliveryNote.create({
      user: req.user._id,
      company: req.user.company,
      client,
      project,
      format,
      description,
      workDate,
      material,
      quantity,
      unit,
      hours,
      workers
    });

    emitToCompany(req.user.company, 'deliverynote:new', deliveryNote);

    res.status(201).json({
      ok: true,
      message: 'Albarán creado correctamente',
      data: deliveryNote
    });
  } catch (error) {
    next(error);
  }
};

export const getDeliveryNotes = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationData(req.query);

    const filter = {
      company: req.user.company,
      deleted: false
    };

    if (req.query.project) {
      filter.project = req.query.project;
    }

    if (req.query.client) {
      filter.client = req.query.client;
    }

    if (req.query.format) {
      filter.format = req.query.format;
    }

    if (req.query.signed === 'true') {
      filter.signed = true;
    }

    if (req.query.signed === 'false') {
      filter.signed = false;
    }

    if (req.query.from || req.query.to) {
      filter.workDate = {};

      if (req.query.from) {
        filter.workDate.$gte = new Date(req.query.from);
      }

      if (req.query.to) {
        filter.workDate.$lte = new Date(req.query.to);
      }
    }

    let query = DeliveryNote.find(filter)
      .populate('client')
      .populate('project');

    if (req.query.sort) {
      query = query.sort(req.query.sort);
    } else {
      query = query.sort('-workDate');
    }

    const totalItems = await DeliveryNote.countDocuments(filter);
    const notes = await query.skip(skip).limit(limit);

    res.status(200).json({
      ok: true,
      data: notes,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
        limit
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getDeliveryNoteById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const note = await DeliveryNote.findOne({
      _id: id,
      company: req.user.company,
      deleted: false
    })
      .populate('user')
      .populate('client')
      .populate('project');

    if (!note) {
      throw AppError.notFound('Albarán');
    }

    res.status(200).json({
      ok: true,
      data: note
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDeliveryNote = async (req, res, next) => {
  try {
    const { id } = req.params;

    const note = await DeliveryNote.findOne({
      _id: id,
      company: req.user.company
    });

    if (!note) {
      throw AppError.notFound('Albarán');
    }

    if (note.signed) {
      throw AppError.badRequest('No se puede borrar un albarán firmado');
    }

    await DeliveryNote.deleteOne({
      _id: id,
      company: req.user.company
    });

    res.status(200).json({
      ok: true,
      message: 'Albarán eliminado correctamente'
    });
  } catch (error) {
    next(error);
  }
};

export const signDeliveryNote = async (req, res, next) => {
  try {
    const { id } = req.params;

    const note = await DeliveryNote.findOne({
      _id: id,
      company: req.user.company,
      deleted: false
    })
      .populate('user')
      .populate('client')
      .populate('project');

    if (!note) {
      throw AppError.notFound('Albarán');
    }

    if (note.signed) {
      throw AppError.badRequest('El albarán ya está firmado');
    }

    if (!req.file) {
      throw AppError.badRequest('Debes subir una imagen de firma');
    }

    const signatureUpload = await cloudinaryService.uploadSignature(
      req.file.buffer,
      note._id
    );

    note.signed = true;
    note.signedAt = new Date();
    note.signatureUrl = signatureUpload.secure_url;

    const pdfBuffer = await pdfService.generateDeliveryNotePdf(note);

    const pdfUpload = await cloudinaryService.uploadPdf(
      pdfBuffer,
      note._id
    );

    note.pdfUrl = pdfUpload.secure_url;

    await note.save();

    emitToCompany(req.user.company, 'deliverynote:signed', note);

    res.status(200).json({
      ok: true,
      message: 'Albarán firmado correctamente',
      data: note
    });
  } catch (error) {
    next(error);
  }
};

export const getDeliveryNotePdf = async (req, res, next) => {
  try {
    const { id } = req.params;

    const note = await DeliveryNote.findOne({
      _id: id,
      company: req.user.company,
      deleted: false
    })
      .populate('user')
      .populate('client')
      .populate('project');

    if (!note) {
      throw AppError.notFound('Albarán');
    }

    // Si ya está firmado y tiene PDF subido, devolvemos la URL
    if (note.signed && note.pdfUrl) {
      return res.status(200).json({
        ok: true,
        pdfUrl: note.pdfUrl
      });
    }

    // Si no existe todavía, lo generamos
    const pdfBuffer = await pdfService.generateDeliveryNotePdf(note);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="deliverynote-${note._id}.pdf"`
    );

    return res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};