const express = require('express');
const router = express.Router();
const { autentifikujKorisnika, authenticateToken } = require('../Kontroler/autentifikacija');
const client = require('../db/db');


// Ruta za "konkursHR" stranicu
router.get('/:id', authenticateToken, async (req, res) => {
    if (!req.korisnik || req.korisnik.uloga !== 'hr_menadzer') {
        return res.status(403).send('Nemate prava pristupa ovoj stranici');
    }

    try {

        const konkursID = req.params.id;
        const sort = req.query.sort;

        const prosjecnoRez = await client.query('select avg(ocjena) as prosjecna_ocjena ,konkurs_id from ocjene_i_komentari oik where konkurs_id = $1 group by konkurs_id ;',
            [konkursID]
        );
        
        let prosjek = prosjecnoRez.rows[0]; 
        if (!prosjek) {
            prosjek = { prosjecna_ocjena: "Nema ocjena" }; 
        }
        

        // Dohvati informacije o konkursu
        const konkursResult = await client.query('SELECT * FROM konkurs WHERE id = $1', [konkursID]);
        const konkurs = konkursResult.rows[0];

        // Definiši sortiranje na osnovu parametra
        let orderBy = '';
        if (sort === 'najbolji') {
            orderBy = 'ORDER BY ok.ocjena DESC NULLS LAST';
        } else if (sort === 'najgori') {
            orderBy = 'ORDER BY ok.ocjena ASC NULLS LAST';
        } else if (sort === 'ime_az') {
            orderBy = 'ORDER BY k.ime ASC';
        } else if (sort === 'ime_za') {
            orderBy = 'ORDER BY k.ime DESC';
        }

        // Dohvati prijave zajedno s prosječnom ocjenom
        const prijaveResult = await client.query(
            `SELECT 
                pnk.*, 
                k.ime, 
                k.prezime, 
                k.email, 
                k.grad, 
                k.telefon, 
                k.id,
                ok.ocjena as ocjena
             FROM prijava_na_konkurs pnk
             JOIN korisnici k ON k.id = pnk.korisnik_id
                          join konkurs k2 on k2.id = pnk.konkurs_id 
             LEFT JOIN ocjene_i_komentari ok ON ok.kandidat_id = k.id AND ok.konkurs_id = pnk.konkurs_id
             WHERE pnk.konkurs_id = $1
             GROUP BY pnk.id, k.id,pnk.korisnik_id,ok.ocjena,k2.datum
             ${orderBy}`,
            [konkursID]
        );
        const prijave = prijaveResult.rows;

        // Renderuj stranicu
        res.render('konkursHR', { korisnik: req.korisnik, konkurs, prijave, konkursID,prosjek });
    } catch (err) {
        console.error('Greška pri dohvatanju konkursa:', err.stack);
        res.status(500).send('Greška na serveru');
    }
});


module.exports = router;
