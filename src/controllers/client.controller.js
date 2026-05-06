// src/controllers/client.controller.js
import Client from '../models/Client.js';
import { AppError } from '../utils/AppError.js';
import { emitToCompany } from '../services/socket.service.js';

const getPaginationData = (query) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

export const createClient = async (req, res, next) => {
  try {
    const { name, cif, email, phone, address } = req.body;

    if (!req.user.company) {
      throw AppError.badRequest('El usuario no tiene una compañía asociada');
    }

    const existingClient = await Client.findOne({
      company: req.user.company,
      cif
    });

    if (existingClient) {
      throw AppError.conflict('Ya existe un cliente con ese CIF en tu compañía');
    }

    const client = await Client.create({
      user: req.user._id,
      company: req.user.company,
      name,
      cif,
      email,
      phone,
      address
    });

    emitToCompany(req.user.company, 'client:new', client);

    res.status(201).json({
      ok: true,
      message: 'Cliente creado correctamente',
      data: client
    });
  } catch (error) {
    next(error);
  }
};

export const updateClient = async (req, res, next) => {
  try {
    const { id } = req.params;

    const client = await Client.findOne({
      _id: id,
      company: req.user.company
    });

    if (!client) {
      throw AppError.notFound('Cliente');
    }

    if (req.body.cif && req.body.cif !== client.cif) {
      const existingClient = await Client.findOne({
        company: req.user.company,
        cif: req.body.cif
      });

      if (existingClient) {
        throw AppError.conflict('Ya existe un cliente con ese CIF en tu compañía');
      }
    }

    Object.assign(client, req.body);

    await client.save();

    res.status(200).json({
      ok: true,
      message: 'Cliente actualizado correctamente',
      data: client
    });
  } catch (error) {
    next(error);
  }
};

export const getClients = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationData(req.query);

    const filter = {
      company: req.user.company,
      deleted: false
    };

    if (req.query.name) {
      filter.name = {
        $regex: req.query.name,
        $options: 'i'
      };
    }

    let query = Client.find(filter);

    if (req.query.sort) {
      query = query.sort(req.query.sort);
    } else {
      query = query.sort('-createdAt');
    }

    const totalItems = await Client.countDocuments(filter);
    const clients = await query.skip(skip).limit(limit);

    res.status(200).json({
      ok: true,
      data: clients,
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

export const getArchivedClients = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationData(req.query);

    const filter = {
      company: req.user.company,
      deleted: true
    };

    if (req.query.name) {
      filter.name = {
        $regex: req.query.name,
        $options: 'i'
      };
    }

    let query = Client.find(filter);

    if (req.query.sort) {
      query = query.sort(req.query.sort);
    } else {
      query = query.sort('-createdAt');
    }

    const totalItems = await Client.countDocuments(filter);
    const clients = await query.skip(skip).limit(limit);

    res.status(200).json({
      ok: true,
      data: clients,
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

export const getClientById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const client = await Client.findOne({
      _id: id,
      company: req.user.company,
      deleted: false
    });

    if (!client) {
      throw AppError.notFound('Cliente');
    }

    res.status(200).json({
      ok: true,
      data: client
    });
  } catch (error) {
    next(error);
  }
};

export const deleteClient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { soft } = req.query;

    const client = await Client.findOne({
      _id: id,
      company: req.user.company
    });

    if (!client) {
      throw AppError.notFound('Cliente');
    }

    if (soft === 'true') {
      client.deleted = true;
      await client.save();

      return res.status(200).json({
        ok: true,
        message: 'Cliente archivado correctamente'
      });
    }

    await Client.deleteOne({ _id: id });

    res.status(200).json({
      ok: true,
      message: 'Cliente eliminado correctamente'
    });
  } catch (error) {
    next(error);
  }
};

export const restoreClient = async (req, res, next) => {
  try {
    const { id } = req.params;

    const client = await Client.findOne({
      _id: id,
      company: req.user.company,
      deleted: true
    });

    if (!client) {
      throw AppError.notFound('Cliente archivado');
    }

    client.deleted = false;
    await client.save();

    res.status(200).json({
      ok: true,
      message: 'Cliente restaurado correctamente',
      data: client
    });
  } catch (error) {
    next(error);
  }
};