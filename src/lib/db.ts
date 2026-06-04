import fs from 'fs';
import path from 'path';
import { Customer } from '@/types';

const DB_PATH = path.join(process.cwd(), 'src/data/db.json');

// Realistic Indian Names & Attributes for Seeding
const MALE_FIRST_NAMES = [
  'Aarav', 'Kabir', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Aaryan', 'Krishna',
  'Ishan', 'Shaurya', 'Atharva', 'Ansh', 'Pranav', 'Dev', 'Arav', 'Arnav', 'Parth', 'Dhruv',
  'Kushal', 'Rohan', 'Rahul', 'Amit', 'Vikrant', 'Abhinav', 'Abhishek', 'Sanjay', 'Rohit', 'Alok',
  'Nikhil', 'Ritesh', 'Kunal', 'Sameer', 'Vikram', 'Siddharth', 'Yash', 'Manish', 'Gaurav', 'Vishal',
  'Vivek', 'Akash', 'Harish', 'Manoj', 'Nitin', 'Sunil', 'Suresh', 'Rajesh', 'Ramesh', 'Vinay'
];

const FEMALE_FIRST_NAMES = [
  'Diya', 'Isha', 'Ananya', 'Aanya', 'Aaradhya', 'Pihu', 'Prisha', 'Ira', 'Ahana', 'Riya',
  'Khushi', 'Anika', 'Kavya', 'Aditi', 'Sneha', 'Pooja', 'Shruti', 'Priya', 'Neha', 'Tanvi',
  'Divya', 'Meera', 'Radha', 'Simran', 'Deepika', 'Priyanka', 'Kareena', 'Katrina', 'Aishwarya', 'Shreya',
  'Kriti', 'Kiara', 'Sonam', 'Alia', 'Vidya', 'Richa', 'Pallavi', 'Ritu', 'Sakshi', 'Shalini',
  'Swati', 'Preeti', 'Payal', 'Komal', 'Kajal', 'Nisha', 'Jyoti', 'Anjali', 'Geeta', 'Suhana'
];

const LAST_NAMES = [
  'Sharma', 'Patel', 'Gupta', 'Kumar', 'Singh', 'Verma', 'Sen', 'Joshi', 'Mehta', 'Shah',
  'Reddy', 'Rao', 'Nair', 'Iyer', 'Iyengar', 'Das', 'Banerjee', 'Chatterjee', 'Mukherjee', 'Ghosh',
  'Kulkarni', 'Deshpande', 'Patil', 'Shinde', 'Bhat', 'Hegde', 'Shenoy', 'Choudhury', 'Mishra', 'Trivedi',
  'Chaturvedi', 'Saxena', 'Srivastava', 'Kapoor', 'Khanna', 'Malhotra', 'Singhal', 'Bansal', 'Goel', 'Garg',
  'Jain', 'Varma', 'Pillai', 'Menon', 'Kurian', 'Mathew', 'Joseph', 'Gowda', 'Shetty', 'Bose'
];

const CITIES = [
  { name: 'Mumbai', state: 'Maharashtra', languages: ['Marathi', 'Hindi', 'English'] },
  { name: 'Delhi', state: 'Delhi', languages: ['Hindi', 'Punjabi', 'English'] },
  { name: 'Bangalore', state: 'Karnataka', languages: ['Kannada', 'Hindi', 'English', 'Telugu'] },
  { name: 'Pune', state: 'Maharashtra', languages: ['Marathi', 'Hindi', 'English'] },
  { name: 'Hyderabad', state: 'Telangana', languages: ['Telugu', 'Hindi', 'English', 'Urdu'] },
  { name: 'Chennai', state: 'Tamil Nadu', languages: ['Tamil', 'English', 'Hindi'] },
  { name: 'Kolkata', state: 'West Bengal', languages: ['Bengali', 'English', 'Hindi'] },
  { name: 'Ahmedabad', state: 'Gujarat', languages: ['Gujarati', 'Hindi', 'English'] },
  { name: 'Gurgaon', state: 'Haryana', languages: ['Hindi', 'English'] },
  { name: 'Noida', state: 'Uttar Pradesh', languages: ['Hindi', 'English'] }
];

const CAREER_PROFILES = [
  { designation: 'Software Engineer', degree: 'B.Tech', company: 'Google', minIncome: 1500000, maxIncome: 3000000 },
  { designation: 'Senior Software Engineer', degree: 'B.Tech', company: 'Microsoft', minIncome: 3000000, maxIncome: 5500000 },
  { designation: 'Product Manager', degree: 'MBA', company: 'Amazon', minIncome: 2000000, maxIncome: 4500000 },
  { designation: 'Data Scientist', degree: 'M.Tech', company: 'TCS', minIncome: 1200000, maxIncome: 2500000 },
  { designation: 'Management Consultant', degree: 'MBA', company: 'McKinsey', minIncome: 2200000, maxIncome: 5000000 },
  { designation: 'Financial Analyst', degree: 'B.Com', company: 'HDFC Bank', minIncome: 800000, maxIncome: 1800000 },
  { designation: 'Doctor (MD)', degree: 'M.B.B.S', company: 'Apollo Hospitals', minIncome: 1800000, maxIncome: 4000000 },
  { designation: 'Entrepreneur', degree: 'MBA', company: 'Self-Employed', minIncome: 3000000, maxIncome: 7000000 },
  { designation: 'Architect', degree: 'B.Arch', company: 'Self-Employed', minIncome: 1000000, maxIncome: 2500000 },
  { designation: 'HR Manager', degree: 'MBA', company: 'Deloitte', minIncome: 900000, maxIncome: 1800000 },
  { designation: 'Marketing Director', degree: 'MBA', company: 'Reliance Industries', minIncome: 2500000, maxIncome: 4800000 },
  { designation: 'Consultant', degree: 'MBA', company: 'Accenture', minIncome: 1200000, maxIncome: 2200000 }
];

const COLLEGES = [
  'IIT Bombay', 'IIT Delhi', 'BITS Pilani', 'NIT Trichy', 'Delhi University (SRCC)', 'St. Xavier\'s College',
  'Symbiosis Pune', 'IIM Ahmedabad', 'IIM Bangalore', 'Indian School of Business (ISB)', 'VIT Vellore', 'Manipal Institute'
];

const RELIGIONS = ['Hindu', 'Hindu', 'Hindu', 'Muslim', 'Sikh', 'Christian', 'Jain'];
const CASTES = ['Brahmin', 'Kshatriya', 'Vaishya', 'Maratha', 'Nair', 'Kayastha', 'Khatri', 'No Bar'];
const DIETS = ['Veg', 'Non-Veg', 'Vegan'] as const;
const SMOKING = ['No', 'Yes', 'Occasionally'] as const;
const DRINKING = ['No', 'Yes', 'Socially'] as const;
const STATUS_TAGS = ['Onboarding', 'Active', 'Matched', 'Paused'] as const;
const YES_NO_MAYBE = ['Yes', 'No', 'Maybe'] as const;
const MARITAL_STATUS = ['Never Married', 'Never Married', 'Never Married', 'Divorced', 'Widowed'] as const;

function generateSeedData(): Customer[] {
  const seedList: Customer[] = [];

  // Generate 50 Males
  for (let i = 0; i < 50; i++) {
    const firstName = MALE_FIRST_NAMES[i % MALE_FIRST_NAMES.length];
    const lastName = LAST_NAMES[Math.floor((i * 7 + 3) % LAST_NAMES.length)];
    const id = `M-${100 + i}`;
    seedList.push(createProfile(id, firstName, lastName, 'Male', i));
  }

  // Generate 50 Females
  for (let i = 0; i < 50; i++) {
    const firstName = FEMALE_FIRST_NAMES[i % FEMALE_FIRST_NAMES.length];
    const lastName = LAST_NAMES[Math.floor((i * 11 + 5) % LAST_NAMES.length)];
    const id = `F-${100 + i}`;
    seedList.push(createProfile(id, firstName, lastName, 'Female', i));
  }

  return seedList;
}

function createProfile(id: string, firstName: string, lastName: string, gender: 'Male' | 'Female', index: number): Customer {
  // Deterministic seed helper using index & gender
  const seedVal = index + (gender === 'Male' ? 100 : 500);

  // Age between 23 and 37
  const age = 23 + (seedVal % 15);
  // Calculate dob (Current year is 2026)
  const birthYear = 2026 - age;
  const month = String(1 + (seedVal % 12)).padStart(2, '0');
  const day = String(1 + (seedVal % 28)).padStart(2, '0');
  const dob = `${birthYear}-${month}-${day}`;

  const cityObj = CITIES[seedVal % CITIES.length];
  const career = CAREER_PROFILES[seedVal % CAREER_PROFILES.length];
  const college = COLLEGES[(seedVal + 3) % COLLEGES.length];

  // Income within the designation ranges
  const incomeRange = career.maxIncome - career.minIncome;
  const income = career.minIncome + Math.floor((seedVal * 12345) % incomeRange);

  // Height: Male 168-188 cm, Female 152-172 cm
  const height = gender === 'Male' ? 168 + (seedVal % 21) : 152 + (seedVal % 21);

  const religion = RELIGIONS[seedVal % RELIGIONS.length];
  const caste = religion === 'Hindu' ? CASTES[seedVal % CASTES.length] : 'N/A';

  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;
  const phone = `+91 ${90000 + (seedVal % 10000)} ${10000 + (seedVal % 90000)}`;

  const maritalStatus = MARITAL_STATUS[seedVal % MARITAL_STATUS.length];
  const siblings = seedVal % 4;

  const diet = DIETS[seedVal % DIETS.length];
  const smoking = SMOKING[seedVal % SMOKING.length];
  const drinking = DRINKING[seedVal % DRINKING.length];
  const manglik = religion === 'Hindu' ? (seedVal % 4 === 0 ? 'Yes' : 'No') : 'No';

  const wantKids = YES_NO_MAYBE[seedVal % YES_NO_MAYBE.length];
  const openToRelocate = YES_NO_MAYBE[(seedVal + 1) % YES_NO_MAYBE.length];
  const openToPets = YES_NO_MAYBE[(seedVal + 2) % YES_NO_MAYBE.length];

  const status = STATUS_TAGS[seedVal % STATUS_TAGS.length];

  const notes = `Onboarded client on modern dashboard. Client prefers ${diet} diet and values partner compatibility. Notes from initial intake call indicate they are active and looking for a long-term companion who shares their values.`;

  return {
    id,
    firstName,
    lastName,
    gender,
    dob,
    country: 'India',
    city: cityObj.name,
    height,
    email,
    phone,
    college,
    degree: career.degree,
    income,
    company: career.company,
    designation: career.designation,
    maritalStatus,
    languages: cityObj.languages,
    siblings,
    caste,
    religion,
    wantKids,
    openToRelocate,
    openToPets,
    diet,
    smoking,
    drinking,
    manglik,
    notes,
    status
  };
}

export function getDb(): Customer[] {
  // Ensure the directory exists
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Load or seed the database
  if (!fs.existsSync(DB_PATH)) {
    const data = generateSeedData();
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return data;
  }

  try {
    const fileContent = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Error reading JSON db, reseeding...', error);
    const data = generateSeedData();
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return data;
  }
}

export function saveDb(data: Customer[]): void {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

export function getCustomerById(id: string): Customer | undefined {
  const db = getDb();
  return db.find(c => c.id === id);
}

export function updateCustomer(id: string, updates: Partial<Customer>): Customer | undefined {
  const db = getDb();
  const index = db.findIndex(c => c.id === id);
  if (index === -1) return undefined;

  db[index] = { ...db[index], ...updates };
  saveDb(db);
  return db[index];
}
