'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Save, Heart, Phone, Mail, MapPin, Briefcase, GraduationCap, 
  Sparkles, Calendar, Languages, Shield, Send, Check, X, AlertCircle, Copy, RefreshCw 
} from 'lucide-react';
import { Customer, MatchScoreResponse, IntroEmailResponse } from '@/types';
import { calculateAge, getSuggestedMatches } from '@/lib/matching';

interface CustomerDetailViewProps {
  customer: Customer;
  pool: Customer[];
}

interface AiMatchCache {
  [candidateId: string]: {
    score: number;
    explanation: string;
    loading: boolean;
    error?: string;
  };
}

interface EmailCache {
  [candidateId: string]: {
    emailContent: string;
    loading: boolean;
    error?: string;
  };
}

export default function CustomerDetailView({ customer: initialCustomer, pool }: CustomerDetailViewProps) {
  const router = useRouter();

  // Local state
  const [customer, setCustomer] = useState<Customer>(initialCustomer);
  const [notes, setNotes] = useState(initialCustomer.notes);
  const [status, setStatus] = useState<Customer['status']>(initialCustomer.status);
  
  // Action states
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // AI & Matching state
  const [aiMatches, setAiMatches] = useState<AiMatchCache>({});
  const [emails, setEmails] = useState<EmailCache>({});
  const [activeEmailCandidate, setActiveEmailCandidate] = useState<Customer | null>(null);
  const [editedEmailContent, setEditedEmailContent] = useState('');
  
  // Sent match simulation state
  const [sentMatchCandidate, setSentMatchCandidate] = useState<Customer | null>(null);

  // Filter suggested matches using static engine
  const suggestedMatches = getSuggestedMatches(customer, pool);
  const age = calculateAge(customer.dob);

  // Save notes and status
  const handleSaveNotes = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const response = await fetch(`/api/customers/${customer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes, status }),
      });

      if (!response.ok) throw new Error('Failed to update notes');
      
      const updated = await response.json();
      setCustomer(updated);
      setSaveSuccess(true);
      triggerToast('Workdesk notes updated successfully!', 'success');
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      console.error(error);
      triggerToast('Could not save notes. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const triggerToast = (message: string, type: 'success' | 'error') => {
    setShowToast({ message, type });
    setTimeout(() => setShowToast(null), 3500);
  };

  // Evaluate AI Match Compatibility
  const handleEvaluateAi = async (candidate: Customer) => {
    // If already loading or calculated, do nothing
    if (aiMatches[candidate.id]?.loading || aiMatches[candidate.id]?.score) return;

    setAiMatches(prev => ({
      ...prev,
      [candidate.id]: { score: 0, explanation: '', loading: true }
    }));

    try {
      const response = await fetch('/api/ai/match-score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ customer, candidate }),
      });

      if (!response.ok) throw new Error('API failed');

      const data = await response.json() as MatchScoreResponse & { isMock?: boolean };
      
      setAiMatches(prev => ({
        ...prev,
        [candidate.id]: {
          score: data.score,
          explanation: data.explanation,
          loading: false
        }
      }));
    } catch (error) {
      console.error(error);
      setAiMatches(prev => ({
        ...prev,
        [candidate.id]: {
          score: 0,
          explanation: '',
          loading: false,
          error: 'AI calculation failed. Check settings.'
        }
      }));
      triggerToast('AI scoring failed. Local fallback simulation failed.', 'error');
    }
  };

  // Generate Intro Email
  const handleGenerateEmail = async (candidate: Customer) => {
    setActiveEmailCandidate(candidate);
    
    // Check cache
    if (emails[candidate.id]?.emailContent) {
      setEditedEmailContent(emails[candidate.id].emailContent);
      return;
    }

    setEmails(prev => ({
      ...prev,
      [candidate.id]: { emailContent: '', loading: true }
    }));
    setEditedEmailContent('AI is crafting a personalized matchmaking introduction draft...');

    try {
      const response = await fetch('/api/ai/generate-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ customer, candidate }),
      });

      if (!response.ok) throw new Error('API failed');

      const data = await response.json() as IntroEmailResponse;

      setEmails(prev => ({
        ...prev,
        [candidate.id]: {
          emailContent: data.emailContent,
          loading: false
        }
      }));
      setEditedEmailContent(data.emailContent);
    } catch (error) {
      console.error(error);
      setEmails(prev => ({
        ...prev,
        [candidate.id]: {
          emailContent: '',
          loading: false,
          error: 'Failed to draft email.'
        }
      }));
      setEditedEmailContent('Error generating email draft. Please verify your internet connection or OpenAI key.');
    }
  };

  const handleSendMatch = (candidate: Customer) => {
    setSentMatchCandidate(candidate);
  };

  const confirmSendMatch = () => {
    if (!sentMatchCandidate) return;
    
    // Simulate sending match (mock trigger)
    triggerToast(`Introduction sent to ${customer.firstName} about ${sentMatchCandidate.firstName}!`, 'success');
    setSentMatchCandidate(null);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(editedEmailContent);
    triggerToast('Email copied to clipboard!', 'success');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center space-x-2.5 rounded-xl border bg-white p-4 shadow-xl animate-in slide-in-from-bottom-5 duration-300 border-primary/10">
          <div className={`rounded-full p-1.5 ${showToast.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            {showToast.type === 'success' ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          </div>
          <span className="text-xs font-semibold text-warm-text">{showToast.message}</span>
        </div>
      )}

      {/* Navigation & Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <button
          onClick={() => router.push('/')}
          className="inline-flex items-center space-x-2 text-xs font-bold text-primary hover:text-primary-light transition-colors group cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center space-x-2 text-xs text-warm-text/40 font-display">
          <span>Client Profile Profile: <strong>{customer.id}</strong></span>
        </div>
      </div>

      {/* Main Grid: Left Profile Details, Right Matchmaker Workdesk */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        
        {/* Left 2 Columns: Biodata Grid */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main ID Card */}
          <div className="rounded-2xl border border-primary/10 bg-white p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-primary to-primary-light text-white font-serif text-2xl font-bold shadow-md">
                  {customer.firstName[0]}{customer.lastName[0]}
                </div>
                <div>
                  <h1 className="font-serif text-2xl font-bold text-primary">
                    {customer.firstName} {customer.lastName}
                  </h1>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-primary/10 bg-warm-bg px-2.5 py-0.5 text-2xs font-bold uppercase tracking-wider text-warm-text/60">
                      {customer.gender}
                    </span>
                    <span className="rounded-full border border-primary/10 bg-warm-bg px-2.5 py-0.5 text-2xs font-semibold text-warm-text/60">
                      {age} Years Old
                    </span>
                    <span className="rounded-full border border-primary/10 bg-warm-bg px-2.5 py-0.5 text-2xs font-semibold text-warm-text/60">
                      {customer.city}, {customer.country}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                  status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' :
                  status === 'Matched' ? 'bg-pink-50 text-pink-700 border-pink-200' :
                  status === 'Onboarding' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                  'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {status}
                </span>
              </div>
            </div>

            {/* Quick Contact Bar */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-primary/5 pt-5 text-xs text-warm-text/70">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-primary/40" />
                <span>{customer.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-primary/40" />
                <span>{customer.phone}</span>
              </div>
            </div>
          </div>

          {/* Detailed Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Career & Education */}
            <div className="rounded-2xl border border-primary/10 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 border-b border-primary/5 pb-3">
                <Briefcase className="h-4.5 w-4.5 text-gold-dark" />
                <h3 className="font-serif text-sm font-bold text-primary">Education & Career</h3>
              </div>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-warm-text/40">Designation</span>
                  <span className="font-semibold text-right">{customer.designation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-warm-text/40">Company</span>
                  <span className="font-semibold text-right">{customer.company}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-warm-text/40">Degree</span>
                  <span className="font-semibold text-right">{customer.degree}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-warm-text/40">College</span>
                  <span className="font-semibold text-right">{customer.college}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-warm-text/40">Annual Income</span>
                  <span className="font-semibold text-primary">₹{(customer.income / 100000).toFixed(1)} Lakh/yr</span>
                </div>
              </div>
            </div>

            {/* Cultural & Family Background */}
            <div className="rounded-2xl border border-primary/10 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 border-b border-primary/5 pb-3">
                <Languages className="h-4.5 w-4.5 text-gold-dark" />
                <h3 className="font-serif text-sm font-bold text-primary">Cultural Background</h3>
              </div>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-warm-text/40">Religion</span>
                  <span className="font-semibold">{customer.religion}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-warm-text/40">Caste</span>
                  <span className="font-semibold">{customer.caste}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-warm-text/40">Marital Status</span>
                  <span className="font-semibold">{customer.maritalStatus}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-warm-text/40">Manglik Status</span>
                  <span className={`font-semibold rounded px-1.5 py-0.2 ${customer.manglik === 'Yes' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>{customer.manglik}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-warm-text/40">Languages</span>
                  <span className="font-semibold">{customer.languages.join(', ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-warm-text/40">Siblings</span>
                  <span className="font-semibold">{customer.siblings}</span>
                </div>
              </div>
            </div>

            {/* Lifestyle & Habits */}
            <div className="rounded-2xl border border-primary/10 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 border-b border-primary/5 pb-3">
                <Shield className="h-4.5 w-4.5 text-gold-dark" />
                <h3 className="font-serif text-sm font-bold text-primary">Lifestyle & Habits</h3>
              </div>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-warm-text/40">Diet Type</span>
                  <span className="font-semibold">{customer.diet}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-warm-text/40">Smoking Habits</span>
                  <span className="font-semibold">{customer.smoking}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-warm-text/40">Drinking Habits</span>
                  <span className="font-semibold">{customer.drinking}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-warm-text/40">Height</span>
                  <span className="font-semibold">{customer.height} cm ({~~(customer.height / 30.48)}'{~~((customer.height % 30.48) / 2.54)}")</span>
                </div>
              </div>
            </div>

            {/* Relationship Preferences */}
            <div className="rounded-2xl border border-primary/10 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 border-b border-primary/5 pb-3">
                <Heart className="h-4.5 w-4.5 text-gold-dark fill-gold-dark" />
                <h3 className="font-serif text-sm font-bold text-primary">Match Preferences</h3>
              </div>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-warm-text/40">Want Kids?</span>
                  <span className="font-semibold">{customer.wantKids}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-warm-text/40">Open to Relocate?</span>
                  <span className="font-semibold">{customer.openToRelocate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-warm-text/40">Open to Pets?</span>
                  <span className="font-semibold">{customer.openToPets}</span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Right 1 Column: Matchmaker Workdesk (Notes & Status Tag) */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-primary/10 bg-white p-6 shadow-sm space-y-5 sticky top-24">
            <div className="flex items-center space-x-2 border-b border-primary/5 pb-3">
              <Calendar className="h-4.5 w-4.5 text-gold-dark" />
              <h3 className="font-serif text-sm font-bold text-primary">Matchmaker Workdesk</h3>
            </div>

            {/* Status Dropdown */}
            <div>
              <label className="block text-2xs font-semibold uppercase tracking-wider text-warm-text/50 mb-1.5 font-display">
                Pipeline Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Customer['status'])}
                className="w-full rounded-xl border border-primary/10 bg-warm-bg/50 py-2.5 px-3 text-xs font-semibold text-warm-text outline-none focus:border-primary focus:bg-white"
              >
                <option value="Onboarding">Onboarding</option>
                <option value="Active">Active</option>
                <option value="Matched">Matched</option>
                <option value="Paused">Paused</option>
              </select>
            </div>

            {/* Notes Textarea */}
            <div>
              <label className="block text-2xs font-semibold uppercase tracking-wider text-warm-text/50 mb-1.5 font-display">
                Meeting & Intake Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={10}
                placeholder="Record notes from intake calls, customer feedback on matches, or private comments..."
                className="w-full rounded-xl border border-primary/10 bg-warm-bg/50 py-2.5 px-3 text-xs leading-relaxed text-warm-text outline-none focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveNotes}
              disabled={isSaving}
              className="flex w-full items-center justify-center space-x-2 rounded-xl bg-primary py-3 text-xs font-semibold text-white hover:bg-primary-light transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Saving notes...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Workdesk Changes</span>
                </>
              )}
            </button>
            
            {saveSuccess && (
              <span className="block text-center text-2xs font-bold text-green-600 font-display animate-pulse">
                ✓ Changes Saved to Local DB
              </span>
            )}
          </div>
        </div>

      </div>

      {/* Suggested Matches Section (Bottom Pane) */}
      <div className="mt-12 border-t border-primary/15 pt-10">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl font-bold tracking-tight text-primary flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-gold-dark" />
              <span>Suggested Candidates</span>
            </h2>
            <p className="text-xs text-warm-text/60 mt-1">
              Candidates filtered from the pool of 100 using strict matchmaking rules.
            </p>
          </div>

          <div className="text-xs text-warm-text/40 font-display bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10">
            Rule Applied: <strong>{customer.gender === 'Male' ? 'Strict Male Match Rules' : 'Strict Female Match Rules'}</strong>
          </div>
        </div>

        {suggestedMatches.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-primary/25 bg-white py-12 px-4 text-center">
            <Heart className="mx-auto h-8 w-8 text-warm-text/20 mb-3" />
            <h3 className="font-serif text-sm font-bold text-primary">No Matching Candidates Found</h3>
            <p className="mx-auto max-w-md text-2xs text-warm-text/50 mt-1.5 leading-relaxed">
              No profile of the opposite gender in the database met all strict criteria. 
              {customer.gender === 'Male' 
                ? ' Criteria: Strictly younger, shorter height, lower income, and matching view on children.' 
                : ' Criteria: Professional compatibility, relocation alignment, and matching dietary/habits.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {suggestedMatches.map((candidate) => {
              const candAge = calculateAge(candidate.dob);
              const isMale = customer.gender === 'Male';
              const matchState = aiMatches[candidate.id] || { score: 0, explanation: '', loading: false };

              return (
                <div 
                  key={candidate.id}
                  className="rounded-2xl border border-primary/10 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Candidate Identity block */}
                    <div className="flex items-center justify-between border-b border-primary/5 pb-3">
                      <div>
                        <h4 className="font-serif text-base font-bold text-primary">
                          {candidate.firstName} {candidate.lastName}
                        </h4>
                        <span className="text-3xs font-semibold text-warm-text/40 tracking-wider font-display uppercase">
                          ID: {candidate.id} • {candAge} yrs • {candidate.city}
                        </span>
                      </div>
                      
                      {/* Static indicators */}
                      <span className="rounded bg-primary/5 px-2 py-0.5 text-3xs font-semibold text-primary">
                        {candidate.height} cm
                      </span>
                    </div>

                    {/* Quick attributes */}
                    <div className="mt-3 grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                      <div>
                        <span className="text-warm-text/40 block text-[10px]">Education & Career</span>
                        <span className="font-semibold text-warm-text/80 leading-tight">
                          {candidate.degree} - {candidate.designation}
                        </span>
                      </div>
                      <div>
                        <span className="text-warm-text/40 block text-[10px]">Company & Income</span>
                        <span className="font-semibold text-warm-text/80 leading-tight">
                          {candidate.company} (₹{(candidate.income / 100000).toFixed(1)}L/yr)
                        </span>
                      </div>
                      <div>
                        <span className="text-warm-text/40 block text-[10px]">Religion & Caste</span>
                        <span className="font-semibold text-warm-text/80">
                          {candidate.religion} {candidate.caste !== 'N/A' && `(${candidate.caste})`}
                        </span>
                      </div>
                      <div>
                        <span className="text-warm-text/40 block text-[10px]">Diet & Manglik Status</span>
                        <span className="font-semibold text-warm-text/80">
                          {candidate.diet} • Manglik: {candidate.manglik}
                        </span>
                      </div>
                    </div>

                    {/* AI evaluation block */}
                    <div className="mt-5 rounded-xl bg-warm-bg/60 border border-primary/5 p-4">
                      {matchState.loading ? (
                        <div className="flex items-center space-x-3 py-2">
                          <RefreshCw className="h-5 w-5 animate-spin text-gold-dark" />
                          <span className="text-2xs font-medium text-warm-text/50 font-display animate-pulse">
                            AI is reading biodata and evaluating compatibility...
                          </span>
                        </div>
                      ) : matchState.score ? (
                        <div className="flex items-start space-x-3">
                          {/* Circular Score Badge */}
                          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border text-xs font-bold font-display shadow-sm ${
                            matchState.score >= 85 
                              ? 'bg-green-50 border-green-200 text-green-700' 
                              : 'bg-gold/10 border-gold/20 text-gold-dark'
                          }`}>
                            {matchState.score}%
                          </div>
                          <div>
                            <span className="text-3xs font-bold uppercase tracking-wider text-gold-dark font-display flex items-center">
                              <Sparkles className="h-3 w-3 mr-1" /> AI Compatibility Explanation
                            </span>
                            <p className="mt-0.5 text-2xs leading-relaxed text-warm-text/75 italic">
                              "{matchState.explanation}"
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="text-2xs text-warm-text/40 italic">AI Compatibility Score not calculated yet.</span>
                          <button
                            onClick={() => handleEvaluateAi(candidate)}
                            className="inline-flex items-center space-x-1 rounded-lg border border-gold/30 bg-gold/5 px-2.5 py-1 text-2xs font-bold text-gold-dark hover:bg-gold/15 transition-all cursor-pointer"
                          >
                            <Sparkles className="h-3 w-3" />
                            <span>Evaluate AI Match</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="mt-5 pt-4 border-t border-primary/5 flex items-center justify-end space-x-2">
                    {/* Generate intro email draft */}
                    <button
                      onClick={() => handleGenerateEmail(candidate)}
                      className="inline-flex items-center space-x-1 rounded-xl border border-primary/10 px-3.5 py-2 text-2xs font-semibold text-primary/75 hover:bg-primary/5 transition-all cursor-pointer"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-gold-dark" />
                      <span>Generate Intro</span>
                    </button>

                    {/* Send Match confirmation trigger */}
                    <button
                      onClick={() => handleSendMatch(candidate)}
                      className="inline-flex items-center space-x-1 rounded-xl bg-gradient-to-r from-primary to-primary-light px-3.5 py-2 text-2xs font-semibold text-white hover-gold-glow transition-all cursor-pointer"
                    >
                      <Send className="h-3 w-3" />
                      <span>Send Match</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* AI Intro Email Drawer / Modal */}
      {activeEmailCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary-dark/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-primary/10 px-6 py-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-gold-dark" />
                <h3 className="font-serif text-lg font-bold text-primary">AI Personalized Email Draft</h3>
              </div>
              <button
                onClick={() => setActiveEmailCandidate(null)}
                className="rounded-lg p-1 hover:bg-primary/5 text-primary/40 hover:text-primary cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Header simulator */}
              <div className="rounded-xl bg-warm-bg/50 border border-primary/5 p-4 text-xs space-y-2 font-display">
                <div className="flex justify-between">
                  <span className="text-warm-text/40 w-16">To:</span>
                  <span className="font-semibold text-warm-text flex-1">{customer.firstName} {customer.lastName} &lt;{customer.email}&gt;</span>
                </div>
                <div className="flex justify-between border-t border-primary/5 pt-2">
                  <span className="text-warm-text/40 w-16">Subject:</span>
                  <span className="font-semibold text-primary flex-1">Curated Match Introduction: Meet {activeEmailCandidate.firstName}</span>
                </div>
                <div className="flex justify-between border-t border-primary/5 pt-2">
                  <span className="text-warm-text/40 w-16">Sender:</span>
                  <span className="font-semibold text-warm-text/60 flex-1">TDC Matchmaker Portal &lt;matchmaker@thedatecrew.com&gt;</span>
                </div>
              </div>

              {/* Textarea for editing email content */}
              <div>
                <label className="block text-2xs font-semibold uppercase tracking-wider text-warm-text/50 mb-1.5 font-display">
                  Email Body (Editable)
                </label>
                <textarea
                  value={editedEmailContent}
                  onChange={(e) => setEditedEmailContent(e.target.value)}
                  disabled={emails[activeEmailCandidate.id]?.loading}
                  rows={11}
                  className="w-full rounded-xl border border-primary/10 bg-warm-bg/20 py-3 px-4 text-xs leading-relaxed text-warm-text outline-none focus:border-primary focus:bg-white"
                />
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-[10px] text-warm-text/40 font-display">
                  {emails[activeEmailCandidate.id]?.loading ? 'Drafting...' : 'You can customize this draft before copy/sending.'}
                </span>

                <div className="flex space-x-2">
                  <button
                    onClick={copyToClipboard}
                    disabled={emails[activeEmailCandidate.id]?.loading}
                    className="inline-flex items-center space-x-1.5 rounded-lg border border-primary/15 px-4 py-2 text-xs font-semibold text-primary/75 hover:bg-primary/5 cursor-pointer disabled:opacity-50"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Text</span>
                  </button>

                  <button
                    onClick={() => {
                      triggerToast(`Draft saved & match scheduled for ${customer.firstName}!`, 'success');
                      setActiveEmailCandidate(null);
                    }}
                    disabled={emails[activeEmailCandidate.id]?.loading}
                    className="inline-flex items-center space-x-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-light cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Approve & Send</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mock Send Match Toast Modal */}
      {sentMatchCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary-dark/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-b from-primary/10 to-transparent p-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Heart className="h-6 w-6 fill-primary" />
              </div>
              <h3 className="font-serif text-lg font-bold text-primary">Send Curated Match</h3>
              <p className="text-2xs text-warm-text/60 mt-1 leading-relaxed">
                Confirm sending details of candidate <strong>{sentMatchCandidate.firstName} {sentMatchCandidate.lastName}</strong> to client <strong>{customer.firstName}</strong>.
              </p>
            </div>

            <div className="px-6 pb-6 space-y-4">
              <div className="rounded-xl border border-primary/5 bg-warm-bg/50 p-4 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-warm-text/40">Recipients:</span>
                  <span className="font-semibold">{customer.email}</span>
                </div>
                <div className="flex justify-between border-t border-primary/5 pt-2">
                  <span className="text-warm-text/40">Candidate Name:</span>
                  <span className="font-semibold">{sentMatchCandidate.firstName} {sentMatchCandidate.lastName} ({sentMatchCandidate.id})</span>
                </div>
                <div className="flex justify-between border-t border-primary/5 pt-2">
                  <span className="text-warm-text/40">Candidate Job:</span>
                  <span className="font-semibold">{sentMatchCandidate.designation} at {sentMatchCandidate.company}</span>
                </div>
                <div className="flex justify-between border-t border-primary/5 pt-2">
                  <span className="text-warm-text/40">Candidate Location:</span>
                  <span className="font-semibold">{sentMatchCandidate.city}</span>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={() => setSentMatchCandidate(null)}
                  className="rounded-lg border border-primary/10 px-4 py-2 text-xs font-semibold text-primary/70 hover:bg-primary/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmSendMatch}
                  className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-light cursor-pointer shadow-sm"
                >
                  Send Match Profiles
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
