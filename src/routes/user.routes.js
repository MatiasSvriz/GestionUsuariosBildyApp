import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Ruta base de user funcionando'
  });
});

export default router;