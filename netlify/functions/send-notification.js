const RESEND_API_URL = 'https://api.resend.com/emails';
const ABSENDER      = 'Karo · Bauch · Baby · Beckenboden <onboarding@resend.dev>';
const KAROLINE_MAIL = 'bauch.baby.beckenboden@gmail.com';

const KURS_TITEL = {
  koerpermitte:  'Somatisches Yoga · Körpermitte & Beckenboden',
  mamafit:       'Mamafit',
  schwangerfit:  'Schwangerfit',
  soyo:          'Somatisches Yoga (Vollversion)',
  trageberatung: 'Trageberatung',
};

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let data;
  try {
    data = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: 'Ungültiges JSON' };
  }

  const { name, fragebogen_typ } = data;
  const kurstitel = KURS_TITEL[fragebogen_typ] || fragebogen_typ || 'Unbekannter Kurs';
  const RESEND_KEY = process.env.RESEND_API_KEY;

  if (!RESEND_KEY) {
    return { statusCode: 500, body: 'RESEND_API_KEY fehlt' };
  }

  const zeilen = Object.entries(data)
    .filter(([k]) => k !== 'packliste_link')
    .map(([k, v]) => `${k}: ${v || '-'}`)
    .join('\n');

  try {
    await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: ABSENDER,
        to: [KAROLINE_MAIL],
        subject: `Neuer Fragebogen - ${kurstitel} - ${name}`,
        text: `Neuer Fragebogen - ${kurstitel}\n\n${zeilen}`,
      }),
    });

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    console.error('Resend-Fehler:', err);
    return { statusCode: 500, body: 'Mail-Versand fehlgeschlagen' };
  }
};
