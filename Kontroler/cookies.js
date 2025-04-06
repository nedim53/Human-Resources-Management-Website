const cookieParser = require('cookie-parser');

// Postavljanje cookies
module.exports.setCookies = (res, email, password) => {
  // Postavljanje email i password u cookies sa opcijama (maxAge, httpOnly)
  res.cookie('user_email', email, {
    maxAge: 900000,    // 15 minuta
    httpOnly: true,    // Zaštita od pristupa sa JavaScript-a
    secure: false,     // Postavite na true ako koristite HTTPS
  });

  res.cookie('user_password', password, {
    maxAge: 900000,    // 15 minuta
    httpOnly: true,    // Zaštita od pristupa sa JavaScript-a
    secure: false,     // Postavite na true ako koristite HTTPS
  });
};

// Dohvat cookies
module.exports.getCookies = (req) => {
  // Pristupanje cookies
  const { user_email, user_password } = req.cookies;

  // Vraćanje objekta sa korisničkim podacima iz cookies
  return { user_email, user_password };
};
