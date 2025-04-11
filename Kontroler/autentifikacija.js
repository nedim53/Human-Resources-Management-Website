const jwt = require('jsonwebtoken');
const client = require('../db/db'); 
const crypto = require('crypto');


const SECRET_KEY = 'tajna_kljuc';

// Funkcija za autentifikaciju korisnika
async function autentifikujKorisnika(req, res) {
  const { email, pswd } = req.body;

  try {
    // Provjera u tabeli korisnici
    const korisniciResult = await client.query('SELECT * FROM korisnici WHERE email = $1', [email]);

    if (korisniciResult.rows.length === 0) {
      // Provjera u tabeli HR menadžeri
      const menadzeriResult = await client.query('SELECT * FROM hr_menadzeri WHERE email = $1', [email]);

      if (menadzeriResult.rows.length === 0) {
        return res.status(404).send('Korisnik ili menadžer ne postoji');
      } else {
        const menadzer = menadzeriResult.rows[0];

        // Provjerite šifru HR menadžera
        const hashedInputPassword = crypto.createHash('md5').update(pswd).digest('hex');
        const validPassword = hashedInputPassword === menadzer.sifra;
        if (!validPassword) {
          return res.status(401).send('Pogrešna lozinka');
        }

        // Generišite token za menadžera
        const token = jwt.sign(
          { id: menadzer.id, ime: menadzer.ime, prezime: menadzer.prezime, uloga: 'hr_menadzer', email: menadzer.email },
          SECRET_KEY,
          { expiresIn: '1h' }
        );

        res.cookie('accessToken', token, { httpOnly: true, secure: false });
        return res.redirect('/admin');
      }
    } else {
      const korisnik = korisniciResult.rows[0];

      // Provjerite šifru korisnika
      const hashedInputPassword = crypto.createHash('md5').update(pswd).digest('hex');
      const validPassword = hashedInputPassword === korisnik.sifra;
      if (!validPassword) {
        return res.status(401).send('Pogrešna lozinka');
      }

      // Generišite token za korisnika
      const token = jwt.sign(
        { id: korisnik.id, ime: korisnik.ime, prezime: korisnik.prezime, uloga: 'korisnik', email: korisnik.email },
        SECRET_KEY,
        { expiresIn: '1h' }
      );

      res.cookie('accessToken', token, { httpOnly: true, secure: false });
      return res.redirect('/home');
    }
  } catch (err) {
    console.error('Greška pri provjeri korisnika:', err.stack);
    res.status(500).send('Greška na serveru');
  }
}
  

  async function chat(req, res, next) {
    const { posiljalac, primalac, poruka } = req.body;
  
    // Proverite da li email_hr i email_k postoje u telu zahteva
    if (!posiljalac || !primalac) {
      return res.status(400).send('Oba emaila su obavezna');
    }
  
    try {
      // Provera da li HR menadžer postoji u bazi
      const provjeraEmailHrMenadzera = await client.query('SELECT email FROM hr_menadzeri WHERE email = $1 union select email from korisnici where email = $1', [posiljalac]);
      
      // Provera da li korisnik postoji u bazi
      const provjeraEmailKorisnika = await client.query('SELECT email FROM korisnici WHERE email = $1 union select email from hr_menadzeri where email =$1', [primalac]);
  
      // Ako jedan od njih ne postoji
      if (provjeraEmailHrMenadzera.rows.length === 0 || provjeraEmailKorisnika.rows.length === 0) {
        return res.status(404).send('Korisnik ili menadžer ne postoji');
      }
  
      // Ako su oboje pronađeni, upisujemo poruku u bazu
      await client.query('INSERT INTO poruke (posiljalac, primalac, poruka, datum_slanja) VALUES ($1, $2, $3, NOW())', [posiljalac, primalac, poruka]);
  
      res.redirect('back'); 
    } catch (err) {
      console.error('Greška pri provjeri korisnika:', err.stack);
      res.status(500).send('Greška na serveru');
    }
  }
  
// Middleware za autentifikaciju tokena
const authenticateToken = (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return res.redirect('/'); // Preusmjeri ako token ne postoji
  }

  // Provjera validnosti tokena
  jwt.verify(token, SECRET_KEY, (err, korisnik) => {
    if (err) {
      return res.status(403).send('Nevažeći token');
    }

    req.korisnik = korisnik; // Dekodirani korisnik iz tokena
    next();
  });
};

module.exports = { autentifikujKorisnika, authenticateToken ,chat};
