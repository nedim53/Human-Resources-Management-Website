const express = require('express');
const router = express.Router();
const {  authenticateToken, chat } = require('../Kontroler/autentifikacija');
const client = require('../db/db');

// POST zahtev za slanje poruke

router.post('/', authenticateToken,chat, async (req, res) => {
  const { posiljalac, primalac, poruka } = req.body;
  console.log(req.body);

  // Validacija podataka
  if (!posiljalac || !primalac || !poruka) {
    return res.status(400).send('Svi podaci su obavezni');
  }

  try {
    // Unos poruke u tabelu "poruke"
    const result = await client.query('insert into poruke(posiljalac,primalac, poruka, datum_slanja) values ($1,$2,$3)',[posiljalac,primalac,poruka,new Date()]);
    res.redirect('/chat_k');
  } catch (error) {
    console.error('Greška pri slanju poruke:', error.stack);
    res.status(500).send('Greška na serveru');
  }
});


// GET zahtev za prikaz liste HR menadžera
router.get('/', authenticateToken, async (req, res) => {
  if (!req.korisnik || !req.korisnik.email) {
    return res.status(401).send('Autentifikacija nije uspješna.');
  }
  const emailK = req.korisnik.email;
    try {
    const porukeRez = await client.query('SELECT * FROM poruke WHERE posiljalac = $1 OR primalac = $1 ORDER BY datum_slanja desc', [emailK]);
    const poruke = porukeRez.rows;

    const menadzeriRez = await client.query('SELECT * FROM hr_menadzeri');
    const menadzeri = menadzeriRez.rows;

    res.render('chat_k', { korisnik: req.korisnik, poruke: poruke, menadzeri: menadzeri });
  } catch (err) {
    console.error('Greška pri dohvatanju podataka:', err.stack);
    res.status(500).send('Greška na serveru');
  }
});

module.exports = router;
