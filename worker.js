const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}

function randomToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: CORS });
    }

    // --- MAGIC LINK : envoyer le lien ---
    if (url.pathname === '/auth/send' && request.method === 'POST') {
      const { email } = await request.json();
      const allowed = (env.ALLOWED_EMAILS || '').split(',').map(e => e.trim().toLowerCase());

      if (!allowed.includes(email.toLowerCase())) {
        return json({ error: 'Email non autorisé.' }, 403);
      }

      const token = randomToken();
      await env.MAGIC_TOKENS.put(token, email, { expirationTtl: 900 }); // 15 min

      const link = `https://kinebilan.pages.dev/?token=${token}`;

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'onboarding@resend.dev',
          to: email,
          subject: 'Votre lien de connexion PhysioLab',
          html: `
            <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px">
              <h2 style="color:#126477">PhysioLab</h2>
              <p>Cliquez sur le bouton ci-dessous pour accéder à votre espace. Ce lien est valable <strong>15 minutes</strong>.</p>
              <a href="${link}" style="display:inline-block;margin:24px 0;padding:14px 28px;background:#126477;color:white;border-radius:8px;text-decoration:none;font-weight:bold">
                Accéder à PhysioLab
              </a>
              <p style="color:#888;font-size:12px">Si vous n'avez pas demandé ce lien, ignorez cet email.</p>
            </div>
          `,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        return json({ error: 'Erreur envoi email : ' + err }, 500);
      }

      return json({ ok: true });
    }

    // --- MAGIC LINK : vérifier le token ---
    if (url.pathname === '/auth/verify' && request.method === 'POST') {
      const { token } = await request.json();
      if (!token) return json({ error: 'Token manquant.' }, 400);

      const email = await env.MAGIC_TOKENS.get(token);
      if (!email) return json({ error: 'Lien invalide ou expiré.' }, 401);

      await env.MAGIC_TOKENS.delete(token);
      return json({ ok: true, email });
    }

    // --- PROXY ANTHROPIC ---
    if (url.pathname === '/' && request.method === 'POST') {
      const apiKey = env.ANTHROPIC_API_KEY;
      if (!apiKey) return json({ error: 'Clé API non configurée.' }, 500);

      try {
        const body = await request.json();
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify(body),
        });
        const data = await response.json();
        return json(data, response.status);
      } catch (e) {
        return json({ error: e.message }, 500);
      }
    }

    return json({ error: 'Not found' }, 404);
  },
};
