// src/controllers/project.controller.js
import Project from '../models/Project.js';
import Client from '../models/Client.js';
import { AppError } from '../utils/AppError.js';

// Función auxiliar para paginación
const getPaginationData = (query) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

// POST /api/project
export const createProject = async (req, res, next) => {
  try {
    const { client, name, projectCode, address, email, notes, active } = req.body;

    if (!req.user.company) {
      throw AppError.badRequest('El usuario no tiene una compañía asociada');
    }

    // Comprobar que el cliente existe y pertenece a la compañía
    const existingClient = await Client.findOne({
      _id: client,
      company: req.user.company,
      deleted: false
    });

    if (!existingClient) {
      throw AppError.notFound('Cliente');
    }

    // Comprobar que no exista el mismo código en la compañía
    const existingProject = await Project.findOne({
      company: req.user.company,
      projectCode
    });

    if (existingProject) {
      throw AppError.conflict('Ya existe un proyecto con ese código en tu compañía');
    }

    const project = await Project.create({
      user: req.user._id,
      company: req.user.company,
      client,
      name,
      projectCode,
      address,
      email,
      notes,
      active
    });

    res.status(201).json({
      ok: true,
      message: 'Proyecto creado correctamente',
      data: project
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/project/:id
export const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    const project = await Project.findOne({
      _id: id,
      company: req.user.company
    });

    if (!project) {
      throw AppError.notFound('Proyecto');
    }

    // Si se cambia el cliente, comprobar que exista y sea de la misma compañía
    if (req.body.client) {
      const existingClient = await Client.findOne({
        _id: req.body.client,
        company: req.user.company,
        deleted: false
      });

      if (!existingClient) {
        throw AppError.notFound('Cliente');
      }
    }

    // Si se cambia el projectCode, comprobar duplicados
    if (req.body.projectCode && req.body.projectCode !== project.projectCode) {
      const existingProject = await Project.findOne({
        company: req.user.company,
        projectCode: req.body.projectCode
      });

      if (existingProject) {
        throw AppError.conflict('Ya existe un proyecto con ese código en tu compañía');
      }
    }

    Object.assign(project, req.body);

    await project.save();

    res.status(200).json({
      ok: true,
      message: 'Proyecto actualizado correctamente',
      data: project
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/project
export const getProjects = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationData(req.query);

    const filter = {
      company: req.user.company,
      deleted: false
    };

    if (req.query.client) {
      filter.client = req.query.client;
    }

    if (req.query.name) {
      filter.name = {
        $regex: req.query.name,
        $options: 'i'
      };
    }

    if (req.query.active === 'true') {
      filter.active = true;
    }

    if (req.query.active === 'false') {
      filter.active = false;
    }

    let query = Project.find(filter).populate('client');

    if (req.query.sort) {
      query = query.sort(req.query.sort);
    } else {
      query = query.sort('-createdAt');
    }

    const totalItems = await Project.countDocuments(filter);
    const projects = await query.skip(skip).limit(limit);

    res.status(200).json({
      ok: true,
      data: projects,
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

// GET /api/project/archived
export const getArchivedProjects = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationData(req.query);

    const filter = {
      company: req.user.company,
      deleted: true
    };

    if (req.query.client) {
      filter.client = req.query.client;
    }

    if (req.query.name) {
      filter.name = {
        $regex: req.query.name,
        $options: 'i'
      };
    }

    if (req.query.active === 'true') {
      filter.active = true;
    }

    if (req.query.active === 'false') {
      filter.active = false;
    }

    let query = Project.find(filter).populate('client');

    if (req.query.sort) {
      query = query.sort(req.query.sort);
    } else {
      query = query.sort('-createdAt');
    }

    const totalItems = await Project.countDocuments(filter);
    const projects = await query.skip(skip).limit(limit);

    res.status(200).json({
      ok: true,
      data: projects,
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

// GET /api/project/:id
export const getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const project = await Project.findOne({
      _id: id,
      company: req.user.company,
      deleted: false
    }).populate('client');

    if (!project) {
      throw AppError.notFound('Proyecto');
    }

    res.status(200).json({
      ok: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/project/:id
export const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { soft } = req.query;

    const project = await Project.findOne({
      _id: id,
      company: req.user.company
    });

    if (!project) {
      throw AppError.notFound('Proyecto');
    }

    if (soft === 'true') {
      if (project.deleted) {
        throw AppError.badRequest('El proyecto ya está archivado');
      }

      project.deleted = true;
      await project.save();

      return res.status(200).json({
        ok: true,
        message: 'Proyecto archivado correctamente'
      });
    }

    await Project.deleteOne({
      _id: id,
      company: req.user.company
    });

    res.status(200).json({
      ok: true,
      message: 'Proyecto eliminado correctamente'
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/project/:id/restore
export const restoreProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    const project = await Project.findOne({
      _id: id,
      company: req.user.company,
      deleted: true
    });

    if (!project) {
      throw AppError.notFound('Proyecto archivado');
    }

    project.deleted = false;
    await project.save();

    res.status(200).json({
      ok: true,
      message: 'Proyecto restaurado correctamente',
      data: project
    });
  } catch (error) {
    next(error);
  }
};