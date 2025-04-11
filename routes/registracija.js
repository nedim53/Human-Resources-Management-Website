const express = require('express');
var router = express.Router();
const pool = require('../db/db');
const crypto = require('crypto');

router.get('/', function (req, res, next) {
    res.render('registracija'); 
});


router.post('/', async function (req, res, next) {
    const { ime, prezime, email, sifra ,godine,adresa,telefon,grad} = req.body;

    try {
        // Provjera da li korisnik već postoji
        const korisnikPostoji = await pool.query('SELECT * FROM korisnici WHERE email = $1', [email]);
        if (korisnikPostoji.rows.length > 0) {
            res.status(400).send('Korisnik sa ovim email-om već postoji.');
        } else {
            // Unos novog korisnika u bazu
            const hashedPassword = crypto.createHash('md5').update(sifra).digest('hex');

            await pool.query(
                'INSERT INTO korisnici (ime, prezime, email, sifra, adresa, telefon,grad,godine) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
                [ime, prezime, email, hashedPassword,adresa,telefon,grad,godine]
            );
            res.redirect('/'); // Preusmjeravanje na početnu stranicu nakon registracije
        }
    } catch (err) {
        console.error('Greška prilikom registracije:', err);
        res.status(500).send('Greška na serveru.');
    }
});

module.exports = router;
