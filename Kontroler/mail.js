const nodemailer = require('nodemailer');

// Kreiraj transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // Ili 'smtp.example.com' za prilagođeni SMTP server
  auth: {
    user: 'zec.nedim13@gmail.com', // Vaša email adresa
    pass: 'zqja ziqi fncr qhnp'    // Aplikacijska lozinka ili lozinka za vaš email
},
tls: {
  rejectUnauthorized: false // Dodaj ovu opciju
}
});

// Funkcija za slanje email-a
const posaljiEmail = async (primalac, naslov, sadrzaj) => {
  const mailOptions = {
    from: 'zec.nedim13@gmail.com', // Pošiljalac
    to: primalac,                 // Primalac
    subject: naslov,              // Naslov email-a
    text: sadrzaj                 // Tekstualni sadržaj email-a
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email poslat:', info.response);
  } catch (error) {
    console.error('Greška pri slanju email-a:', error);
    throw error; // Propustite grešku dalje
  }
};

module.exports = { posaljiEmail };
