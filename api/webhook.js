// SYSTEMENOTIFY VERSIONE SEMPLICE PER VERCEL 🚀
// Niente dipendenze esterne!

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_IDS = process.env.TELEGRAM_CHAT_IDS.split(',').map(id => id.trim());

// Funzione per inviare messaggi a Telegram
async function sendTelegramMessage(chatId, text) {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: text,
                parse_mode: 'HTML'
            })
        });
        
        const result = await response.json();
        console.log(`✅ Messaggio inviato a ${chatId}:`, result.ok);
        return result;
    } catch (error) {
        console.error(`❌ Errore invio a ${chatId}:`, error.message);
        return null;
    }
}

module.exports = async (req, res) => {
    console.log('🔥 Richiesta:', req.method, req.url);
    
    // Homepage
    if (req.method === 'GET' && req.url === '/') {
        return res.status(200).send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>SystemeNotify</title>
                <style>
                    body { font-family: Arial; text-align: center; padding: 50px; }
                    h1 { color: #2ecc71; }
                    a { display: inline-block; margin: 20px; padding: 10px 20px; 
                        background: #3498db; color: white; text-decoration: none; 
                        border-radius: 5px; }
                </style>
            </head>
            <body>
                <h1>🎉 SystemeNotify è ATTIVO!</h1>
                <p>Versione: 5.0 VERCEL SIMPLE</p>
                <p>Status: ✅ Online</p>
                <a href="/test">🧪 Test Notifica</a>
            </body>
            </html>
        `);
    }
    
    // Test
    if (req.method === 'GET' && req.url === '/test') {
        const testMessage = `🎉 <b>NUOVA VENDITA!</b> 🤑

📚 <b>Corso:</b> Test da Vercel
💰 <b>Prezzo:</b> €97
👤 <b>Cliente:</b> Test Cliente
📧 <b>Email:</b> test@vercel.com
📅 <b>Data:</b> ${new Date().toLocaleString('it-IT')}

<i>SystemeNotify su Vercel ✨</i>`;

        let successCount = 0;
        for (const chatId of CHAT_IDS) {
            const result = await sendTelegramMessage(chatId, testMessage);
            if (result && result.ok) successCount++;
        }
        
        return res.status(200).send(`
            <h2>✅ Test completato!</h2>
            <p>Inviato a ${successCount}/${CHAT_IDS.length} destinatari</p>
            <p><a href="/">Torna alla home</a></p>
        `);
    }
    
    // Webhook da Systeme.io
    if (req.method === 'POST' && req.url === '/webhook') {
        console.log('📨 Webhook ricevuto!');
        
        try {
            const data = req.body;
            console.log('📊 Tipo body:', typeof data);
            
            // Estrai dati
            const nome = data.customer?.fields?.first_name || 'Nome';
            const cognome = data.customer?.fields?.surname || 'Cognome';
            const cliente = `${nome} ${cognome}`.trim();
            const email = data.customer?.email || 'email@example.com';
            
            // Gestione prezzo
            let prezzo = data.order?.totalPrice || 
                        data.order?.amount || 
                        data.pricePlan?.amount || 0;
            
            // Se il prezzo sembra essere in centesimi
            if (prezzo > 100) {
                prezzo = Math.round(prezzo / 100);
            }
            
            // Nome prodotto
            const nomeProdotto = data.orderItem?.name || 
                                data.pricePlan?.innerName ||
                                data.funnelStep?.funnel?.name || 
                                'Prodotto';
            
            // Data
            const dataVendita = new Date().toLocaleString('it-IT');
            
            // Messaggio
            const messaggio = `🎉 <b>NUOVA VENDITA!</b> 🤑

📚 <b>Corso:</b> ${nomeProdotto}
💰 <b>Prezzo:</b> €${prezzo}
👤 <b>Cliente:</b> ${cliente}
📧 <b>Email:</b> ${email}
📅 <b>Data:</b> ${dataVendita}

<i>Powered by SystemeNotify 🤖</i>`;

            // Invia a tutti
            const promises = CHAT_IDS.map(chatId => sendTelegramMessage(chatId, messaggio));
            await Promise.all(promises);
            
            // Risposta per Systeme.io
            return res.status(200).json({
                success: true,
                message: 'Webhook processed successfully'
            });
            
        } catch (error) {
            console.error('❌ Errore:', error);
            // Rispondi OK comunque
            return res.status(200).json({ success: true });
        }
    }
    
    // 404
    return res.status(404).send('Not Found');
};