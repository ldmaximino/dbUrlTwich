const express = require('express');
const { leerUrls, agregarUrl, eliminarUrl, editarUrlForm, editarUrl, redireccionamiento } = require('../controllers/homeController');
const urlValidar = require('../middlewares/urlValida');
const verificarUsers = require('../middlewares/verificarUsers');
const { formPerfil, editarPerfil } = require('../controllers/perfilController');
const router = express.Router();

router.get("/", verificarUsers, leerUrls);
router.post("/", verificarUsers,urlValidar , agregarUrl);
router.get("/eliminar/:id", verificarUsers,eliminarUrl);
router.get("/editar/:id", verificarUsers,editarUrlForm);
router.post("/editar/:id",verificarUsers, urlValidar, editarUrl);
router.get("/perfil", verificarUsers, formPerfil);
router.post("/perfil", verificarUsers, editarPerfil);
router.get("/:shortUrl", redireccionamiento);
module.exports = router;
