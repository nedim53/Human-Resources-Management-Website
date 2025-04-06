const { uzmiPodatkeAdmin } = require('../Kontroler/admin');

const express = require('express');
const router = express.Router();
const { autentifikujKorisnika, authenticateToken } = require('../Kontroler/autentifikacija');
const client = require('../db/db');

router.post('',autentifikujKorisnika);

router.get('/', authenticateToken,uzmiPodatkeAdmin);


module.exports = router;
