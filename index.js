// SYSTEMENOTIFY - DEBUG VERSION 🔍
console.log('🚀 SystemeNotify DEBUG sta partendo...');

require('dotenv').config();
const express = require('express');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
const port = process.env.PORT || 3000;
const botToken = process.env.TELEGRAM_BOT_TOKEN;
const chatIds = process.env.TELEGRAM_CHAT_IDS.split(',').map(id => id.trim());

const bot = new TelegramBot(botToken);

// Middleware per leggere il body in diversi formati
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.text());
app.use(express.raw());

// Pagina principale
app.get('/', (req, res) => {
    res.send(`
        <h1>🎉 SystemeNotify DEBUG è ATTIVO!</h1>
        <p>Versione: 2.0.0 DEBUG</p>
        <p>Status: ✅ Online</p>
    `);
});

// Webhook - accetta TUTTO per debug
app.all('/webhook', async (req, res) => {
    console.log('📨 WEBHOOK RICEVUTO!');
    console.log('📋 Metodo:', req.method);
    console.log('📋 Headers:', JSON.stringify(req.headers, null, 2));
    console.log('📋 Query:', JSON.stringify(req.query, null, 2));
    console.log('📋 Body:', JSON.stringify(req.body, null, 2));
    console.log('📋 Body type:', typeof req.body);
    
    try {
        // Prova a estrarre i dati in vari modi
        let data = req.body;
        
        // Se il body è una stringa, prova a parsarlo
        if (typeof data === 'string') {
            try {
                data = JSON.parse(data);
                console.log('✅ Body parsato come JSON');
            } catch (e) {
                console.log('❌ Body non è JSON valido');
            }
        }
        
        // Invia sempre un messaggio di debug
        const debugMessage = `🔍 <b>DEBUG WEBHOOK SYSTEME.IO</b>

📋 <b>Metodo:</b> ${req.method}
📋 <b>Headers:</b> ${Object.keys(req.headers).join(', ')}
📋 <b>Tipo Body:</b> ${typeof req.body}
📋 <b>Body:</b> <code>${JSON.stringify(req.body, null, 2).substring(0, 1000)}</code>

<i>Controlla i log di Render per dettagli completi!</i>`;

        // Invia a tutti
        for (const chatId of chatIds) {
            try {
                await bot.sendMessage(chatId, debugMessage, { parse_mode: 'HTML' });
                console.log(`✅ Debug inviato a ${chatId}`);
            } catch (error) {
                console.error(`❌ Errore invio a ${chatId}:`, error.message);
            }
        }

        // Rispondi sempre OK
        res.status(200).json({ status: 'ok', message: 'Webhook ricevuto' });
        
    } catch (error) {
        console.error('❌ Errore generale:', error);
        res.status(200).send('OK'); // Rispondi OK comunque
    }
});

// Test endpoint
app.get('/test', async (req, res) => {
    const testMessage = `🧪 <b>TEST SYSTEMENOTIFY</b>

✅ Bot Telegram: Funzionante
✅ Server: Online
✅ Ora: ${new Date().toLocaleString('it-IT')}

<i>SystemeNotify v2.0.0 DEBUG</i>`;

    try {
        for (const chatId of chatIds) {
            await bot.sendMessage(chatId, testMessage, { parse_mode: 'HTML' });
        }
        res.send('✅ Test inviato!');
    } catch (error) {
        res.send('❌ Errore: ' + error.message);
    }
});

// Avvia il server
app.listen(port, () => {
    console.log(`✅ SystemeNotify DEBUG attivo sulla porta ${port}`);
    console.log(`📱 Bot Telegram configurato per: ${chatIds.join(', ')}`);
    console.log(`🔍 MODALITÀ DEBUG ATTIVA`);
});