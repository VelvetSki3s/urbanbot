const { Client, LocalAuth } = require('whatsapp-web.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Configuración de Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Resto del código...

// Instrucciones del sistema para el bot
const INSTRUCCIONES_URBANBOT = `
Eres Urbanbot, un asistente virtual para un grupo de conductores.
Responde con tono amigable, directo, colega y conciso.
`;

// Inicialización del cliente de WhatsApp
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

// Evento para mostrar el código QR en la consola
client.on('qr', (qr) => {
    console.log('QR recibido, escanéalo si es necesario.');
});

// Evento cuando el bot está listo
client.on('ready', () => {
    console.log('¡Urbanbot está listo y conectado!');
});

// Evento principal para procesar mensajes
client.on('message', async (msg) => {
    try {
        const chat = await msg.getChat();
        if (!chat.isGroup) return;

        const texto = msg.body.toLowerCase();
        const numeroBot = '56951031443'; // Número de teléfono del bot
        
        const menciones = await msg.getMentions();
        
        const estaMencionado = menciones.some(contacto => contacto.number === numeroBot) ||
                               msg.body.includes(numeroBot) ||
                               texto.includes('urbanbot') ||
                               texto.includes('bot');

        if (estaMencionado) {
            const textoLimpio = msg.body.replace(/@\d+/g, '').replace(/@\w+/g, '').trim();

            if (!textoLimpio) {
                await msg.reply('¿En qué puedo ayudarte, colega?');
                return;
            }

            const prompt = `${INSTRUCCIONES_URBANBOT}\n\nConductor dice: ${textoLimpio}`;
            const result = await model.generateContent(prompt);
            const response = await result.response;

            await msg.reply(response.text());
        }
    } catch (error) {
        console.error('Error procesando mensaje:', error);
    }
});

client.initialize();
