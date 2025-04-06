const multer = require('multer');
const path = require('path');

// Konfiguracija za čuvanje fajlova
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Putanja gde će fajlovi biti sačuvani
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Dodavanje timestamp-a da bi ime fajla bilo jedinstveno
  }
});

// Filtriranje fajlova kako bi se dozvolili samo PDF i DOCX formati
const fileFilter = (req, file, cb) => {
    const fileTypes = /pdf|docx|xlsx|txt|jpg|jpeg|png|gif|doc/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = fileTypes.test(file.mimetype);

  if (extname && mimeType) {
    return cb(null, true);
  } else {
    cb(new Error('Greška! Pogrešan tip fajla'), false);
  }
};

// Kreiramo multer instancu sa postavkama
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // Maksimalna veličina fajla (10MB)
});

module.exports = upload;
