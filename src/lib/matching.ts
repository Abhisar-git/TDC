import { Customer } from '@/types';


export function calculateAge(dobString: string): number {
  const dob = new Date(dobString);
  const currentYear = 2026;
  const birthYear = dob.getFullYear();
  let age = currentYear - birthYear;

  const currentMonth = 5; // June (0-indexed 5)
  const currentDay = 4;
  const dobMonth = dob.getMonth();
  const dobDay = dob.getDate();

  if (dobMonth > currentMonth || (dobMonth === currentMonth && dobDay > currentDay)) {
    age--;
  }
  return age;
}


function isProfessionCompatible(male: Customer, female: Customer): boolean {
  // Rule 1: Similar income bracket (within 35%)
  const incomeDiffPercent = Math.abs(male.income - female.income) / female.income;
  if (incomeDiffPercent <= 0.35) {
    return true;
  }

  // Rule 2: Complementary industries
  // Let's define industries based on designations
  const getIndustry = (c: Customer) => {
    const des = c.designation.toLowerCase();
    if (des.includes('software') || des.includes('developer') || des.includes('data scientist')) {
      return 'Tech';
    }
    if (des.includes('analyst') || des.includes('finance') || des.includes('consultant')) {
      return 'Finance/Consulting';
    }
    if (des.includes('doctor') || des.includes('healthcare') || des.includes('medical')) {
      return 'Healthcare';
    }
    if (des.includes('entrepreneur') || des.includes('self-employed')) {
      return 'Business/Entrepreneurship';
    }
    return 'Other';
  };

  const maleIndustry = getIndustry(male);
  const femaleIndustry = getIndustry(female);

  // Tech & Finance, Tech & Tech, Business & Finance, Healthcare & Business are complementary
  if (maleIndustry === femaleIndustry) return true;
  if (maleIndustry === 'Tech' && femaleIndustry === 'Finance/Consulting') return true;
  if (maleIndustry === 'Finance/Consulting' && femaleIndustry === 'Tech') return true;
  if (maleIndustry === 'Tech' && femaleIndustry === 'Business/Entrepreneurship') return true;
  if (maleIndustry === 'Business/Entrepreneurship' && femaleIndustry === 'Tech') return true;
  if (maleIndustry === 'Healthcare' && femaleIndustry === 'Business/Entrepreneurship') return true;
  if (maleIndustry === 'Business/Entrepreneurship' && femaleIndustry === 'Healthcare') return true;

  return false;
}

/**
 * Checks if relocation preferences match.
 * Rule: Same city is automatically compatible.
 * If different cities, both must be open to relocate (Yes or Maybe).
 */
function isRelocationCompatible(male: Customer, female: Customer): boolean {
  if (male.city.toLowerCase() === female.city.toLowerCase()) {
    return true;
  }

  const maleOpen = male.openToRelocate === 'Yes' || male.openToRelocate === 'Maybe';
  const femaleOpen = female.openToRelocate === 'Yes' || female.openToRelocate === 'Maybe';

  return maleOpen && femaleOpen;
}

/**
 * Checks if lifestyle values match.
 * Rule: Diet compatibility (Veg/Vegan don't pair with Non-Veg).
 * Smoking & Drinking habits must be compatible.
 */
function isLifestyleCompatible(male: Customer, female: Customer): boolean {
  // 1. Diet Compatibility
  // Veg/Vegan are compatible with each other. Non-Veg is compatible with Non-Veg.
  const isVegOrVegan = (diet: string) => diet === 'Veg' || diet === 'Vegan';
  if (isVegOrVegan(male.diet) !== isVegOrVegan(female.diet)) {
    return false;
  }

  // 2. Smoking Compatibility
  // If one is strictly "No", the other must also be "No".
  // Otherwise (Occasionally/Yes), they are compatible.
  if ((male.smoking === 'No' && female.smoking !== 'No') ||
    (female.smoking === 'No' && male.smoking !== 'No')) {
    return false;
  }

  // 3. Drinking Compatibility
  // If one is strictly "No", the other cannot be "Yes" (but "Socially" or "No" is fine).
  // If one is strictly "Yes", the other cannot be "No" (but "Socially" or "Yes" is fine).
  if (male.drinking === 'No' && female.drinking === 'Yes') return false;
  if (female.drinking === 'No' && male.drinking === 'Yes') return false;

  return true;
}

/**
 * Filters the customer pool to find candidates matching the criteria.
 */
export function getSuggestedMatches(customer: Customer, pool: Customer[]): Customer[] {
  const isMale = customer.gender === 'Male';
  const oppositeGender = isMale ? 'Female' : 'Male';

  // Filter for opposite gender first
  const candidates = pool.filter(c => c.gender === oppositeGender);
  const customerAge = calculateAge(customer.dob);

  // Broaden pool to candidates within +/- 5 years, letting Gemini evaluate details
  return candidates.filter(candidate => {
    const candidateAge = calculateAge(candidate.dob);
    return Math.abs(candidateAge - customerAge) <= 5;
  });
}
