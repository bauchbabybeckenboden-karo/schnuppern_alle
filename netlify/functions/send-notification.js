const RESEND_API_URL = 'https://api.resend.com/emails';
const ABSENDER      = 'Karo · Bauch · Baby · Beckenboden <onboarding@resend.dev>';
const KAROLINE_MAIL = 'bauch.baby.beckenboden@gmail.com';

// Allgemeine Fragebogen-Typen (fuer andere Pakete/Projekte mitgenutzt)
const KURS_TITEL = {
  koerpermitte:   'Somatisches Yoga · Körpermitte & Beckenboden',
  mamafit:        'Mamafit',
  schwangerfit:   'Schwangerfit',
  soyo:           'Somatisches Yoga (Vollversion)',
  trageberatung:  'Trageberatung',
  schnupperbogen: 'Schnupperstunde',
};

// Anzeigenamen fuer die Kurswahl im Schnupperbogen (Feld "kurs")
const SCHNUPPER_KURS_NAMEN = {
  schwangerfit:                   'Schwangerfit',
  mamafit_2termine:               'Mamafit (2 Termine)',
  mamafit_1termin:                'Mamafit (1 Termin)',
  somatic_koerpermitte_2termine:  'Somatic Körpermitte & Beckenboden (2 Termine)',
  somatic_koerpermitte_1termin:   'Somatic Körpermitte & Beckenboden (1 Termin)',
  somatic_yoga_2termine:          'Somatic Yoga (2 Termine)',
  somatic_yoga_1termin:           'Somatic Yoga (1 Termin)',
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

  const { name, fragebogen_typ, kurs } = data;

  let kurstitel = KURS_TITEL[fragebogen_typ] || fragebogen_typ || 'Unbekannter Kurs';
  if (fragebogen_typ === 'schnupperbogen') {
    kurstitel = 'Schnupperstunde – ' + (SCHNUPPER_KURS_NAMEN[kurs] || kurs || 'Kurs offen');
  }

  const RESEND_KEY = process.env.RESEND_API_KEY;

  if (!RESEND_KEY) {
    return { statusCode: 500, body: 'RESEND_API_KEY fehlt' };
  }

  const zeilen = Object.entries(data)
    .filter(([k]) => k !== 'packliste_link')
    .map(([k, v]) => `${k}: ${v || '-'}`)
    .join('\n');

  try {
    const resendRes = await fetch(RESEND_API_URL, {
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

    if (!resendRes.ok) {
      const errText = await resendRes.text();
      console.error('Resend-Fehler:', resendRes.status, errText);
      return { statusCode: 502, body: 'Mail-Versand fehlgeschlagen: ' + errText };
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    console.error('Resend-Netzwerkfehler:', err);
    return { statusCode: 500, body: 'Mail-Versand fehlgeschlagen' };
  }
};
