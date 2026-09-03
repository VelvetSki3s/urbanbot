client.on('message', async (msg) => {
    try {
        const chat = await msg.getChat();
        if (!chat.isGroup) return;

        const texto = msg.body.toLowerCase();
        const numeroBot = '56951031443'; // Número del bot sin el signo +
        
        // Obtenemos el listado de menciones en el mensaje
        const menciones = await msg.getMentions();
        
        // Comprobamos si el bot fue mencionado por objeto, por número o por texto
        const estaMencionado = menciones.some(contacto => contacto.number === numeroBot) ||
                               msg.body.includes(numeroBot) ||
                               texto.includes('urbanbot') ||
                               texto.includes('bot');

        if (estaMencionado) {
            // Eliminamos la etiqueta (@56951031443 o @Urbanbot) para dejar solo la consulta
            const textoLimpio = msg.body.replace(/@\d+/g, '').replace(/@\w+/g, '').trim();

            if (!textoLimpio) {
                await msg.reply('¿En qué puedo ayudarte, colega?');
                return;
            }

            // Consulta a la API de Gemini
            const prompt = `${INSTRUCCIONES_URBANBOT}\n\nConductor dice: ${textoLimpio}`;
            const result = await model.generateContent(prompt);
            const response = await result.response;

            await msg.reply(response.text());
        }
    } catch (error) {
        console.error('Error procesando mensaje:', error);
    }
});
