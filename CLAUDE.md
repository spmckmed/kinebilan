# PhysioLab — Contexte de session

## Ce qu'est ce projet
Application web **single-file** (`index.html`) de gestion de bilans kinésithérapiques vestibulaires.
Utilisateur unique : Sébastien Mackay, masseur-kinésithérapeute à Bayeux.

---

## Architecture technique

| Composant | Technologie | URL |
|-----------|-------------|-----|
| Front-end | `index.html` seul (Tailwind CDN, Material Symbols, Public Sans/Newsreader) | https://kinebilan.pages.dev |
| Hébergement | Cloudflare Pages (auto-deploy depuis GitHub `spmckmed/kinebilan`) | — |
| Back-end / proxy | Cloudflare Worker (`worker.js`) | https://kinebilan-worker.sp-mck-kine.workers.dev |
| Auth | Magic link par email via Resend (token KV 15 min) | — |
| IA | Anthropic API (`claude-sonnet-4-20250514`) via le Worker proxy | — |
| Stockage données | `localStorage` (clé `kinebilan_patients`) | — |
| Secrets Worker | `ANTHROPIC_API_KEY`, `RESEND_API_KEY` (via `wrangler secret put`) | — |
| Var Worker | `ALLOWED_EMAILS = "sp.mck.kine@gmail.com"` | — |
| KV namespace | `MAGIC_TOKENS` (id: `4e58b15778094e5b97b72970b24b989f`) | — |

**`wrangler.toml`** — account_id : `71dff7636ec9bac7192e7b6f2f6a87f2`

---

## État actuel (session 2026-04-07)

### Fonctionnel
- Auth magic link (email → lien → sessionStorage `kb_auth=1`)
- Création / ouverture / archivage de dossiers patients
- Une seule zone de transcription (B1+B2 fusionnés) → un bouton "Générer le CR avec l'IA"
- L'IA extrait les données patient (`PATIENT:{...}` en première ligne) et génère le CR en HTML
- Captures optionnelles (VVS, HCTSIB) avec preview
- Export PDF via `window.open` + `window.print()` — actif dès que le CR est généré
- Stepper 4 étapes : En cours → Captures → Export → Archivé
- Bouton "Sauvegarder" + "Archiver" dans la top-bar du bilan

### Ce qui vient d'être corrigé
- **Bug critique** : `getPatient()` et `savePatients()` avaient été supprimées par le script de refactoring `fix_mods.js` (remplacement trop large de `ouvrirPatient`). Résultat : tous les boutons crashaient silencieusement. Corrigé en commit `99aa244`.

---

## Décisions techniques importantes

1. **Pas de backticks dans le JS injecté via Node.js** — Toute injection de JS dans le HTML via des scripts Node se fait avec `'` + concaténation. Les template literals injectés causent des bugs d'échappement (`\`` dans le fichier final).

2. **Modification du fichier par scripts Node** — Tous les changements significatifs passent par des scripts `fix_*.js` qui : lisent le fichier, normalisent les fins de ligne (`\r\n` → `\n`), font les remplacements par `indexOf`/`slice`, et réécrivent.

3. **Pas d'API key côté client** — La clé Anthropic est stockée comme secret Worker Cloudflare, jamais exposée dans `index.html`.

4. **Export PDF** = `window.open` + `document.write` + `window.print()`. Pas de lib externe. `win.onload` déclenche l'impression.

5. **Données patient extraites par l'IA** — Le formulaire de création ne demande que Nom/Prénom. Tout le reste (âge, profession, prescripteur, motif, dateEval...) est parsé depuis la première ligne de la réponse IA au format `PATIENT:{...JSON...}`.

---

## Fichiers à ne pas confondre

| Fichier | Rôle |
|---------|------|
| `index.html` | L'app entière (~1250 lignes). Ne pas modifier à la main : utiliser des scripts fix_*.js |
| `worker.js` | Worker Cloudflare : routes `/auth/send`, `/auth/verify`, `/` (proxy Anthropic) |
| `wrangler.toml` | Config Worker (ne pas changer les IDs) |
| `fix_mods.js` | Dernier script de refactoring (3 modifs majeures) — peut servir de modèle |
| `fix_all.js`, `fix_export.js`, `replace_export.js` | Scripts anciens — référence historique uniquement |
| `test_js.js`, `tmp_test.js` | Artefacts de validation syntax — supprimables |

---

## Prochain pas unique

**Tester l'app en conditions réelles** : se connecter sur https://kinebilan.pages.dev, créer un dossier, coller une vraie transcription, générer le CR, vérifier que les données patient sont bien extraites, et tester l'export PDF.

Si tout est OK → le projet est fonctionnellement complet pour un usage quotidien.
Si un bug remonte → le corriger avant d'envisager de nouvelles fonctionnalités.
