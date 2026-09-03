const { Client, LocalAuth } = require('whatsapp-web.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Configuración de Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Instrucciones base del sistema para Urbanbot
const INSTRUCCIONES_URBANBOT = `
Eres Urbanbot, un asistente virtual para un grupo de conductores.
Responde siempre con un tono amigable, directo, colega y conciso.
`;

// Configuración del cliente de WhatsApp con la ruta explícita del ejecutable de Chrome
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/opt/render/.cache/puppeteer/chrome/linux-127.0.6533.88/chrome-linux64/chrome',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ]
    }
});

// Evento cuando se genera un código QR
client.on('qr', (qr) => {
    console.log('Código QR recibido. Escanéalo desde los logs si tienes un visualizador o autentica el dispositivo.');
});

// Evento cuando el bot está listo
client.on('ready', () => {
    console.log('¡Urbanbot está listo y conectado a WhatsApp!');
});

// Evento para procesar los mensajes recibidos
client.on('message', async (msg) => {
    try {
        const chat = await msg.getChat();
        if (!chat.isGroup) return;

        const texto = msg.body.toLowerCase();
        const numeroBot = '56951031443';
        
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
        console.error('Error al procesar el mensaje:', error);
    }
});

client.initialize();
