const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { GoogleGenerativeAI } = require('@google/genai');
const http = require('http');

// 1. SERVIDOR HTTP PARA RENDER (Evita el "No open ports detected" y reinicios)
const port = process.env.PORT || 3000;
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('🤖 Urbanbot está en ejecución y escuchando eventos.');
}).listen(port, () => {
    console.log(`Servidor HTTP de mantenimiento activo en puerto ${port}`);
});

// 2. CONFIGURACIÓN DE GEMINI AI
// Asegúrate de tener la variable GEMINI_API_KEY en las Environment Variables de Render
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const INSTRUCCIONES_URBANBOT = `
Eres Urbanbot, un asistente virtual para un grupo de conductores de app en la región de Tarapacá.
Responde de forma breve, concisa, profesional y con modismos locales chilenos de forma natural.
Conoces claves de radio (0-30, controles, fiscalizaciones, etc.).
`;

// 3. INICIALIZACIÓN DE WHATSAPP WEB CLIENT
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
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

// Generar código QR en la consola de Render
client.on('qr', (qr) => {
    console.log('Código QR recibido. Escanéalo desde tu WhatsApp:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ Urbanbot está conectado y listo para recibir mensajes.');
});

// 4. LÓGICA DE PROCESAMIENTO DE MENSAJES EN GRUPOS
client.on('message', async (msg) => {
    try {
        const chat = await msg.getChat();
        if (!chat.isGroup) return; // Solo responder en grupos

        const texto = msg.body.toLowerCase();
        const numeroBot = '56951031443'; // Número del bot sin el signo '+'

        // Obtenemos objetos de mención de WhatsApp Web
        const menciones = await msg.getMentions();

        // Criterios de activación
        const meMencionaronPorTag = menciones.some(contacto => contacto.number === numeroBot || contacto.isMe);
        const meMencionaronPorTexto = msg.body.includes(numeroBot) || texto.includes('urbanbot') || texto.includes('bot');

        if (meMencionaronPorTag || meMencionaronPorTexto) {
            // Limpia el prompt quitando etiquetas (@56951031443, @Urbanbot, etc.)
            const textoLimpio = msg.body.replace(/@\d+/g, '').replace(/@\w+/g, '').trim();

            if (!textoLimpio) {
                await msg.reply('¿En qué te puedo colaborar, colega? Escribe tu duda o consulta.');
                return;
            }

            // Consultar a Gemini
            const prompt = `${INSTRUCCIONES_URBANBOT}\n\nConductor pregunta: ${textoLimpio}`;
            const result = await model.generateContent(prompt);
            const response = await result.response;

            await msg.reply(response.text());
        }
    } catch (error) {
        console.error('Error al procesar el mensaje:', error);
    }
});

client.initialize();
