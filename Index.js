console.log("🤖 BOT WHATSAPP - Render.com");
console.log("🚀 Démarrage...");

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');

// Serveur web pour Render
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>🤖 Bot WhatsApp Communauté</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: Arial; padding: 20px; background: #f0f0f0; }
          .container { max-width: 500px; margin: auto; background: white; padding: 30px; border-radius: 10px; }
          h1 { color: #25D366; }
          .status { padding: 10px; background: #e8f5e9; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🤖 Bot WhatsApp Communauté</h1>
          <div class="status">
            <p>✅ Bot actif sur Render</p>
            <p>📱 Connecté à WhatsApp</p>
            <p>👥 Système de XP et rangs</p>
          </div>
          <h3>📋 Commandes :</h3>
          <ul>
            <li><code>!inscription [pseudo]</code> - S'inscrire</li>
            <li><code>!xp</code> - Voir ses XP</li>
            <li><code>!classement</code> - Top 10</li>
            <li><code>!aide</code> - Aide complète</li>
          </ul>
          <p><em>Vérifie la console Render pour le QR Code</em></p>
        </div>
      </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`🌐 Serveur web sur le port ${PORT}`);
});

// ============ BOT WHATSAPP ============

let membres = {};

function getRang(xp) {
  const rangs = ['E', 'D', 'C', 'B', 'A', 'S'];
  const index = Math.floor(xp / 1000);
  return rangs[Math.min(index, rangs.length - 1)];
}

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu'
    ]
  }
});

// QR Code
client.on('qr', (qr) => {
  console.log('\n📱 =======================');
  console.log('📱 SCANNEZ CE QR AVEC WHATSAPP');
  console.log('📱 WhatsApp → Menu → Appareils connectés');
  console.log('📱 =======================\n');
  qrcode.generate(qr, { small: true });
});

// Bot prêt
client.on('ready', () => {
  console.log('\n✅ =======================');
  console.log('✅ BOT CONNECTÉ ET PRÊT !');
  console.log('✅ =======================\n');
});

// Gestion des messages
client.on('message', async msg => {
  const texte = msg.body || '';
  const expediteur = msg.from;
  
  // !aide
  if (texte === '!aide') {
    msg.reply(`
📋 **COMMANDES** :

👤 **INSCRIPTION** :
!inscription [pseudo] - S'inscrire

🎮 **STATS** :
!xp - Voir XP et rang
!classement - Top 10

⚡ **XP** :
+1 XP par message dans les groupes

🏆 **RANGS** :
E(0) → D(1000) → C(2000) → B(3000) → A(4000) → S(5000+)
    `);
  }
  
  // !inscription
  if (texte.toLowerCase().startsWith('!inscription')) {
    const pseudo = texte.split(' ')[1] || 'Joueur';
    
    if (!membres[expediteur]) {
      membres[expediteur] = {
        pseudo: pseudo,
        xp: 0,
        rang: 'E'
      };
      msg.reply(`✅ Inscrit ${pseudo} ! Rang: E | XP: 0`);
    } else {
      msg.reply(`❌ Déjà inscrit : ${membres[expediteur].pseudo}`);
    }
  }
  
  // !xp
  if (texte === '!xp') {
    if (membres[expediteur]) {
      const m = membres[expediteur];
      msg.reply(`🎮 ${m.pseudo} | XP: ${m.xp} | Rang: ${m.rang}`);
    }
  }
  
  // !classement
  if (texte === '!classement') {
    const top = Object.values(membres)
      .sort((a, b) => b.xp - a.xp)
      .slice(0, 10);
    
    let reponse = '🏆 **TOP 10**\n\n';
    top.forEach((m, i) => {
      const emoji = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '▫️';
      reponse += `${emoji} ${m.pseudo} - ${m.xp} XP (${m.rang})\n`;
    });
    
    msg.reply(reponse);
  }
  
  // Gain XP automatique
  if (msg.from.includes('@g.us') && membres[expediteur]) {
    membres[expediteur].xp += 1;
    const xp = membres[expediteur].xp;
    const nouveauRang = getRang(xp);
    
    if (membres[expediteur].rang !== nouveauRang) {
      membres[expediteur].rang = nouveauRang;
      msg.reply(`🎉 Félicitations ! Tu as atteint le rang ${nouveauRang} !`);
    }
  }
});

// Démarrer le bot
client.initialize();

console.log("⏳ En attente du scan QR Code...");
