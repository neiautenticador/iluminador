// netlify/functions/groq.js
exports.handler = async (event, context) => {
  // Permitir apenas POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Método não permitido' })
    };
  }

  try {
    const { desire } = JSON.parse(event.body);
    
    if (!desire) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Desejo é obrigatório' })
      };
    }

    const prompt = `Como um sábio seguidor dos ensinamentos de Nichiren Daishonin, transforme este desejo mundano em uma versão iluminada e elevada, seguindo o princípio "Desejos mundanos são iluminação". 

Desejo: "${desire}"

Por favor, responda em português seguindo EXATAMENTE esta estrutura:

DESEJO ILUMINADO:
[Aqui escreva uma reformulação elevada e inspiradora do desejo]

EXPLICAÇÃO:
[Breve explicação de como este desejo pode ser visto como um caminho para a iluminação]

PRÁTICA SUGERIDA:
[Uma prática ou reflexão sugerida baseada no Budismo de Nichiren e na Soka Gakkai]

Mantenha o tom inspirador, compassivo e prático.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        model: 'meta-llama/llama-3.1-8b-instant',
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({
        content: data.choices[0].message.content
      })
    };

  } catch (error) {
    console.error('Erro na função:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        error: 'Erro interno do servidor',
        message: error.message 
      })
    };
  }
};
