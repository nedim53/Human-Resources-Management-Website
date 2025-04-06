const express = require('express');
const router = express.Router();
const { autentifikujKorisnika, authenticateToken } = require('../Kontroler/autentifikacija');
const client = require('../db/db'); // Import povezivanja na bazu


// POST ruta za prijavu - autentifikacija korisnika
router.post('/', autentifikujKorisnika);


router.get('/', authenticateToken, async (req, res) => {
  try {
    const prijavljeni = req.query.prijavljeni === 'true';
    const naziv = req.query.naziv || '';
    const kompanija = req.query.kompanija || '';
    const datumSort = req.query.datumSort || 'desc';
    const zahtjevi = req.query.zahtjevi || '';

    // Lista validnih zahtjeva iz baze
    const validniZahtjevi = [
      'cv', 
      'vozacka_dozvola', 
      'strani_jezik', 
      'iskustvo', 
      'junior', 
      'medior', 
      'senior', 
      'vss', 
      'vss_vss'
    ];

    // Inicijalni SQL upit i parametri
    let query = 
      `SELECT k.*, spk.status_prijave 
      FROM konkurs k 
      LEFT JOIN status_prijave_kandidata spk 
      ON k.id = spk.konkurs_id AND spk.kandidat_id = $1
      WHERE 1=1`;
    const queryParams = [req.korisnik.id];

    // Dodaj uslov za "prijavljeni"
    if (prijavljeni) {
      query += ' AND spk.status_prijave IS NOT NULL';
    }

    // Dodaj uslov za "naziv"
    if (naziv) {
      query += ` AND LOWER(k.naziv) LIKE LOWER($${queryParams.length + 1})`;
      queryParams.push(`%${naziv}%`);
    }

    // Dodaj uslov za "kompanija"
    if (kompanija) {
      query += ` AND LOWER(k.kompanija) LIKE LOWER($${queryParams.length + 1})`;
      queryParams.push(`%${kompanija}%`);
    }

    // Dodaj uslov za specifični zahtjev
    if (zahtjevi && validniZahtjevi.includes(zahtjevi)) {
      query += ` AND k.${zahtjevi} = TRUE`;
    }

    // Dodaj sortiranje po datumu
    query += ` ORDER BY k.datum ${datumSort === 'asc' ? 'ASC' : 'DESC'}`;

    // Izvrši upit
    const konkursiResult = await client.query(query, queryParams);
    const konkursi = konkursiResult.rows;

    // Renderuj stranicu sa svim parametrima
    res.render('home', {
      korisnik: req.korisnik,
      konkursi: konkursi,
      prijavljeni: req.query.prijavljeni || 'false',
      naziv: req.query.naziv || '',
      kompanija: req.query.kompanija || '',
      datumSort: req.query.datumSort,
      zahtjevi: req.query.zahtjevi,
    });
  } catch (err) {
    console.error('Greška pri dohvatanju konkursa:', err.stack);
    res.status(500).send('Greška na serveru');
  }
});

module.exports = router;
