import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  // Initialize OpenAI only when API is called
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: 'OpenAI API key not configured' },
      { status: 500 }
    );
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are an Islamic content writer. Generate notification content in Bengali (Bangla) language. 
          The content should be:
          - Authentic and based on Quran and Hadith
          - Written in a respectful and spiritual tone
          - Include relevant verses or hadith references
          - End with a dua
          - Be informative and engaging
          - Length: 150-250 words`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const generatedContent = completion.choices[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      content: generatedContent,
      title: prompt,
    });

  } catch (error: any) {
    console.error('OpenAI API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate content' },
      { status: 500 }
    );
  }
}
