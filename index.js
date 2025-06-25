// SYSTEMENOTIFY - Il tuo assistente per le vendite! 🤖
console.log('🚀 SystemeNotify sta partendo...');

// Importiamo gli strumenti necessari
require('dotenv').config();
const express = require('express');
const TelegramBot = require('node-telegram-bot-api');

// Configurazione
const app = express();
const port = process.env.PORT || 3000;
const botToken = process.env.TELEGRAM_BOT_TOKEN;
const chatIds = process.env.TELEGRAM_CHAT_IDS.split(',').map(id => id.trim());
const webhookSecret = process.env.WEBHOOK_SECRET;

// Creiamo il bot Telegram
const bot = new TelegramBot(botToken);

// Configuriamo Express per ricevere i dati
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Pagina principale - per verificare che funzioni
app.get('/', (req, res) => {
    res.send(`
        <h1>🎉 SystemeNotify è ATTIVO!</h1>
        <p>Il bot sta funzionando correttamente.</p>
        <p>Versione: 1.0.0</p>
        <p>Status: ✅ Online</p>
    `);
});

// Endpoint per ricevere le notifiche da Systeme.io
app.post('/webhook', async (req, res) => {
    console.log('📨 Ricevuto webhook da Systeme.io!');
    
    try {
        // Verifica la sicurezza (opzionale)
        // Verifica la sicurezza - Accetta sempre Systeme.io
console.log('🔐 Headers ricevuti:', req.headers);
// Commentiamo temporaneamente la verifica
// if (webhookSecret && secret !== webhookSecret) {
//     console.log('❌ Webhook non autorizzato');
//     return res.status(401).send('Non autorizzato');
// }
        // Estrai i dati dalla vendita
        const data = req.body;
        console.log('📊 Dati ricevuti:', JSON.stringify(data, null, 2));

        // Prepara il messaggio
        let messaggio = formatMessage(data);

        // Invia il messaggio a tutti gli ID configurati
        for (const chatId of chatIds) {
            try {
                await bot.sendMessage(chatId, messaggio, { parse_mode: 'HTML' });
                console.log(`✅ Messaggio inviato a ${chatId}`);
            } catch (error) {
                console.error(`❌ Errore invio a ${chatId}:`, error.message);
            }
        }

        res.status(200).send('OK');
    } catch (error) {
        console.error('❌ Errore nel webhook:', error);
        res.status(500).send('Errore interno');
    }
});

// Endpoint di test - per verificare che le notifiche funzionino
app.get('/test', async (req, res) => {
    console.log('🧪 Test notifica richiesto');
    
    const testData = {
        product_name: 'Corso Test',
        price: '97',
        customer_name: 'Mario Rossi',
        customer_email: 'test@example.com',
        date: new Date().toLocaleString('it-IT')
    };

    const messaggio = formatMessage(testData);

    try {
        for (const chatId of chatIds) {
            await bot.sendMessage(chatId, messaggio, { parse_mode: 'HTML' });
        }
        res.send('✅ Messaggio di test inviato! Controlla Telegram.');
    } catch (error) {
        console.error('❌ Errore test:', error);
        res.send('❌ Errore: ' + error.message);
    }
});

// Funzione per formattare il messaggio
function formatMessage(data) {
    // Estrai i dati in modo sicuro
    const corso = data.product_name || data.item_name || data.product || 'Corso';
    const prezzo = data.price || data.amount || data.total || '0';
    const cliente = data.customer_name || data.buyer_name || data.name || 'Cliente';
    const email = data.customer_email || data.buyer_email || data.email || 'N/D';
    const dataVendita = data.date || data.created_at || new Date().toLocaleString('it-IT');

    // Crea il messaggio formattato
    return `🎉 <b>NUOVA VENDITA!</b> 🤑

📚 <b>Corso:</b> ${corso}
💰 <b>Prezzo:</b> €${prezzo}
👤 <b>Cliente:</b> ${cliente}
📧 <b>Email:</b> ${email}
📅 <b>Data:</b> ${dataVendita}

<i>Powered by SystemeNotify 🤖</i>`;
}

// Gestione comando /info dal bot
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    
    if (msg.text === '/start' || msg.text === '/info') {
        bot.sendMessage(chatId, 
            `🤖 <b>SystemeNotify Bot</b>\n\n` +
            `Il tuo ID Telegram è: <code>${chatId}</code>\n\n` +
            `Questo bot ti invierà notifiche automatiche quando ricevi una vendita su Systeme.io!\n\n` +
            `Comandi disponibili:\n` +
            `/info - Mostra queste informazioni\n` +
            `/test - Invia una notifica di test`,
            { parse_mode: 'HTML' }
        );
    } else if (msg.text === '/test') {
        bot.sendMessage(chatId, '🧪 Inviando notifica di test...');
        // Simula una vendita di test
        const testMessage = formatMessage({
            product_name: 'Test Cristalloterapia',
            price: '47',
            customer_name: 'Test Cliente',
            customer_email: 'test@test.com'
        });
        bot.sendMessage(chatId, testMessage, { parse_mode: 'HTML' });
    }
});

// Avvia il server
app.listen(port, () => {
    console.log(`✅ SystemeNotify attivo sulla porta ${port}`);
    console.log(`📱 Bot Telegram configurato per inviare a: ${chatIds.join(', ')}`);
    console.log(`🔗 Webhook URL: https://[tuo-dominio]/webhook`);
    console.log(`🧪 Test URL: https://[tuo-dominio]/test`);
});