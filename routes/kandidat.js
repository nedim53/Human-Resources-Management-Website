const express = require('express');
const router = express.Router();
const { autentifikujKorisnika, authenticateToken } = require('../Kontroler/autentifikacija');
const client = require('../db/db'); // Import povezivanja na bazu
const { generisiPDF } = require('../Kontroler/automatskiPDF');


router.post('/:konkursID/:kandidatID', authenticateToken, async (req, res) => {
  const { konkursID, kandidatID } = req.params;
  const { ocjena, komentar } = req.body;

  // Validacija ocjene
  if (!ocjena || ocjena < 1 || ocjena > 5) {
    return res.status(400).send('Ocjena mora biti između 1 i 5.');
  }

  try {
    // Provjera da li zapis postoji
    const postojeciZapis = await client.query(
      `SELECT * FROM ocjene_i_komentari 
       WHERE kandidat_id = $1 AND konkurs_id = $2`,
      [kandidatID, konkursID]
    );

    if (postojeciZapis.rows.length > 0) {
      // Ako zapis postoji, ažuriraj ga
      await client.query(
        `UPDATE ocjene_i_komentari
         SET ocjena = $1, komentar = $2
         WHERE kandidat_id = $3 AND konkurs_id = $4`,
        [ocjena, komentar, kandidatID, konkursID]
      );
    } else {
      // Ako zapis ne postoji, unesi novi
      await client.query(
        `INSERT INTO ocjene_i_komentari (kandidat_id, konkurs_id, ocjena, komentar)
         VALUES ($1, $2, $3, $4)`,
        [kandidatID, konkursID, ocjena, komentar]
      );
    }

    // Preusmjeri na "konkursHR" stranicu s odgovarajućim ID-om
    res.redirect(`/konkursHR/${konkursID}`);
  } catch (err) {
    console.error('Greška prilikom obrade podataka:', err);
    if (err.code === '23503') {
      res.status(400).send('Narušen je strani ključ.');
    } else {
      res.status(500).send('Greška na serveru.');
    }
  }
});

router.get('/pdf/:konkursID/:kandidatID', authenticateToken, generisiPDF);


router.get('/:konkursID/:kandidatID', authenticateToken, async (req, res) => {
  try {
    const { konkursID, kandidatID } = req.params;

    const rezultat = await client.query(
      `SELECT 
         pnk.ime AS kandidat_ime,
         pnk.prezime AS kandidat_prezime,
         pnk.grad AS kandidat_grad,
         pnk.email AS kandidat_email,
         pnk.cv_path AS kandidat_cv,
         pnk.vozacka_dozvola AS kandidat_vozacka,
         pnk.strani_jezik AS kandidat_jezik,
         pnk.iskustvo AS kandidat_iskustvo,
     --     oik.ocjena as ocjena,
       --  oik.komentar as komentar,
         pnk.junior,
         pnk.medior,
         pnk.senior,
         pnk.vss as srednja_skola,
         pnk.vss_vss as fakultet,
         k.kompanija AS konkurs_kompanija,
         k.naziv AS konkurs_naziv,
         k.ime_hr,
         k.prezime_hr,
         k.datum AS konkurs_datum,
         k.opis AS konkurs_opis,
         k.informacija AS konkurs_informacija,
         k.zadaci AS konkurs_zadaci,
         k.napomena AS konkurs_napomena,
         k.kontakt_email,
         k.kontakt_tel
       FROM prijava_na_konkurs pnk
       JOIN konkurs k ON pnk.konkurs_id = k.id
        join korisnici k2 on pnk.korisnik_id =k2.id 
              --  join ocjene_i_komentari oik on oik.kandidat_id  = pnk.korisnik_id 
       WHERE k.id = $1 AND k2.id = $2;`,
      [konkursID, kandidatID]
    );

    const ocjenaRez = await client.query('select ocjena, komentar from ocjene_i_komentari oik where kandidat_id = $1 and konkurs_id = $2; ',[kandidatID,konkursID]);
    const ocjene = ocjenaRez.rows[0] || { ocjena: "/", komentar: "/" };

    if (rezultat.rows.length === 0) {
      return res.status(404).send('Prijava nije pronađena.');
    }

    res.render('kandidat', { kandidat: rezultat.rows[0] ,konkursID,kandidatID,ocjene});
  } catch (err) {
    console.error('Greška pri dohvatanju podataka:', err.stack);
    res.status(500).send('Greška na serveru');
  }
});


module.exports = router;