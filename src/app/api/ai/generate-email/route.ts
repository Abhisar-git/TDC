import { NextResponse } from 'next/server';
import { Customer } from '@/types';
import { calculateAge } from '@/lib/matching';

export async function POST(request: Request) {
  try {
    const { customer, candidate } = await request.json() as { customer: Customer; candidate: Customer };

    if (!customer || !candidate) {
      return NextResponse.json({ error: 'Missing customer or candidate profiles' }, { status: 400 });
    }

    // Get Gemini API key from environment
    const apiKey = process.env.GEMINI_API_KEY || '';

    const customerAge = calculateAge(customer.dob);
    const candidateAge = calculateAge(candidate.dob);

    if (!apiKey) {
      const emailContent = generateMockEmail(customer, candidate, customerAge, candidateAge);
      return NextResponse.json({ emailContent, isMock: true });
    }

    // Call Gemini API
    const prompt = `
Write an introductory email from the Matchmaker (at TDC) to the customer: ${customer.firstName} ${customer.lastName} (Age ${customerAge}, ${customer.designation}, living in ${customer.city}).
Introduce them to this suggested match candidate: ${candidate.firstName} ${candidate.lastName} (Age ${candidateAge}, ${candidate.designation} at ${candidate.company}, living in ${candidate.city}, diet is ${candidate.diet}, height is ${candidate.height}cm).

Explain why you think they would hit it off, linking their shared values/careers/locations. Make it warm, engaging, and professional. Mention that they should let you know if they want to be introduced.
Keep it under 150 words.
Return strictly a JSON object:
{
  "emailContent": "string"
}
`;

    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: "You are an expert matchmaking writer for TDC (The Date Crew). Always reply in JSON.\n\n" + prompt
              }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.7
        }
      })
    });

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      console.warn('Gemini email generator error, using mock fallback:', errText);
      const emailContent = generateMockEmail(customer, candidate, customerAge, candidateAge);
      return NextResponse.json({ emailContent, isMock: true, error: 'Gemini error, fell back to local template' });
    }

    const result = await geminiResponse.json();
    
    // Parse Gemini response format
    const textContent = result.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    const content = JSON.parse(textContent.trim());

    return NextResponse.json({
      emailContent: content.emailContent || 'Failed to generate email.',
      isMock: false
    });

  } catch (error) {
    console.error('Error in generate-email API:', error);
    try {
      const { customer, candidate } = await request.clone().json();
      const customerAge = calculateAge(customer.dob);
      const candidateAge = calculateAge(candidate.dob);
      const emailContent = generateMockEmail(customer, candidate, customerAge, candidateAge);
      return NextResponse.json({ emailContent, isMock: true });
    } catch {
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }
}

function generateMockEmail(customer: Customer, candidate: Customer, customerAge: number, candidateAge: number): string {
  const isSameCity = customer.city.toLowerCase() === candidate.city.toLowerCase();
  
  return `Hi ${customer.firstName},

I hope you are having a wonderful week!

I have been scanning our curated network for you and found a high-potential match that I think you would really like.

Meet ${candidate.firstName}. She is ${candidateAge} years old, working as a ${candidate.designation} at ${candidate.company}. ${isSameCity ? `Like you, she is based in ${customer.city}, which makes setting up a quick coffee meet-up very easy.` : `She is currently based in ${candidate.city}, but since both of you are open to relocation, we feel location won't be a hurdle.`}

Beyond the logistics, what stood out to me was your matching values. You both share a ${customer.diet === candidate.diet ? `${customer.diet} diet` : 'compatible approach to life'} and values around partner compatibility. I believe your backgrounds in ${customer.designation} and her career in ${candidate.designation} would provide a fantastic foundation for engaging conversations.

I'd love to share your profile with her if you're interested. Let me know if you would like me to set up an introductory call!

Warm regards,

Your Matchmaker at TDC
The Date Crew`;
}
export const dynamic = 'force-dynamic';
