const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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

client.on('qr', (qr) => {
    console.log('\n======================================================');
    console.log('ESCANEA EL CÓDIGO QR CON EL WHATSAPP DE URBANBOT:');
    console.log('======================================================\n');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('\n ¡EXCELENTE! urbanbot está conectado y funcionando 24/7.');
});

client.on('message_create', async (msg) => {
    try {
        const chat = await msg.getChat();
        if (!chat.isGroup) return;

        const botId = client.info.wid._serialized;
        const meMencionaron = msg.mentionedIds && msg.mentionedIds.includes(botId);
        const invocacionTexto = msg.body.toLowerCase().includes('urbanbot') || msg.body.toLowerCase().includes('@bot');

        if (meMencionaron || invocacionTexto) {
            const textoLimpio = msg.body.replace(/@\w+/g, '').trim();

            if (!textoLimpio) {
                await msg.reply('¿En qué puedo ayudarte, colega? Soy urbanbot.');
                return;
            }

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-lite',
                contents: [
                    { role: 'user', parts: [{ text: `${INSTRUCCIONES_URBANBOT}\n\nConductor dice: ${textoLimpio}` }] }
                ]
            });

            await msg.reply(response.text);
        }
    } catch (error) {
        console.error('Error al procesar mensaje:', error);
    }
});

client.initialize();
