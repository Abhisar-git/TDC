export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  gender: 'Male' | 'Female';
  dob: string; // YYYY-MM-DD
  country: string;
  city: string;
  height: number; // in cm
  email: string;
  phone: string;
  // Education & Career
  college: string;
  degree: string;
  income: number; // Annual income in INR
  company: string;
  designation: string;
  // Background
  maritalStatus: 'Never Married' | 'Divorced' | 'Widowed';
  languages: string[];
  siblings: number;
  caste: string;
  religion: string;
  // Preferences
  wantKids: 'Yes' | 'No' | 'Maybe';
  openToRelocate: 'Yes' | 'No' | 'Maybe';
  openToPets: 'Yes' | 'No' | 'Maybe';
  // Indian Matchmaking Fields
  diet: 'Veg' | 'Non-Veg' | 'Vegan';
  smoking: 'No' | 'Yes' | 'Occasionally';
  drinking: 'No' | 'Yes' | 'Socially';
  manglik: 'Yes' | 'No';
  // Matchmaker Fields
  notes: string;
  status: 'Onboarding' | 'Active' | 'Matched' | 'Paused';
}

export interface MatchScoreResponse {
  score: number;
  explanation: string;
}

export interface IntroEmailResponse {
  emailContent: string;
}
