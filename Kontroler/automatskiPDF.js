const PDFDocument = require('pdfkit');
const client = require('../db/db'); 

async function generisiPDF(req, res) {
  try {
    const { konkursID, kandidatID } = req.params;

    // Dohvati podatke o kandidatu i konkursu
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
         oik.ocjena AS ocjena,
         oik.komentar AS komentar,
         pnk.junior,
         pnk.medior,
         pnk.senior,
         pnk.vss AS srednja_skola,
         pnk.vss_vss AS fakultet,
         k.kompanija AS konkurs_kompanija,
         k.naziv AS konkurs_naziv,
         k.datum AS konkurs_datum,
         k.zadaci as konkurs_zadaci,
         k.grad as konkurs_grad,
          k.kontakt_email as konkurs_kontakt_email,
         k.kontakt_tel as konkurs_kontakt_tel
       FROM prijava_na_konkurs pnk
       JOIN konkurs k ON pnk.konkurs_id = k.id
       JOIN ocjene_i_komentari oik ON oik.kandidat_id = pnk.korisnik_id
       WHERE k.id = $1 AND pnk.korisnik_id = $2;`,
      [konkursID, kandidatID]
    );

    if (rezultat.rows.length === 0) {
      return res.status(404).send('Podaci nisu pronađeni.');
    }

    const kandidat = rezultat.rows[0];

    // Generisanje PDF-a
    const doc = new PDFDocument();
    res.setHeader('Content-Disposition', 'attachment; filename=kandidat.pdf');
    res.setHeader('Content-Type', 'application/pdf');

    doc.pipe(res);

    // Naslov
    doc.fontSize(20).text('Izvještaj o kandidatu', { align: 'center' }).moveDown();
    
    // Detalji o kandidatu
    doc.fontSize(14).text(`Ime: ${kandidat.kandidat_ime}`);
    doc.text(`Prezime: ${kandidat.kandidat_prezime}`);
    doc.text(`Email: ${kandidat.kandidat_email}`);
    doc.text(`Grad: ${kandidat.kandidat_grad}`);
    doc.text(`Strani jezik: ${kandidat.kandidat_jezik}`);
    doc.text(`Vozacka dozvola: ${kandidat.kandidat_vozacka ? 'Da' : 'Ne'}`);
    doc.text(`Iskustvo: ${kandidat.kandidat_iskustvo}`);
    doc.text(`Ocjena: ${kandidat.ocjena}`);
    doc.text(`Komentar: ${kandidat.komentar}`);

    // Pozicija
    const pozicija = [];
    if (kandidat.junior) pozicija.push('Junior');
    if (kandidat.medior) pozicija.push('Medior');
    if (kandidat.senior) pozicija.push('Senior');
    doc.text(`Pozicija: ${pozicija.join(', ')}`);

    // Detalji o konkursu
    doc.moveDown();
    doc.fontSize(16).text('Detalji o konkursu', { underline: true }).moveDown();
    doc.fontSize(14).text(`Konkurs: ${kandidat.konkurs_naziv}`);
    doc.text(`Kompanija: ${kandidat.konkurs_kompanija}`);
    doc.text(`Datum: ${new Date(kandidat.konkurs_datum).toLocaleDateString()}`);
    doc.text(`Grad iz kojeg se izvrsava posao: ${kandidat.konkurs_grad}`);
    doc.text(`Kontakt email: ${kandidat.konkurs_kontakt_email}`);
    doc.text(`Kontakt telefon: ${kandidat.konkurs_kontakt_tel}`);


    // Zatvori PDF dokument
    doc.end();
  } catch (err) {
    console.error('Greška pri generisanju PDF-a:', err);
    res.status(500).send('Greška na serveru.');
  }
}

module.exports = { generisiPDF };
