/**
 * Script pour maintenir l'application active sur Render
 * 
 * Usage:
 *   node keep-alive.js
 * 
 * Ou en arrière-plan:
 *   nohup node keep-alive.js > keep-alive.log 2>&1 &
 */

const https = require('https');
const http = require('http');

// ⚙️ CONFIGURATION - Remplacez par l'URL de votre application Render
const APP_URL = process.env.RENDER_APP_URL || 'https://votre-app.onrender.com';
const HEALTH_ENDPOINT = `${APP_URL}/api/health`;

// Intervalle entre chaque ping (en millisecondes)
// 10 minutes = 600000 ms (pour éviter que Render mette l'app en veille)
const INTERVAL = 10 * 60 * 1000; // 10 minutes

function ping() {
  const url = new URL(HEALTH_ENDPOINT);
  const client = url.protocol === 'https:' ? https : http;
  
  const options = {
    hostname: url.hostname,
    port: url.port || (url.protocol === 'https:' ? 443 : 80),
    path: url.pathname,
    method: 'GET',
    timeout: 10000, // 10 secondes de timeout
  };

  const req = client.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      const timestamp = new Date().toISOString();
      if (res.statusCode === 200) {
        console.log(`[${timestamp}] ✅ Ping réussi - Status: ${res.statusCode}`);
        try {
          const json = JSON.parse(data);
          if (json.uptime) {
            console.log(`   Uptime: ${Math.round(json.uptime)}s`);
          }
        } catch (e) {
          // Ignore JSON parse errors
        }
      } else {
        console.log(`[${timestamp}] ⚠️  Ping réussi mais status: ${res.statusCode}`);
      }
    });
  });

  req.on('error', (err) => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ❌ Erreur: ${err.message}`);
  });

  req.on('timeout', () => {
    req.destroy();
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ⏱️  Timeout après 10 secondes`);
  });

  req.end();
}

// Ping immédiatement au démarrage
console.log('🚀 Service de keep-alive démarré...');
console.log(`📍 URL: ${HEALTH_ENDPOINT}`);
console.log(`⏰ Intervalle: ${INTERVAL / 1000 / 60} minutes\n`);

ping();

// Puis toutes les X minutes
setInterval(ping, INTERVAL);

// Gestion propre de l'arrêt
process.on('SIGINT', () => {
  console.log('\n\n👋 Arrêt du service de keep-alive...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n👋 Arrêt du service de keep-alive...');
  process.exit(0);
});

