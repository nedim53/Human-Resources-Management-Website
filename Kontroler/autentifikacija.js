const { pool } = require('../db');
const jwt = require('jsonwebtoken');

const prijava = async (req, res) => {
    const { email, pswd } = req.body;

    try {
        // Provjera HR menadžera
        const hrResult = await pool.query(
            'SELECT * FROM hr_menadzeri WHERE email = $1 AND sifra = $2',
            [email, pswd]
        );

        if (hrResult.rows.length > 0) {
            const hrMenadzer = hrResult.rows[0];
            const token = jwt.sign(
                { id: hrMenadzer.id, role: 'hr' },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );
            req.session.token = token;
            req.session.user = {
                id: hrMenadzer.id,
                email: hrMenadzer.email,
                role: 'hr'
            };
            return res.redirect('/admin');
        }

        // Provjera običnog korisnika
        const userResult = await pool.query(
            'SELECT * FROM korisnici WHERE email = $1 AND sifra = $2',
            [email, pswd]
        );

        if (userResult.rows.length > 0) {
            const user = userResult.rows[0];
            const token = jwt.sign(
                { id: user.id, role: 'user' },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );
            req.session.token = token;
            req.session.user = {
                id: user.id,
                email: user.email,
                role: 'user'
            };
            return res.redirect('/home');
        }

        res.status(401).json({ error: 'Neispravni podaci za prijavu' });
    } catch (err) {
        console.error('Greška prilikom prijave:', err);
        res.status(500).json({ error: 'Greška na serveru' });
    }
};

module.exports = {
    prijava
};
