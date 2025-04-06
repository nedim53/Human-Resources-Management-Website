const express = require('express');
const router = express.Router();
const { autentifikujKorisnika, authenticateToken } = require('../Kontroler/autentifikacija');
const client = require('../db/db');

router.post('/',authenticateToken, async (req, res) => {
  const idHr = req.korisnik.id;


    const { 
        kompanija,naziv, imeHrMenadzera, prezimeHrMenadzera, datum, opis, informacija, zadaci,grad, napomena, 
        kontaktEmail, kontaktTel,
        cv, vozackaDozvola, straniJezik: straniJezik, iskustvo, junior, medior, senior, vss, vssVss 
    } = req.body;

    // Postavljamo checkbox vrijednosti na false ako nisu označeni
    const cvValue = cv ? true : false;
    const vozackaDozvolaValue = vozackaDozvola ? true : false;
    const straniJezikkValue = straniJezik ? true : false;
    const iskustvoValue = iskustvo ? true : false;
    const juniorValue = junior ? true : false;
    const mediorValue = medior ? true : false;
    const seniorValue = senior ? true : false;
    const vssValue = vss ? true : false;
    const vssVssValue = vssVss ? true : false;

    const query = `
        INSERT INTO konkurs (
            kompanija,naziv, ime_hr, prezime_hr, datum, opis, informacija, zadaci,grad, napomena, 
            kontakt_email, kontakt_tel, 
            cv, vozacka_dozvola, strani_jezik, iskustvo, junior, medior, senior, vss, vss_vss, id_hr
        ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19,$20,$21,$22
        )`;

    const values = [
        kompanija,naziv, imeHrMenadzera, prezimeHrMenadzera, datum, opis, informacija, zadaci,grad, napomena,
        kontaktEmail, kontaktTel,
        cvValue, vozackaDozvolaValue, straniJezikkValue, iskustvoValue, juniorValue, mediorValue, seniorValue, vssValue, vssVssValue,idHr
    ];

    client.query(query, values)
        .then(result => {
            res.redirect('/kreirajKonkurs');
        })
        .catch(e => {
            console.error(e);
            res.send('Greška prilikom unosa podataka.');
        });
});


/* GET users listing. */
router.get('/', authenticateToken, async (req, res) => {
    if (req.korisnik.uloga !== 'hr_menadzer') {
      return res.status(403).send('Nemate prava pristupa ovoj stranici');
    }
  
    try {
      // Dohvatanje informacija o trenutnom menadžeru
      const adminResult = await client.query('SELECT ime, prezime FROM hr_menadzeri WHERE id = $1', [req.korisnik.id]);
      const menadzer = adminResult.rows[0];
  
      if (!menadzer) {
        return res.status(404).send('Menadžer nije pronađen');
      }
  
      // Prosleđivanje podataka u prikaz
      res.render('kreirajKonkurs', { menadzer }); // Ovde se proslijeđuje objekat `menadzer`
    } catch (err) {
      console.error('Greška pri dohvatanju menadžera:', err.stack);
      res.status(500).send('Greška na serveru');
    }
  });
  
module.exports = router;
