const express = require('express');
const router = express.Router();
const { autentifikujKorisnika, authenticateToken, chat } = require('../Kontroler/autentifikacija');
const { posaljiEmail } = require('../Kontroler/mail'); // Import Nodemailer funkcije
const client = require('../db/db');

router.post('/sakrij', authenticateToken, async (req, res) => {
  const { korisnik_id, konkurs_id, id_hr } = req.body;

  if (!korisnik_id || !konkurs_id || !id_hr) {
    return res.status(400).send('Nedostaju potrebni podaci.');
  }

  try {
    // Ažurirajte status da označite kandidata kao "sakrivenog"
    await client.query(
      `UPDATE prijava_na_konkurs
       SET sakriven = true
       WHERE korisnik_id = $1 AND konkurs_id = $2`,
      [korisnik_id, konkurs_id]
    );

    res.redirect('/chat_hr');
  } catch (err) {
    console.error('Greška pri skrivanju kandidata:', err.stack);
    res.status(500).send('Greška na serveru.');
  }
});


// POST zahtev za ažuriranje statusa prijave kandidata
router.post('/status', authenticateToken, async (req, res) => {
  // Prilagođavanje destrukturacije prema dolaznim podacima
  const { korisnik_id, konkurs_id, id_hr, status_prijave, termin_intervjua, komentar_intervjua } = req.body;
  let naslov = ''; // Definiši početnu vrijednost

  // Preimenuj varijable za korištenje u kodu
  const kandidat_id = korisnik_id;
  const hr_id = id_hr;

  if (!kandidat_id || !konkurs_id || !hr_id) {
    return res.status(400).send('Obavezni podaci nedostaju.');
  }
  
  // Inicijalizacija poruke
  let poruka = '';

  try {
    if (status_prijave === 'pozvan-na-intervju') {
      poruka = `Čestitamo, pozvani ste na intervju, u terminu: ${termin_intervjua}`;
    } else if (status_prijave === 'prosao') {
      poruka = 'Čestitamo! Prošli ste intervju i uspješno ste dobili posao.';
    } else if (status_prijave === 'odbijen') {
      poruka = 'Nažalost, niste prošli intervju. Hvala na učešću!';
    }else {
      poruka = 'Prošli ste u drugi krug, ostat ćemo u kontaktu!';
    }

    // Dodavanje poruke direktno u bazu
    await client.query(
      `INSERT INTO poruke (posiljalac, primalac, poruka, datum_slanja) 
       VALUES (
         (SELECT email FROM hr_menadzeri WHERE id = $1),
         (SELECT email FROM korisnici WHERE id = $2),
         $3,
         NOW()
       )`,
      [id_hr, korisnik_id, poruka]
    );

    const primalac = await client.query('SELECT email FROM korisnici WHERE id = $1', [kandidat_id]);
    await posaljiEmail(primalac.rows[0].email, naslov, poruka);
    
    // Provjeri da li postoji zapis u bazi
    const postojeciZapis = await client.query(
      `SELECT * FROM status_prijave_kandidata 
       WHERE kandidat_id = $1 AND konkurs_id = $2 AND hr_id = $3`,
      [kandidat_id, konkurs_id, hr_id]
    );

    if (postojeciZapis.rows.length > 0) {
      // Ako postoji zapis, ažuriraj ga
      await client.query(
        `UPDATE status_prijave_kandidata
         SET status_prijave = $1, termin_intervjua = $2, komentar_intervjua = $3
         WHERE kandidat_id = $4 AND konkurs_id = $5 AND hr_id = $6`,
        [status_prijave, termin_intervjua || null, komentar_intervjua || null, kandidat_id, konkurs_id, hr_id]
      );
    } else {
      // Ako zapis ne postoji, dodaj novi
      await client.query(
        `INSERT INTO status_prijave_kandidata (kandidat_id, konkurs_id, hr_id, status_prijave, termin_intervjua, komentar_intervjua)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [kandidat_id, konkurs_id, hr_id, status_prijave, termin_intervjua || null, komentar_intervjua || null]
      );
    }

    res.redirect('/chat_hr');
  } catch (greska) {
    console.error('Greška pri unosu ili ažuriranju statusa prijave:', greska.stack);
    res.status(500).send('Greška na serveru.');
  }
});




// POST zahtev za slanje poruke
router.post('/', authenticateToken, async (req, res) => {
  const { posiljalac, primalac, poruka } = req.body;

  if (!posiljalac || !primalac || !poruka) {
    return res.status(400).send('Svi podaci su obavezni.');
  }

  try {
    await client.query(
      'INSERT INTO poruke (posiljalac, primalac, poruka, datum_slanja) VALUES ($1, $2, $3, NOW())',
      [posiljalac, primalac, poruka]
    );

    res.redirect('/chat_hr');
  } catch (error) {
    console.error('Greška pri slanju poruke:', error.stack);
    res.status(500).send('Greška na serveru.');
  }
});

// GET zahtev za prikaz svih poruka između korisnika i HR menadžera
router.get('/', authenticateToken, async (req, res) => {
  
    const emailHr = req.korisnik.email;  
    const idHr = req.korisnik.id;
    try {
      const listaRez = await client.query('select k2.ime,k2.prezime, k.kompanija ,k.naziv,k.datum,k.id_hr,pnk.konkurs_id,pnk.korisnik_id from konkurs k join hr_menadzeri hm on hm.id = k.id_hr join prijava_na_konkurs pnk on pnk.konkurs_id = k.id join korisnici k2 on k2.id = pnk.korisnik_id  WHERE hm.id = $1 AND (pnk.sakriven IS NULL OR pnk.sakriven = false);',[idHr]);


      const porukeRez = await client.query(
        'SELECT * FROM poruke WHERE posiljalac = $1 OR primalac = $1 ORDER BY datum_slanja desc',
        [emailHr]
      );
      const statusi = await client.query('SELECT spk.kandidat_id, spk.konkurs_id, spk.hr_id,spk.status_prijave, spk.komentar_intervjua FROM status_prijave_kandidata spk join konkurs k on k.id = spk.konkurs_id join korisnici k2 on k2.id = spk.kandidat_id where spk.hr_id = $1 ;',[idHr]);
      
      const poruke = porukeRez.rows;

      res.render('chat_hr', { korisnik: req.korisnik, poruke: poruke , lista: listaRez.rows, status:statusi.rows});
    } catch (err) {
      console.error('Greška pri dohvatanju poruka:', err.stack);
      res.status(500).send('Greška na serveru');
    }
  });
  

module.exports = router;
