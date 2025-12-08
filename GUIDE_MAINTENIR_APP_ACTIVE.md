# 🔄 Guide : Maintenir l'application active sur Render (Free Tier)

Sur le plan gratuit de Render, les applications se mettent en veille après 15 minutes d'inactivité. Voici plusieurs solutions pour maintenir votre application active.

## ✅ Solution 1 : UptimeRobot (Recommandé - Gratuit)

**UptimeRobot** est un service gratuit qui ping votre application toutes les 5 minutes.

### Étapes :

1. **Créer un compte** sur [UptimeRobot](https://uptimerobot.com/) (gratuit jusqu'à 50 monitors)

2. **Ajouter un nouveau monitor** :
   - **Monitor Type** : HTTP(s)
   - **Friendly Name** : Menuisier App Health Check
   - **URL** : `https://votre-app.onrender.com/api/health`
   - **Monitoring Interval** : 5 minutes (gratuit)
   - **Alert Contacts** : Votre email (optionnel)

3. **Sauvegarder** - UptimeRobot va maintenant ping votre application toutes les 5 minutes

### Avantages :
- ✅ Gratuit
- ✅ Fiable
- ✅ Envoie des alertes si l'app est down
- ✅ Dashboard pour voir l'uptime

---

## ✅ Solution 2 : cron-job.org (Gratuit)

**cron-job.org** permet de créer des tâches cron gratuites.

### Étapes :

1. **Créer un compte** sur [cron-job.org](https://cron-job.org/)

2. **Créer une nouvelle tâche** :
   - **Title** : Keep Render App Alive
   - **Address** : `https://votre-app.onrender.com/api/health`
   - **Schedule** : Toutes les 10 minutes (`*/10 * * * *`)
   - **Notification** : Votre email (optionnel)

3. **Sauvegarder** - La tâche va s'exécuter automatiquement

### Avantages :
- ✅ Gratuit
- ✅ Personnalisable (choisir la fréquence)
- ✅ Jusqu'à 2 tâches gratuites

---

## ✅ Solution 3 : EasyCron (Alternative)

**EasyCron** offre aussi un plan gratuit.

### Étapes :

1. **Créer un compte** sur [EasyCron](https://www.easycron.com/)

2. **Créer un cron job** :
   - **Cron Job Name** : Render Keep Alive
   - **URL** : `https://votre-app.onrender.com/api/health`
   - **Schedule** : `*/10 * * * *` (toutes les 10 minutes)
   - **HTTP Method** : GET

3. **Sauvegarder**

---

## ✅ Solution 4 : Script local (Si vous avez un ordinateur toujours allumé)

Si vous avez un ordinateur qui reste allumé, vous pouvez créer un script qui ping régulièrement.

### Script Node.js :

Créez un fichier `keep-alive.js` :

```javascript
const https = require('https');

const URL = 'https://votre-app.onrender.com/api/health';
const INTERVAL = 10 * 60 * 1000; // 10 minutes

function ping() {
  https.get(URL, (res) => {
    console.log(`[${new Date().toISOString()}] Ping réussi - Status: ${res.statusCode}`);
  }).on('error', (err) => {
    console.error(`[${new Date().toISOString()}] Erreur: ${err.message}`);
  });
}

// Ping immédiatement
ping();

// Puis toutes les 10 minutes
setInterval(ping, INTERVAL);

console.log('Service de keep-alive démarré...');
```

Lancez avec : `node keep-alive.js`

### Script Bash (Linux/Mac) :

Créez un fichier `keep-alive.sh` :

```bash
#!/bin/bash

URL="https://votre-app.onrender.com/api/health"

while true; do
  curl -s "$URL" > /dev/null
  echo "[$(date)] Ping envoyé"
  sleep 600  # 10 minutes
done
```

Rendez-le exécutable : `chmod +x keep-alive.sh`
Lancez avec : `./keep-alive.sh &`

---

## 📊 Comparaison des solutions

| Solution | Gratuit | Fréquence | Fiable | Alertes |
|----------|---------|-----------|--------|---------|
| **UptimeRobot** | ✅ Oui | 5 min | ⭐⭐⭐⭐⭐ | ✅ Oui |
| **cron-job.org** | ✅ Oui | Personnalisable | ⭐⭐⭐⭐ | ✅ Oui |
| **EasyCron** | ✅ Oui | Personnalisable | ⭐⭐⭐⭐ | ✅ Oui |
| **Script local** | ✅ Oui | Personnalisable | ⭐⭐⭐ | ❌ Non |

## 🎯 Recommandation

**Utilisez UptimeRobot** - C'est la solution la plus simple et la plus fiable pour un usage gratuit.

## 🔍 Vérification

Une fois configuré, vous pouvez vérifier que ça fonctionne :

1. Attendez 15 minutes sans utiliser l'application
2. Appelez directement : `https://votre-app.onrender.com/api/health`
3. L'application devrait répondre rapidement (pas de délai de démarrage)

## ⚠️ Note importante

- Le plan gratuit de Render a des **limites de ressources**
- Maintenir l'app active consomme des ressources même quand elle n'est pas utilisée
- Si vous avez beaucoup de trafic, considérez passer au plan payant

## 🚀 Route de health check

La route `/api/health` a été créée dans votre application. Elle répond avec :

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 12345.67
}
```

Cette route est **légère** et ne consomme presque pas de ressources.

