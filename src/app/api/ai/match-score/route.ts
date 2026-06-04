import { NextResponse } from 'next/server';
import { Customer } from '@/types';
import { calculateAge } from '@/lib/matching';

export async function POST(request: Request) {
  try {
    const { customer, candidate } = await request.json() as { customer: Customer; candidate: Customer };
    
    if (!customer || !candidate) {
      return NextResponse.json({ error: 'Missing customer or candidate profiles' }, { status: 400 });
    }

    // Get Gemini key from environment
    const apiKey = process.env.GEMINI_API_KEY || '';

    const customerAge = calculateAge(customer.dob);
    const candidateAge = calculateAge(candidate.dob);

    // If no API key is available, return a high-quality mock response
    if (!apiKey) {
      const score = calculateMockScore(customer, candidate, customerAge, candidateAge);
      const explanation = generateMockExplanation(customer, candidate, score);
      return NextResponse.json({ score, explanation, isMock: true });
    }

    // Call Gemini API
    const prompt = `
Main Customer Profile:
- Name: ${customer.firstName} ${customer.lastName}
- Gender: ${customer.gender}
- Age: ${customerAge}
- City: ${customer.city}
- Profession: ${customer.designation} at ${customer.company}
- Income: INR ${customer.income}
- Religion: ${customer.religion}
- Diet: ${customer.diet}
- Smoking/Drinking: ${customer.smoking}/${customer.drinking}
- Want Kids: ${customer.wantKids}
- Open to Relocate: ${customer.openToRelocate}

Suggested Match Candidate:
- Name: ${candidate.firstName} ${candidate.lastName}
- Gender: ${candidate.gender}
- Age: ${candidateAge}
- City: ${candidate.city}
- Profession: ${candidate.designation} at ${candidate.company}
- Income: INR ${candidate.income}
- Religion: ${candidate.religion}
- Diet: ${candidate.diet}
- Smoking/Drinking: ${candidate.smoking}/${candidate.drinking}
- Want Kids: ${candidate.wantKids}
- Open to Relocate: ${candidate.openToRelocate}

Please evaluate the compatibility between these two individuals. Provide a compatibility score (0 to 100) and a concise, warm 1-2 sentence explanation of why they are a good match, focusing on their shared lifestyle, professional compatibility, location alignment, or matching values.
Return ONLY a JSON object in this format:
{
  "score": number,
  "explanation": "string"
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
                text: "You are an expert Indian matchmaking assistant for TDC (The Date Crew). Always reply in JSON.\n\n" + prompt
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
      console.warn('Gemini API error, using mock fallback:', errText);
      const score = calculateMockScore(customer, candidate, customerAge, candidateAge);
      const explanation = generateMockExplanation(customer, candidate, score);
      return NextResponse.json({ score, explanation, isMock: true, error: 'Gemini error, fell back to local calculation' });
    }

    const result = await geminiResponse.json();
    
    // Parse Gemini response format
    const textContent = result.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    const content = JSON.parse(textContent.trim());
    
    return NextResponse.json({
      score: content.score || 80,
      explanation: content.explanation || 'High compatibility based on profiles.',
      isMock: false
    });

  } catch (error) {
    console.error('Error in match-score API:', error);
    // Graceful fallback to mock on JSON parse errors or net exceptions
    try {
      const { customer, candidate } = await request.clone().json();
      const customerAge = calculateAge(customer.dob);
      const candidateAge = calculateAge(candidate.dob);
      const score = calculateMockScore(customer, candidate, customerAge, candidateAge);
      const explanation = generateMockExplanation(customer, candidate, score);
      return NextResponse.json({ score, explanation, isMock: true });
    } catch {
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }
}

// Mock compatibility logic
function calculateMockScore(c1: Customer, c2: Customer, age1: number, age2: number): number {
  let baseScore = 75;

  const ageDiff = Math.abs(age1 - age2);
  if (ageDiff <= 3) baseScore += 8;
  else if (ageDiff <= 5) baseScore += 5;
  else if (ageDiff > 10) baseScore -= 10;

  if (c1.diet === c2.diet) baseScore += 5;

  if (c1.city === c2.city) baseScore += 8;
  else if (c1.openToRelocate === 'Yes' && c2.openToRelocate === 'Yes') baseScore += 4;

  if (c1.religion === c2.religion) baseScore += 4;

  const incomeRatio = Math.min(c1.income, c2.income) / Math.max(c1.income, c2.income);
  baseScore += Math.floor(incomeRatio * 5);

  return Math.min(Math.max(baseScore, 60), 97);
}

function generateMockExplanation(c1: Customer, c2: Customer, score: number): string {
  const points: string[] = [];
  
  if (c1.diet === c2.diet) {
    points.push(`shared ${c1.diet} lifestyle`);
  }
  
  if (c1.city === c2.city) {
    points.push(`common base in ${c1.city}`);
  } else if (c1.openToRelocate !== 'No' && c2.openToRelocate !== 'No') {
    points.push('mutual openness to relocate');
  }

  const isTech = (c: Customer) => c.designation.toLowerCase().includes('software') || c.designation.toLowerCase().includes('developer');
  if (isTech(c1) && isTech(c2)) {
    points.push('strong compatibility in the tech industry');
  } else {
    points.push('complementary professional paths');
  }

  if (c1.religion === c2.religion) {
    points.push(`aligned cultural background (${c1.religion})`);
  }

  const joinStr = points.slice(0, 3).join(', ');
  return `This is a High Potential Match (${score}%) with strong potential, reflecting their ${joinStr || 'harmonious relationship preferences'} and shared lifestyle expectations.`;
}
export const dynamic = 'force-dynamic';
