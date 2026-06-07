const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `
You are an expert art gallery assistant for the Lumina Online Art Gallery.
Help users discover paintings, explain art styles, suggest paintings based on budget and taste, and answer questions about artists and art history.
Keep your responses concise, elegant, and friendly. Do not use formatting like markdown bold or italics excessively.
If a user asks for recommendations, you can suggest they search for categories like "Abstract", "Contemporary Indian", or "Wildlife".
You represent the Lumina brand, so maintain a sophisticated and luxurious tone.
`;

exports.handleChat = async (req, res) => {
    try {
        const { message, conversationHistory } = req.body;

        if (!process.env.GROQ_API_KEY) {
            // Fallback rule-based logic
            const lowerMsg = message.toLowerCase();
            let response = "I am currently operating in offline mode. I can help you find paintings if you ask me to 'show abstracts' or 'find something under 10000'.";
            
            if (lowerMsg.includes('abstract')) {
                response = "We have a wonderful collection of Abstract art. Please visit our Gallery and select 'Abstract' from the categories filter.";
            } else if (lowerMsg.includes('under') || lowerMsg.includes('budget')) {
                response = "You can easily filter our collection by price! Head over to the Gallery and use the price range sliders.";
            } else if (lowerMsg.includes('recommend')) {
                response = "I highly recommend checking out our 'Curated Masterpieces' carousel on the Home page. They are hand-picked by our curators.";
            }

            return res.status(200).json({ response });
        }

        const messages = [
            {
                role: 'system',
                content: SYSTEM_PROMPT
            }
        ];

        if (conversationHistory && Array.isArray(conversationHistory)) {
            for (const msg of conversationHistory) {
                messages.push({
                    role: msg.sender === 'bot' ? 'assistant' : 'user',
                    content: msg.text
                });
            }
        }

        messages.push({
            role: 'user',
            content: message
        });

        const chatCompletion = await groq.chat.completions.create({
            messages: messages,
            model: "llama-3.1-8b-instant", // Updated to current supported model
        });

        res.status(200).json({ response: chatCompletion.choices[0]?.message?.content || '' });
    } catch (error) {
        console.error('Chat API Error:', error);
        res.status(500).json({ message: 'Error processing your request', error: error.message });
    }
};
