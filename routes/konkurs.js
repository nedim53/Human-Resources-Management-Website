const express = require('express');
const router = express.Router();
const multer = require('../Kontroler/multer'); // Import multer konfiguracije
const { autentifikujKorisnika, authenticateToken } = require('../Kontroler/autentifikacija');
const client = require('../db/db');


// POST ruta za autentifikaciju korisnika
router.post('/:id', authenticateToken, multer.single('cv'), async (req, res) => {
  const konkursId = req.params.id;
  const korisnikID = req.korisnik.id;
  const { ime, prezime, grad, email, vozacka_dozvola,stranijezik, iskustvo, junior, medior, senior,vss,vss_vss } = req.body;
  const cvPath = req.file ? req.file.path : null; // Putanja fajla koji je uploadovan

  try {
    // Čuvanje prijave u bazi podataka
    const prijava = 'Prijavljen'; // po defaultu da se odmah sacuva da je prijavljen
    
   const hrRezultat = await client.query('select hm.id from hr_menadzeri hm join konkurs k on k.id_hr =hm.id where k.id =$1; ',[konkursId]); 
    const hr_id = hrRezultat.rows[0].id;

    const status = await client.query('insert into status_prijave_kandidata (kandidat_id,konkurs_id,hr_id,status_prijave) values ($1,$2,$3,$4)',[korisnikID,konkursId,hr_id,prijava])

    const query = `
      INSERT INTO prijava_na_konkurs (konkurs_id, ime, prezime, grad, email, cv_path, vozacka_dozvola,strani_jezik, iskustvo, junior, medior, senior,vss,vss_vss,korisnik_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,$12,$13,$14,$15)`;

    const values = [
      konkursId,
      ime,
      prezime,
      grad,
      email,
      cvPath,
      vozacka_dozvola === 'on',
      stranijezik,
      iskustvo,
      junior === 'on',
      medior === 'on',
      senior === 'on',
      vss ==='on',
      vss_vss ==='on',
      korisnikID
    ];

    await client.query(query, values);
    res.redirect(`/konkurs/${konkursId}`);}
    catch (err) {
    console.error('Greška pri čuvanju prijave:', err.stack);
    res.status(500).send('Greška na serveru');
  }
});


// GET ruta za prikaz detalja konkursa na osnovu ID-a
router.get('/:id', authenticateToken, async (req, res) => {
  const konkursId = req.params.id; // ID iz URL-a
  try {
    const konkursResult = await client.query('SELECT * FROM konkurs WHERE id = $1', [konkursId]);
    const detaljiKonkursa = await client.query('select * from detalji_konkursa where konkurs_id = $1',[konkursId]);
    const konkurs = konkursResult.rows[0];
    const detalji = detaljiKonkursa.rows[0];
    if (!konkurs) {
      return res.status(404).send('Konkurs nije pronađen');
    }
    res.render('konkurs', { konkurs: konkurs,detalji: detalji, korisnik: req.korisnik });
  } catch (err) {
    console.error('Greška pri dohvatanju konkursa:', err.stack);
    res.status(500).send('Greška na serveru');
  }
});


module.exports = router;
