// SYSTEMENOTIFY PER VERCEL 🚀
const TelegramBot = require('node-telegram-bot-api');

// Configurazione dalle variabili d'ambiente
const botToken = process.env.TELEGRAM_BOT_TOKEN;
const chatIds = process.env.TELEGRAM_CHAT_IDS.split(',').map(id => id.trim());

// Crea il bot (senza polling per Vercel)
const bot = new TelegramBot(botToken);

module.exports = async (req, res) => {
    console.log('🔥 Richiesta ricevuta:', req.method, req.url);
    
    // Gestione homepage
    if (req.url === '/' && req.method === 'GET') {
        return res.status(200).send(`
            <h1>🎉 SystemeNotify è ATTIVO su Vercel!</h1>
            <p>Versione: 4.0.0 VERCEL</p>
            <p>Status: ✅ Online</p>
            <p><a href="/test">Clicca qui per test notifica</a></p>
        `);
    }
    
    // Gestione test
    if (req.url === '/test' && req.method === 'GET') {
        console.log('🧪 Test richiesto');
        
        const messaggio = `🎉 <b>NUOVA VENDITA!</b> 🤑

📚 <b>Corso:</b> Test Vercel
💰 <b>Prezzo:</b> €97
👤 <b>Cliente:</b> Test Cliente
📧 <b>Email:</b> test@vercel.com
📅 <b>Data:</b> ${new Date().toLocaleString('it-IT')}

<i>Powered by SystemeNotify su Vercel 🚀</i>`;

        try {
            // Invia a tutti
            const promises = chatIds.map(chatId => 
                bot.sendMessage(chatId, messaggio, { parse_mode: 'HTML' })
                    .then(() => console.log(`✅ Test inviato a ${chatId}`))
                    .catch(err => console.error(`❌ Errore invio a ${chatId}:`, err.message))
            );
            
            await Promise.all(promises);
            return res.status(200).send('✅ Notifica di test inviata! Controlla Telegram.');
        } catch (error) {
            console.error('❌ Errore test:', error);
            return res.status(500).send('Errore: ' + error.message);
        }
    }
    
    // Gestione webhook da Systeme.io
    if (req.url === '/webhook' && req.method === 'POST') {
        console.log('📨 Webhook da Systeme.io ricevuto!');
        
        try {
            const data = req.body;
            console.log('📊 Dati:', JSON.stringify(data).substring(0, 200));
            
            // Estrai i dati
            const cliente = data.customer?.fields?.first_name + ' ' + data.customer?.fields?.surname || 'Cliente';
            const email = data.customer?.email || 'N/D';
            const prezzoRaw = data.order?.totalPrice || data.order?.amount || 0;
            const prezzo = prezzoRaw > 10 ? Math.round(prezzoRaw / 100) : prezzoRaw;
            const dataVendita = new Date(data.order?.createdAt || Date.now()).toLocaleString('it-IT');
            
            // Nome prodotto
            let nomeProdotto = 'Prodotto';
            if (data.orderItem?.name) {
                nomeProdotto = data.orderItem.name;
            } else if (data.orderItem?.resources?.[0]?.name) {
                nomeProdotto = data.orderItem.resources[0].name;
            } else if (data.funnelStep?.funnel?.name) {
                nomeProdotto = data.funnelStep.funnel.name;
            }
            
            // Messaggio
            const messaggio = `🎉 <b>NUOVA VENDITA!</b> 🤑

📚 <b>Corso:</b> ${nomeProdotto}
💰 <b>Prezzo:</b> €${prezzo}
👤 <b>Cliente:</b> ${cliente}
📧 <b>Email:</b> ${email}
📅 <b>Data:</b> ${dataVendita}

<i>Powered by SystemeNotify 🤖</i>`;

            // Invia a tutti
            const promises = chatIds.map(chatId => 
                bot.sendMessage(chatId, messaggio, { parse_mode: 'HTML' })
                    .then(() => console.log(`✅ Notifica inviata a ${chatId}`))
                    .catch(err => console.error(`❌ Errore invio a ${chatId}:`, err.message))
            );
            
            await Promise.all(promises);
            
            // Risposta per Systeme.io
            return res.status(200).json({ 
                success: true,
                message: 'Webhook received successfully'
            });
            
        } catch (error) {
            console.error('❌ Errore webhook:', error);
            // Rispondi OK anche in caso di errore per non far disattivare il webhook
            return res.status(200).json({ success: true });
        }
    }
    
    // Richiesta non gestita
    return res.status(404).send('Not Found');
};