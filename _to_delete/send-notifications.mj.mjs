// netlify/functions/send-notification.mjs
// Schickt Karo eine Info-Mail (Layout Wunderwerk Frau), wenn ein Fragebogen eingeht.
// Nur Mail an eine feste Adresse, nur bekannte Felder, gekürzte Texte, HTML wird maskiert.

const EMPFAENGER = "bauch.baby.beckenboden@gmail.com";
const ABSENDER = "Karo · Bauch · Baby · Beckenboden <kontakt@bauch-baby-beckenboden.com>";
const LOGO = "https://raw.githubusercontent.com/bauchbabybeckenboden-karo/Logos/main/Clitlogo-creme.png";

const TYPEN = { soyo: "Somatic Yoga" };

const LABELS = {
  eingereicht_am: "Eingereicht",
  name: "Name",
  email: "E-Mail",
  telefon: "Telefon",
  motivation: "Motivation",
  beschwerden: "Beschwerden",
  medikamente: "Medikamente",
  vorerfahrung: "Vorerfahrung",
  lebensphase: "Lebensphase",
  wuensche: "Wünsche",
  einverstaendnis: "Einverständnis",
  koerperbereiche_beachten: "Körperbereiche beachten",
  trauma: "Trauma",
  bereiche_vermeiden: "Bereiche vermeiden",
  stressreaktion: "Stressreaktion",
  fragebogen_typ: "Typ"
};

const NORMAL = [
  "eingereicht_am", "name", "email", "telefon", "motivation", "beschwerden",
  "medikamente", "vorerfahrung", "lebensphase", "wuensche", "einverstaendnis"
];
const WICHTIG = ["koerperbereiche_beachten", "trauma", "bereiche_vermeiden", "stressreaktion"];

const clean = (v, max = 3000) =>
  String(v ?? "").replace(/\r/g, "").trim().slice(0, max) || "-";

const esc = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/\n/g, "<br/>");

function wert(d, f) {
  if (f === "eingereicht_am") {
    const t = new Date(d.eingereicht_am);
    if (!isNaN(t)) {
      return t.toLocaleString("de-DE", { timeZone: "Europe/Berlin", dateStyle: "medium", timeStyle: "short" }) + " Uhr";
    }
  }
  return clean(d[f]);
}

const zeile = (label, w) =>
  `<tr>
    <td valign="top" style="padding:10px 12px 10px 0;width:170px;border-bottom:1px solid #E8D5D0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:20px;letter-spacing:1px;text-transform:uppercase;color:#8B6464;">${esc(label)}</td>
    <td valign="top" style="padding:10px 0;border-bottom:1px solid #E8D5D0;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:24px;color:#3D2B2B;">${esc(w)}</td>
  </tr>`;

function baueHtml(d, typ, name) {
  const normal = NORMAL.map((f) => zeile(LABELS[f], wert(d, f))).join("");
  const wichtig = WICHTIG.map((f) => zeile(LABELS[f], wert(d, f))).join("");
  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#F6EBE8;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#F6EBE8"><tr><td align="center" style="padding:30px 12px;">
<table role="presentation" width="620" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:620px;background:#F3E9E5;border:1px solid #E8D5D0;">
  <tr><td bgcolor="#8B6464" style="background:#8B6464;padding:30px 36px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
      <td valign="middle" style="padding:0 18px 0 0;"><img src="${LOGO}" width="44" height="88" alt="" style="display:block;width:44px;height:88px;border:0;"/></td>
      <td valign="middle">
        <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;letter-spacing:1px;text-transform:uppercase;color:#E8D5D0;">Neuer Fragebogen &middot; ${esc(typ)}</p>
        <h1 style="margin:6px 0 0;font-family:Georgia,'Times New Roman',serif;font-weight:normal;font-size:28px;line-height:34px;color:#FBF6F3;">${esc(name)}</h1>
      </td>
    </tr></table>
  </td></tr>
  <tr><td style="padding:28px 36px 8px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${normal}</table>
  </td></tr>
  <tr><td style="padding:12px 36px 32px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#E8D5D0" style="background:#E8D5D0;border-left:4px solid #8B6464;"><tr><td style="padding:14px 20px;">
      <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:20px;letter-spacing:1px;text-transform:uppercase;color:#8B6464;">Zum Beachten in der Stunde</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${wichtig}</table>
    </td></tr></table>
  </td></tr>
  <tr><td bgcolor="#8B6464" align="center" style="background:#8B6464;padding:26px 36px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:21px;color:#F3E9E5;text-align:center;">
    <div style="font-family:Georgia,serif;font-size:20px;letter-spacing:1px;color:#F3E9E5;">Wunderwerk Frau</div>
    <div style="width:140px;height:1px;background:#F3E9E5;margin:6px auto;line-height:1px;font-size:1px;">&nbsp;</div>
    <div style="font-size:11px;letter-spacing:3px;color:#F3E9E5;margin-bottom:12px;">BAUCH &middot; BABY &middot; BECKENBODEN</div>
    <a href="https://www.wunderwerk-frau.de" style="color:#F3E9E5;text-decoration:underline;">www.wunderwerk-frau.de</a>
  </td></tr>
</table>
</td></tr></table>
</body>
</html>`;
}

export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    return new Response("RESEND_API_KEY fehlt", { status: 500 });
  }

  let d;
  try {
    d = await req.json();
  } catch {
    return new Response("Ungueltige Daten", { status: 400 });
  }
  if (!d || typeof d !== "object" || !d.name || !d.email) {
    return new Response("Name und E-Mail fehlen", { status: 400 });
  }

  const typ = TYPEN[d.fragebogen_typ] || "Fragebogen";
  const name = clean(d.name, 80).replace(/\s+/g, " ");
  const betreff = `Neuer Fragebogen - ${typ} - ${name}`;

  const alle = [...NORMAL, ...WICHTIG, "fragebogen_typ"];
  const text = [`Neuer Fragebogen - ${typ}`, "", ...alle.map((f) => `${LABELS[f]}: ${wert(d, f)}`)].join("\n");

  const mail = {
    from: ABSENDER,
    to: [EMPFAENGER],
    subject: betreff,
    html: baueHtml(d, typ, name),
    text
  };
  const email = clean(d.email, 200);
  if (/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)) {
    mail.reply_to = email;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(mail)
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Resend Fehler:", res.status, err);
    return new Response("Mailversand fehlgeschlagen", { status: 502 });
  }
  return new Response("OK", { status: 200 });
};