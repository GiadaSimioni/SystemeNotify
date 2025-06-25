// SYSTEMENOTIFY - VERSIONE FINALE 🚀
console.log('🚀 SystemeNotify sta partendo...');

require('dotenv').config();
const express = require('express');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
const port = process.env.PORT || 3000;
const botToken = process.env.TELEGRAM_BOT_TOKEN;
const chatIds = process.env.TELEGRAM_CHAT_IDS.split(',').map(id => id.trim());

const bot = new TelegramBot(botToken);

// Configuriamo Express
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Pagina principale
app.get('/', (req, res) => {
    res.send(`
        <h1>🎉 SystemeNotify è ATTIVO!</h1>
        <p>Il bot sta funzionando correttamente.</p>
        <p>Versione: 3.0.0 FINALE</p>
        <p>Status: ✅ Online</p>
    `);
});
// Log TUTTI i webhook in arrivo
app.all('/webhook', (req, res, next) => {
    console.log('🚨 WEBHOOK RICEVUTO - Metodo:', req.method);
    console.log('🚨 Headers:', req.headers);
    if (req.method === 'POST') {
        next();
    } else {
        res.status(200).send('OK');
    }
});
// Webhook per Systeme.io
app.post('/webhook', async (req, res) => {
    console.log('📨 Ricevuto webhook da Systeme.io!');
    
    try {
        const data = req.body;
        
        // Estrai i dati dalla struttura di Systeme.io
        const cliente = data.customer?.fields?.first_name + ' ' + data.customer?.fields?.surname || 'Cliente';
        const email = data.customer?.email || 'N/D';
        const telefono = data.customer?.fields?.phone_number || 'N/D';
        const prezzo = Math.round((data.order?.totalPrice || 0) / 100);
        const dataVendita = new Date(data.order?.createdAt || Date.now()).toLocaleString('it-IT');
        
        // Prova a trovare il nome del prodotto
        let nomeProdotto = 'Prodotto';
        if (data.orderItem?.name) {
            nomeProdotto = data.orderItem.name;
        } else if (data.orderItem?.resources?.[0]?.name) {
            nomeProdotto = data.orderItem.resources[0].name;
        } else if (data.funnelStep?.funnel?.name) {
            nomeProdotto = data.funnelStep.funnel.name;
        }
        
        // Crea il messaggio
        const messaggio = `🎉 <b>NUOVA VENDITA!</b> 🤑

📚 <b>Corso:</b> ${nomeProdotto}
💰 <b>Prezzo:</b> €${prezzo}
👤 <b>Cliente:</b> ${cliente}
📧 <b>Email:</b> ${email}
📅 <b>Data:</b> ${dataVendita}

<i>Powered by SystemeNotify 🤖</i>`;

        // Invia a tutti i destinatari
        for (const chatId of chatIds) {
            try {
                await bot.sendMessage(chatId, messaggio, { parse_mode: 'HTML' });
                console.log(`✅ Notifica inviata a ${chatId}`);
            } catch (error) {
                console.error(`❌ Errore invio a ${chatId}:`, error.message);
            }
        }

        // Log per debug
        console.log('📊 Vendita processata:', {
            cliente,
            email,
            prezzo,
            prodotto: nomeProdotto
        });

        // Rispondi sempre con 200 OK in formato JSON
res.status(200).json({ 
    success: true,
    message: 'Webhook received successfully'
});
    } catch (error) {
        console.error('❌ Errore nel webhook:', error);
        res.status(200).send('OK');
    }
});

// Test endpoint
app.get('/test', async (req, res) => {
    console.log('🧪 Test notifica richiesto');
    
    const messaggio = `🎉 <b>NUOVA VENDITA!</b> 🤑

📚 <b>Corso:</b> Test Cristalloterapia
💰 <b>Prezzo:</b> €97
👤 <b>Cliente:</b> Mario Rossi
📧 <b>Email:</b> test@example.com
📅 <b>Data:</b> ${new Date().toLocaleString('it-IT')}

<i>Powered by SystemeNotify 🤖</i>`;

    try {
        for (const chatId of chatIds) {
            await bot.sendMessage(chatId, messaggio, { parse_mode: 'HTML' });
        }
        res.send('✅ Messaggio di test inviato! Controlla Telegram.');
    } catch (error) {
        res.send('❌ Errore: ' + error.message);
    }
});

// Comandi bot Telegram
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    
    // Log per vedere chi scrive
    console.log(`📱 Messaggio da ${msg.from.first_name} (ID: ${chatId}): ${msg.text}`);
    
    if (msg.text === '/start' || msg.text === '/info') {
        bot.sendMessage(chatId, 
            `🤖 <b>SystemeNotify Bot</b>\n\n` +
            `Il tuo ID Telegram è: <code>${chatId}</code>\n\n` +
            `Riceverai notifiche automatiche per ogni vendita!\n\n` +
            `Comandi:\n` +
            `/info - Mostra queste informazioni\n` +
            `/test - Invia una notifica di test`,
            { parse_mode: 'HTML' }
        );
    } else if (msg.text === '/test') {
        const testMsg = `🧪 <b>TEST NOTIFICA</b>

✅ Bot: Funzionante
✅ ID: ${chatId}
✅ Ora: ${new Date().toLocaleString('it-IT')}`;
        
        bot.sendMessage(chatId, testMsg, { parse_mode: 'HTML' });
    } else {
        // Per qualsiasi altro messaggio, rispondi con l'ID
        bot.sendMessage(chatId, `🎯 Il tuo ID Telegram è: <b>${chatId}</b>`, { parse_mode: 'HTML' });
    }
});

// Avvia il server
app.listen(port, () => {
    console.log(`✅ SystemeNotify attivo sulla porta ${port}`);
    console.log(`📱 Bot configurato per: ${chatIds.join(', ')}`);
    console.log(`🔗 Pronto per ricevere vendite!`);
});