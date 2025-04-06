const { autentifikujKorisnika, authenticateToken } = require('../Kontroler/autentifikacija');
const client = require('../db/db');

const uzmiPodatkeAdmin = async (req, res) => {
  
  if (req.korisnik?.uloga !== 'hr_menadzer') {
    console.warn('Pristup odbijen: Korisnik nema ulogu hr_menadzer');
    return res.status(403).send('Nemate prava pristupa ovoj stranici');
  }

  try {

    // Dohvatanje informacija o trenutnom menadžeru
    const adminResult = await client.query(
      'SELECT ime, prezime FROM hr_menadzeri WHERE id = $1',
      [req.korisnik.id]
    );

    const menadzer = adminResult.rows[0];
    if (!menadzer) {
      console.warn('Menadžer nije pronađen za ID:', req.korisnik.id);
      return res.status(404).send('Menadžer nije pronađen');
    }


    // Statistika po gradu
    const statistikaGrad = await client.query(`
      SELECT k.grad, COUNT(*) AS broj
      FROM korisnici k
      JOIN prijava_na_konkurs pnk ON pnk.korisnik_id = k.id
      JOIN konkurs k2 ON k2.id = pnk.konkurs_id
      WHERE k2.ime_hr = $1 AND k2.prezime_hr = $2
      GROUP BY k.grad
    `, [menadzer.ime, menadzer.prezime]);

    // Statistika obrazovanja
    const statistikaObrazovanje = await client.query(`
      SELECT k.obrazovanje AS nivo_obrazovanja, COUNT(*) AS broj
      FROM korisnici k
      JOIN prijava_na_konkurs pnk ON pnk.korisnik_id = k.id
      JOIN konkurs k2 ON k2.id = pnk.konkurs_id
      WHERE k2.ime_hr = $1 AND k2.prezime_hr = $2
      GROUP BY k.obrazovanje
    `, [menadzer.ime, menadzer.prezime]);

    // Statistika uspjeha
    const statistikaUspjeh = await client.query(`
      SELECT pnk.konkurs_id, 
             COUNT(*) FILTER (WHERE spk.status_prijave = 'pozvan-na-intervju') AS pozvani,
             COUNT(*) AS ukupno
      FROM prijava_na_konkurs pnk
      JOIN konkurs k2 ON k2.id = pnk.konkurs_id
      JOIN status_prijave_kandidata spk ON spk.konkurs_id = k2.id
      WHERE k2.ime_hr = $1 AND k2.prezime_hr = $2
      GROUP BY pnk.konkurs_id
    `, [menadzer.ime, menadzer.prezime]);

    // SQL upit za konkurse
    let query = `
      SELECT 
        k.id,
        k.naziv,
        k.datum,
        k.kompanija,
        k.opis,
        k.ime_hr,
        k.prezime_hr,
        COUNT(pnk.korisnik_id) AS broj_prijava
      FROM 
        konkurs k
      LEFT JOIN 
        prijava_na_konkurs pnk 
      ON 
        k.id = pnk.konkurs_id
      WHERE 
        k.ime_hr = $1 AND k.prezime_hr = $2
    `;
    let queryParams = [menadzer.ime, menadzer.prezime];

    // Dodavanje filtera po nazivu konkursa
    if (req.query.naziv) {
      query += ' AND LOWER(k.naziv) LIKE LOWER($3)';
      queryParams.push(`%${req.query.naziv}%`);
    }

    // Dodavanje filtera po zahtjevima
    if (req.query.zahtjevi) {
      query += ` AND k.${req.query.zahtjevi} = true`;
    }

    // Grupisanje konkursa za agregaciju broja prijava
    query += `
      GROUP BY 
        k.id, k.naziv, k.datum, k.kompanija, k.opis, k.ime_hr, k.prezime_hr
    `;

    // Dodavanje sortiranja po datumu
    if (req.query.datumSort) {
      const datumSort = req.query.datumSort === 'asc' ? 'ASC' : 'DESC';
      query += ` ORDER BY k.datum ${datumSort}`;
    }

    const konkursiOdHrMenadzera = await client.query(query, queryParams);
    const konkursi = konkursiOdHrMenadzera.rows;

    // Renderovanje podataka na stranici
    res.render('admin', {
      menadzer,
      konkursi,
      pretraga: req.query.naziv,
      datumSort: req.query.datumSort,
      zahtjevi: req.query.zahtjevi,
      statistikaGrad: statistikaGrad.rows,
      statistikaObrazovanje: statistikaObrazovanje.rows,
      statistikaUspjeh: statistikaUspjeh.rows
    });
  } catch (err) {
    console.error('Greška pri dohvatanju menadžera:', err.stack);
    res.status(500).send('Greška na serveru');
  }
};

module.exports = { uzmiPodatkeAdmin };
