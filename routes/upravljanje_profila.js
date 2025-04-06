const express = require('express');
const router = express.Router();
const multer = require('../Kontroler/multer'); // Import multer konfiguracije
const { autentifikujKorisnika, authenticateToken } = require('../Kontroler/autentifikacija');
const client = require('../db/db');

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { ime, prezime } = req.korisnik;

    const rezultat = await client.query('SELECT * FROM korisnici WHERE ime = $1 AND prezime = $2', [ime, prezime]);

    const korisnik = rezultat.rows[0];
    if (!korisnik) {
      return res.status(404).send('Korisnik nije pronađen');
    }

    res.render('upravljanje_profila', { korisnik });
  } catch (err) {
    console.error('Greška pri dohvatanju podataka:', err.stack);
    res.status(500).send('Greška na serveru');
  }
});


router.post('/', authenticateToken, multer.fields([
  { name: 'cv', maxCount: 1 },
  { name: 'certifikat', maxCount: 1 }
]), async (req, res) => {
  try {
    const { ime, prezime } = req.korisnik;
    const { godine, email, telefon, adresa, grad, radno_iskustvo, obrazovanje } = req.body;

    const fieldsToUpdate = [];
    const values = [];
    let paramIndex = 1;

    // Dodavanje polja iz req.body
    if (godine) {
      fieldsToUpdate.push(`godine = $${paramIndex++}`);
      values.push(godine);
    }
    if (email) {
      fieldsToUpdate.push(`email = $${paramIndex++}`);
      values.push(email);
    }
    if (telefon) {
      fieldsToUpdate.push(`telefon = $${paramIndex++}`);
      values.push(telefon);
    }
    if (adresa) {
      fieldsToUpdate.push(`adresa = $${paramIndex++}`);
      values.push(adresa);
    }
    if (grad) {
      fieldsToUpdate.push(`grad = $${paramIndex++}`);
      values.push(grad);
    }
    if (radno_iskustvo) {
      fieldsToUpdate.push(`radno_iskustvo = $${paramIndex++}`);
      values.push(radno_iskustvo);
    }
    if (obrazovanje) {
      fieldsToUpdate.push(`obrazovanje = $${paramIndex++}`);
      values.push(obrazovanje);
    }

    // Dodavanje polja za fajlove iz req.files
    if (req.files && req.files.cv) {
      const cvPath = `/uploads/${req.files.cv[0].filename}`;
      fieldsToUpdate.push(`cv = $${paramIndex++}`);
      values.push(cvPath);
    }
    if (req.files && req.files.certifikat) {
      const certifikatPath = `/uploads/${req.files.certifikat[0].filename}`;
      fieldsToUpdate.push(`certifikati = $${paramIndex++}`);
      values.push(certifikatPath);
    }

    // Ako nema polja za ažuriranje, preskočite upit
    if (fieldsToUpdate.length === 0) {
      return res.status(400).send('Nema podataka za ažuriranje');
    }

    // Dodajte ime i prezime za WHERE uslov
    values.push(ime, prezime);

    const query = `
      UPDATE korisnici
      SET ${fieldsToUpdate.join(', ')}
      WHERE ime = $${paramIndex++} AND prezime = $${paramIndex}
    `;

    await client.query(query, values);

    // Dohvatite ažurirane podatke
    const rezultat = await client.query('SELECT * FROM korisnici WHERE ime = $1 AND prezime = $2', [ime, prezime]);
    const korisnik = rezultat.rows[0];

    res.render('upravljanje_profila', { korisnik });
  } catch (err) {
    console.error('Greška pri ažuriranju profila:', err.stack);
    res.status(500).send('Greška na serveru');
  }
});



module.exports = router;
