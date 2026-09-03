const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const http = require('http');
const puppeteer = require('puppeteer');

// 1. Servidor HTTP para mantener activo el proceso en Render
const port = process.env.PORT || 3000;
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('🤖 Urbanbot activo y en línea.');
}).listen(port, () => {
    console.log(`Servidor de mantenimiento activo en puerto ${port}`);
});

// 2. Configuración de Gemini API
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error('ERROR: La variable GEMINI_API_KEY no está configurada.');
}
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const INSTRUCCIONES_URBANBOT = `
Eres urbanbot, la centralita virtual de "Urban GPS", un grupo de cuidado mutuo de conductores enfocado en el trabajo seguro en ruta.
Tu función es brindar soporte rápido, conciso (máximo 2 a 3 líneas) y muy directo para no distraer a los conductores al volante.

PROTOCOLOS Y REGLAS DEL GRUPO URBAN GPS:
1. Seguridad en Ruta: Recordar mantener ubicación en tiempo real activa al estar en ruta y desactivarla al finalizar la jornada.
2. Protocolo Nocturno: En turno de noche es clave reportar punto A (origen) y punto B (destino) para monitorear el viaje.
3. PROTOCOLO ESPECIAL CLAVE 0-30 (Pasajero conflictivo):
   - Al activarse esta clave, debes indicar de inmediato: "SILENCIO RADIAL EN ZELLO. Mantener frecuencia despejada para el monitoreo del colega afectado."
4. Normas del Grupo: Mantener respeto mutuo. No se toleran insultos ni acoso.

MANUAL DE CLAVES URBAN:
- EMERGENCIAS Y ESTADOS:
  • CLAVE 1: Conductor caído (Pedir ubicación urgente a los móviles).
  • CLAVE 10: Fuera de servicio.

- CÓDIGOS DE ESTADO (SERIE 10):
  • 10-0: Persecución | 10-1: Pasajeros a bordo | 10-2: Retornar a central | 10-3: Mantener en línea
  • 10-4: Copiado | 10-5: Negativo | 10-6: Ocupado | 10-7: Disponible | 10-8: De vuelta a la ruta | 10-9: Repetir mensaje

- FISCALIZACIÓN Y SERVICIOS (SERIE 0):
  • 0-10: Falsa alarma | 0-20: Control MTT | 0-30: Pasajero conflictivo (Aplicar silencio radial) | 0-40: Positivo/Negativo | 0-50: Viaje falso (Evitar)
  • 0-60: Viaje finalizado | 0-70: Apoyo mecánico | 0-80: Vía despejada | 0-90: Congestión
  • 0-100: Control Carabineros | 0-200: Control Municipales | 0-300: Control Alcotest | 0-400: Control con grúa | 0-500: Control PDI

REGLAS DE RESPUESTA:
- Preséntate o responde como urbanbot.
- Responde siempre con tono de colega, profesional, directo y breve.
- Si reportan una clave con ubicación (ej. "@urbanbot 0-100 en sector centro"), confirma la alerta y la ubicación de forma inmediata.
`;

// 3. Inicialización de cliente con localización automática de Puppeteer
const client = new Client({
    authStrategy: new LocalAuth({ dataPath: './.wwebjs_auth' }),
    puppeteer: {
        headless: true,
        executablePath: puppeteer.executablePath(),
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

// QR en consola
client.on('qr', (qr) => {
    console.log('\n====================================================');
    console.log('--- CÓDIGO QR GENERADO (ESCANEAR DESDE WHATSAPP) ---');
    console.log('====================================================\n');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ Urbanbot se ha conectado correctamente a WhatsApp.');
});

// 4. Procesamiento de mensajes
client.on('message', async (msg) => {
    try {
        const chat = await msg.getChat();
        
        if (chat.isGroup) {
            const texto = msg.body.toLowerCase();
            const numeroBot = '56951031443';
            const menciones = await msg.getMentions();

            const meMencionaronPorTag = menciones.some(contacto => contacto.number === numeroBot || contacto.isMe);
            const meMencionaronPorTexto = msg.body.includes(numeroBot) || texto.includes('urbanbot') || texto.includes('bot');

            if (!meMencionaronPorTag && !meMencionaronPorTexto) return;
        }

        const textoLimpio = msg.body.replace(/@\d+/g, '').replace(/@\w+/g, '').trim();

        if (!textoLimpio) {
            await msg.reply('¿En qué puedo ayudarte, colega? Soy urbanbot.');
            return;
        }

        const prompt = `${INSTRUCCIONES_URBANBOT}\n\nConductor dice: ${textoLimpio}`;
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        await msg.reply(responseText);

    } catch (error) {
        console.error('Error al procesar el mensaje:', error);
    }
});

client.initialize();
