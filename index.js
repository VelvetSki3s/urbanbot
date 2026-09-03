const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { GoogleGenerativeAI } = require('@google/generative-ai'); // <--- Importación correcta
const http = require('http');

// Servidor HTTP de mantenimiento para Render
const port = process.env.PORT || 3000;
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('🤖 Urbanbot activo.');
}).listen(port);

// Inicialización de Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const http = require('http');

// -------------------------------------------------------------
// 1. Servidor HTTP para Render (mantiene el servicio activo)const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const http = require('http');

// -------------------------------------------------------------
// 1. Servidor HTTP para Render (mantiene el servicio activo)
// -------------------------------------------------------------
const port = process.env.PORT || 3000;
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('🤖 Urbanbot activo y funcionando.');
}).listen(port, () => {
    console.log(`Servidor de mantenimiento escuchando en el puerto ${port}`);
});

// -------------------------------------------------------------
// 2. Inicialización de Google Gemini API
// -------------------------------------------------------------
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error('ERROR: No se ha configurado la variable de entorno GEMINI_API_KEY.');
}
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// -------------------------------------------------------------
// 3. Configuración del Cliente de WhatsApp
// -------------------------------------------------------------
const client = new Client({
    authStrategy: new LocalAuth({ dataPath: './.wwebjs_auth' }),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
        ]
    }
});

// Generación del código QR en los logs de Render
client.on('qr', (qr) => {
    console.log('--- CÓDIGO QR GENERADO (Escanea con WhatsApp) ---');
    qrcode.generate(qr, { small: true });
});

// Confirmación de inicio de sesión
client.on('ready', () => {
    console.log('✅ Cliente de WhatsApp vinculado y listo.');
});

// -------------------------------------------------------------
// 4. Recepción y respuesta a mensajes
// -------------------------------------------------------------
client.on('message', async (msg) => {
    // Ignorar mensajes enviados por el propio bot o mensajes de grupos sin mención directa
    if (msg.fromMe || msg.isStatus) return;

    try {
        console.log(`Mensaje recibido de ${msg.from}: ${msg.body}`);

        // Generar respuesta con la API de Gemini
        const result = await model.generateContent(msg.body);
        const responseText = result.response.text();

        // Enviar respuesta por WhatsApp
        await msg.reply(responseText);
    } catch (error) {
        console.error('Error procesando el mensaje con Gemini:', error);
    }
});

// Iniciar sesión
client.initialize();
// -------------------------------------------------------------
const port = process.env.PORT || 3000;
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('🤖 Urbanbot activo y funcionando.');
}).listen(port, () => {
    console.log(`Servidor de mantenimiento escuchando en el puerto ${port}`);
});

// -------------------------------------------------------------
// 2. Inicialización de Google Gemini API
// -------------------------------------------------------------
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error('ERROR: No se ha configurado la variable de entorno GEMINI_API_KEY.');
}
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// -------------------------------------------------------------
// 3. Configuración del Cliente de WhatsApp
// -------------------------------------------------------------
const client = new Client({
    authStrategy: new LocalAuth({ dataPath: './.wwebjs_auth' }),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
        ]
    }
});

// Generación del código QR en los logs de Render
client.on('qr', (qr) => {
    console.log('--- CÓDIGO QR GENERADO (Escanea con WhatsApp) ---');
    qrcode.generate(qr, { small: true });
});

// Confirmación de inicio de sesión
client.on('ready', () => {
    console.log('✅ Cliente de WhatsApp vinculado y listo.');
});

// -------------------------------------------------------------
// 4. Recepción y respuesta a mensajes
// -------------------------------------------------------------
client.on('message', async (msg) => {
    // Ignorar mensajes enviados por el propio bot o mensajes de grupos sin mención directa
    if (msg.fromMe || msg.isStatus) return;

    try {
        console.log(`Mensaje recibido de ${msg.from}: ${msg.body}`);

        // Generar respuesta con la API de Gemini
        const result = await model.generateContent(msg.body);
        const responseText = result.response.text();

        // Enviar respuesta por WhatsApp
        await msg.reply(responseText);
    } catch (error) {
        console.error('Error procesando el mensaje con Gemini:', error);
    }
});

// Iniciar sesión
client.initialize();
