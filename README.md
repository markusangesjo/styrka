# Styrka

En liten personlig PWA (Progressive Web App) med ditt styrketräningsprogram:
3 pass i veckan, cirka 1 timme per pass, uppdelat enligt **Push / Pull / Legs** – anpassat för nybörjare.

## Innehåll

- **Pass 1 – Push**: bröst, axlar, triceps
- **Pass 2 – Pull**: rygg, biceps, bakre axlar
- **Pass 3 – Legs**: ben, säte, vader

Bocka av dina set direkt i appen. Allt sparas lokalt i webbläsaren (`localStorage`) –
inget skickas till någon server.

## Köra lokalt

Ingen build behövs, det är en helt statisk app:

```powershell
cd styrka
python -m http.server 8080
# öppna http://localhost:8080
```

## Installera som app (PWA)

Öppna sidan i mobilen/webbläsaren och välj "Lägg till på hemskärmen" /
"Installera app". Fungerar offline efter första besöket.

## Hosting via GitHub Pages

1. Gå till repots **Settings → Pages**.
2. Under "Build and deployment", välj **Source: Deploy from a branch**.
3. Välj branch `main` och mapp `/ (root)`, spara.
4. Sidan publiceras på `https://<ditt-användarnamn>.github.io/styrka/`.

## Anpassa programmet

Öppna `app.js` och redigera arrayen `PROGRAM` – lägg till/ta bort övningar,
justera set/reps/vila efter hur det känns över tid (progressiv överbelastning).
