import request from "supertest";
import app from "../src/app.js";

import User from "../src/models/User.js";
import Company from "../src/models/Company.js";
import Client from "../src/models/Client.js";
import Project from "../src/models/Project.js";
import DeliveryNote from "../src/models/DeliveryNote.js";

let token;
let user;
let company;
let client;
let project;

beforeEach(async () => {
  const registerRes = await request(app)
    .post("/api/user/register")
    .send({
      email: `delivery_${Date.now()}@test.com`,
      password: "Password123",
    });

  token = registerRes.body.data.accessToken;

  user = await User.findOne({ email: registerRes.body.data.user.email });

  company = await Company.create({
    owner: user._id,
    name: "Empresa Test",
    cif: "B12345678",
    address: {
      street: "Calle Test",
      number: "1",
      postal: "28001",
      city: "Madrid",
      province: "Madrid",
    },
  });

  user.company = company._id;
  user.status = "verified";
  await user.save();

  client = await Client.create({
    user: user._id,
    company: company._id,
    name: "Cliente Test",
    cif: "C12345678",
    email: "cliente@test.com",
    phone: "600000000",
    address: {
      street: "Calle Cliente",
      number: "2",
      postal: "28002",
      city: "Madrid",
      province: "Madrid",
    },
  });

  project = await Project.create({
    user: user._id,
    company: company._id,
    client: client._id,
    name: "Proyecto Test",
    projectCode: "PRJ-001",
    email: "proyecto@test.com",
    address: {
      street: "Calle Proyecto",
      number: "3",
      postal: "28003",
      city: "Madrid",
      province: "Madrid",
    },
    active: true,
  });
});

describe("DeliveryNote endpoints", () => {

  test("POST /api/deliverynote crea un albarán", async () => {
    const res = await request(app)
      .post("/api/deliverynote")
      .set("Authorization", `Bearer ${token}`)
      .send({
        project: project._id.toString(),
        client: client._id.toString(),
        format: "hours",
        description: "Trabajo realizado",
        workDate: "2026-04-27",
        hours: 8,
        workers: [
          { name: "Trabajador 1", hours: 8 },
        ],
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.ok).toBe(true);
    expect(res.body.data).toHaveProperty("_id");
  });

  test("GET /api/deliverynote lista albaranes", async () => {
    await DeliveryNote.create({
      user: user._id,
      company: company._id,
      client: client._id,
      project: project._id,
      format: "hours",
      description: "Albarán test",
      workDate: new Date(),
      hours: 5,
      signed: false,
    });

    const res = await request(app)
      .get("/api/deliverynote")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  test("GET /api/deliverynote/:id obtiene un albarán", async () => {
    const note = await DeliveryNote.create({
      user: user._id,
      company: company._id,
      client: client._id,
      project: project._id,
      format: "hours",
      description: "Albarán detalle",
      workDate: new Date(),
      hours: 6,
      signed: false,
    });

    const res = await request(app)
      .get(`/api/deliverynote/${note._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  test("GET /api/deliverynote/pdf/:id genera PDF", async () => {
    const note = await DeliveryNote.create({
      user: user._id,
      company: company._id,
      client: client._id,
      project: project._id,
      format: "hours",
      description: "Albarán PDF",
      workDate: new Date(),
      hours: 4,
      signed: false,
    });

    const res = await request(app)
      .get(`/api/deliverynote/pdf/${note._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect([200, 201]).toContain(res.statusCode);
  });

  test("GET /api/deliverynote/pdf/:id devuelve pdfUrl si ya está firmado y subido", async () => {
  const note = await DeliveryNote.create({
    user: user._id,
    company: company._id,
    client: client._id,
    project: project._id,
    format: "hours",
    description: "Albarán con PDF ya generado",
    workDate: new Date(),
    hours: 4,
    signed: true,
    signedAt: new Date(),
    pdfUrl: "/uploads/test.pdf",
  });

  const res = await request(app)
    .get(`/api/deliverynote/pdf/${note._id}`)
    .set("Authorization", `Bearer ${token}`);

  expect(res.statusCode).toBe(200);
  expect(res.body.ok).toBe(true);
  expect(res.body.pdfUrl).toBe("/uploads/test.pdf");
});

  test("DELETE /api/deliverynote elimina albarán no firmado", async () => {
    const note = await DeliveryNote.create({
      user: user._id,
      company: company._id,
      client: client._id,
      project: project._id,
      format: "hours",
      description: "Eliminar",
      workDate: new Date(),
      hours: 4,
      signed: false,
    });

    const res = await request(app)
      .delete(`/api/deliverynote/${note._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect([200, 204]).toContain(res.statusCode);
  });

  test("DELETE /api/deliverynote no elimina albarán firmado", async () => {
    const note = await DeliveryNote.create({
      user: user._id,
      company: company._id,
      client: client._id,
      project: project._id,
      format: "hours",
      description: "Firmado",
      workDate: new Date(),
      hours: 4,
      signed: true,
      signedAt: new Date(),
    });

    const res = await request(app)
      .delete(`/api/deliverynote/${note._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect([400, 403, 409]).toContain(res.statusCode);
  });

  test("GET /api/deliverynote/:id devuelve 404 si no existe", async () => {
    const res = await request(app)
      .get("/api/deliverynote/000000000000000000000000")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
  });

  test("DELETE /api/deliverynote/:id devuelve 404 si no existe", async () => {
    const res = await request(app)
      .delete("/api/deliverynote/000000000000000000000000")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
  });

  test("POST /api/deliverynote falla si faltan datos de material", async () => {
    const res = await request(app)
      .post("/api/deliverynote")
      .set("Authorization", `Bearer ${token}`)
      .send({
        project: project._id.toString(),
        client: client._id.toString(),
        format: "material",
        description: "Material incompleto",
        workDate: "2026-04-27"
      });

    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  test("POST /api/deliverynote falla si faltan datos de horas", async () => {
    const res = await request(app)
      .post("/api/deliverynote")
      .set("Authorization", `Bearer ${token}`)
      .send({
        project: project._id.toString(),
        client: client._id.toString(),
        format: "hours",
        description: "Horas incompletas",
        workDate: "2026-04-27"
      });

    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  test("PATCH /api/deliverynote/:id/sign falla si no hay firma", async () => {
    const note = await DeliveryNote.create({
      user: user._id,
      company: company._id,
      client: client._id,
      project: project._id,
      format: "hours",
      description: "Sin firma",
      workDate: new Date(),
      hours: 4,
      signed: false,
    });

    const res = await request(app)
      .patch(`/api/deliverynote/${note._id}/sign`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  test("PATCH /api/deliverynote/:id/sign falla si ya está firmado", async () => {
    const note = await DeliveryNote.create({
      user: user._id,
      company: company._id,
      client: client._id,
      project: project._id,
      format: "hours",
      description: "Ya firmado",
      workDate: new Date(),
      hours: 4,
      signed: true,
      signedAt: new Date(),
    });

    const res = await request(app)
      .patch(`/api/deliverynote/${note._id}/sign`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

});