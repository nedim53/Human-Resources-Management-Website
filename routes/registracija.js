const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { v4: uuidv4 } = require('uuid');

router.get('/', (req, res) => {
  res.render('registracija');
});

router.post('/', async (req, res) => {
  const { ime, prezime, email, sifra, godine, adresa, telefon, grad } = req.body;
  const id = uuidv4();

  try {
    // Provjera da li korisnik već postoji
    const userCheck = await pool.query(
      'SELECT * FROM korisnici WHERE email = $1',
      [email]
    );

    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Korisnik sa ovim emailom već postoji' });
    }

    // Dodavanje novog korisnika bez kriptovanja šifre
    await pool.query(
      'INSERT INTO korisnici (id, ime, prezime, email, sifra, godine, adresa, telefon, grad) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      [id, ime, prezime, email, sifra, godine, adresa, telefon, grad]
    );

    res.redirect('/');
  } catch (err) {
    console.error('Greška prilikom registracije:', err);
    res.status(500).json({ error: 'Greška na serveru' });
  }
});

module.exports = router;
