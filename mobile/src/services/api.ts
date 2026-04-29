import axios from 'axios';

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

export const extractTextFromImage = async (base64Image: string): Promise<string> => {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not found. Please set EXPO_PUBLIC_OPENAI_API_KEY in your environment variables.');
  }

  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-4o-mini', // or gpt-4-vision-preview if available
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Extract all visible text, code, and formulas from this whiteboard image. Convert into clean, well-structured Markdown. Preserve headings, bullet points, and code blocks.',
            },
            {
              type: 'image_url',
              image_url: {
                url: data:image/jpeg;base64,,
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': Bearer ,
      },
    }
  );

  return response.data.choices[0].message.content.trim();
};
