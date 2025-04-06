const express = require('express');
const router = express.Router();
const { autentifikujKorisnika, authenticateToken } = require('../Kontroler/autentifikacija');
const client = require('../db/db'); // Import povezivanja na bazu
const { generisiPDF } = require('../Kontroler/automatskiPDF');


// Definiši rutu za generisanje PDF-a
router.get('/:konkursID/:kandidatID', generisiPDF); // Kada se pozove ruta, poziva se funkcija generisiPDF

// Exportuj rutu
module.exports = router;
