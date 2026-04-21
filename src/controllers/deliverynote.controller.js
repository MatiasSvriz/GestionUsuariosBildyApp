import DeliveryNote from '../models/DeliveryNote.js';
import Project from '../models/Project.js';
import Client from '../models/Client.js';
import { AppError } from '../utils/AppError.js';

// Paginación simple
const getPaginationData = (query) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

// ============================
// CREATE
// ============================
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

    // 1. Validar client
    const existingClient = await Client.findOne({
      _id: client,
      company: req.user.company,
      deleted: false
    });

    if (!existingClient) {
      throw AppError.notFound('Cliente');
    }

    // 2. Validar project
    const existingProject = await Project.findOne({
      _id: project,
      company: req.user.company,
      deleted: false
    });

    if (!existingProject) {
      throw AppError.notFound('Proyecto');
    }

    // 3. Validar relación project → client
    if (existingProject.client.toString() !== client) {
      throw AppError.badRequest('El proyecto no pertenece a ese cliente');
    }

    // 4. Validar lógica de formato (simple)
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

    res.status(201).json({
      ok: true,
      message: 'Albarán creado correctamente',
      data: deliveryNote
    });

  } catch (error) {
    next(error);
  }
};

// ============================
// LIST
// ============================
export const getDeliveryNotes = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationData(req.query);

    const filter = {
      company: req.user.company,
      deleted: false
    };

    // Filtros
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

    // Filtro por fechas
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

    // Ordenación
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

// ============================
// GET BY ID
// ============================
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

// ============================
// DELETE
// ============================
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

    // 🚨 Regla clave del enunciado
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