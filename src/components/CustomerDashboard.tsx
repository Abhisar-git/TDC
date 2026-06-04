'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Filter, ArrowUpDown, Users, HeartHandshake, UserPlus, ToggleLeft, ArrowRight, UserCheck, RefreshCw } from 'lucide-react';
import { Customer } from '@/types';
import { calculateAge } from '@/lib/matching';

interface CustomerDashboardProps {
  initialCustomers: Customer[];
}

export default function CustomerDashboard({ initialCustomers }: CustomerDashboardProps) {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState<'All' | 'Male' | 'Female'>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [sortField, setSortField] = useState<'name' | 'age' | 'income'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Stats calculation
  const stats = useMemo(() => {
    const total = customers.length;
    const active = customers.filter(c => c.status === 'Active').length;
    const matched = customers.filter(c => c.status === 'Matched').length;
    const onboarding = customers.filter(c => c.status === 'Onboarding').length;
    const male = customers.filter(c => c.gender === 'Male').length;
    const female = customers.filter(c => c.gender === 'Female').length;

    return { total, active, matched, onboarding, male, female };
  }, [customers]);

  // Handle Sort
  const handleSort = (field: 'name' | 'age' | 'income') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filter & Sort customers
  const filteredCustomers = useMemo(() => {
    return customers
      .filter((c) => {
        const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
        const matchesSearch = fullName.includes(search.toLowerCase()) || 
                              c.city.toLowerCase().includes(search.toLowerCase()) || 
                              c.designation.toLowerCase().includes(search.toLowerCase());
        
        const matchesGender = genderFilter === 'All' || c.gender === genderFilter;
        const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
        
        return matchesSearch && matchesGender && matchesStatus;
      })
      .sort((a, b) => {
        let valA: any;
        let valB: any;

        if (sortField === 'name') {
          valA = `${a.firstName} ${a.lastName}`.toLowerCase();
          valB = `${b.firstName} ${b.lastName}`.toLowerCase();
        } else if (sortField === 'age') {
          valA = calculateAge(a.dob);
          valB = calculateAge(b.dob);
        } else if (sortField === 'income') {
          valA = a.income;
          valB = b.income;
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [customers, search, genderFilter, statusFilter, sortField, sortOrder]);

  const getStatusBadge = (status: Customer['status']) => {
    const styles = {
      Onboarding: 'bg-indigo-50 text-indigo-700 border-indigo-200/50',
      Active: 'bg-green-50 text-green-700 border-green-200/50',
      Matched: 'bg-pink-50 text-pink-700 border-pink-200/50',
      Paused: 'bg-amber-50 text-amber-700 border-amber-200/50',
    };
    return (
      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide ${styles[status]}`}>
        {status}
      </span>
    );
  };

  const getGenderColor = (gender: Customer['gender']) => {
    return gender === 'Male' 
      ? 'bg-blue-50 text-blue-700 border-blue-200/40' 
      : 'bg-rose-50 text-rose-700 border-rose-200/40';
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      
      {/* Welcome Banner */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-primary">Matchmaker Dashboard</h2>
          <p className="mt-1 text-sm text-warm-text/60">
            Monitor client pipelines, verify matchmaking preferences, and connect soulmates.
          </p>
        </div>
        <div className="mt-4 flex space-x-2 md:mt-0 text-xs text-warm-text/40 font-display">
          <span>Current pool size: <strong>{stats.total}</strong> profiles ({stats.male} M / {stats.female} F)</span>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {/* Total Customers */}
        <div className="rounded-2xl border border-primary/5 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-warm-text/50 font-display">
              Total Clients
            </span>
            <div className="rounded-lg bg-primary/5 p-2 text-primary">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline">
            <span className="text-2xl font-bold font-serif text-primary">{stats.total}</span>
            <span className="ml-1 text-[10px] text-warm-text/40">Registered</span>
          </div>
        </div>

        {/* Active Clients */}
        <div className="rounded-2xl border border-primary/5 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-warm-text/50 font-display">
              Active Pipeline
            </span>
            <div className="rounded-lg bg-green-50 p-2 text-green-600">
              <UserCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline">
            <span className="text-2xl font-bold font-serif text-primary">{stats.active}</span>
            <span className="ml-1 text-[10px] text-green-600/80">Active</span>
          </div>
        </div>

        {/* Matched Clients */}
        <div className="rounded-2xl border border-primary/5 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-warm-text/50 font-display">
              Matches Found
            </span>
            <div className="rounded-lg bg-pink-50 p-2 text-pink-600">
              <HeartHandshake className="h-5 w-5 animate-pulse" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline">
            <span className="text-2xl font-bold font-serif text-primary">{stats.matched}</span>
            <span className="ml-1 text-[10px] text-pink-600/80">Success Cases</span>
          </div>
        </div>

        {/* Onboarding Clients */}
        <div className="rounded-2xl border border-primary/5 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-warm-text/50 font-display">
              Onboarding
            </span>
            <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
              <UserPlus className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline">
            <span className="text-2xl font-bold font-serif text-primary">{stats.onboarding}</span>
            <span className="ml-1 text-[10px] text-indigo-600/80">Awaiting Match</span>
          </div>
        </div>
      </div>

      {/* Table Controls (Search & Filters) */}
      <div className="mb-6 rounded-2xl border border-primary/10 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-warm-text/40">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Search by client name, designation, city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-primary/10 bg-warm-bg/50 py-2.5 pl-10 pr-4 text-xs text-warm-text outline-none transition-all focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Filter dropdowns */}
          <div className="flex flex-wrap gap-2 items-center">
            {/* Gender filter */}
            <div className="flex items-center space-x-1">
              <span className="text-[10px] uppercase font-bold text-warm-text/40 font-display mr-1">Gender:</span>
              {(['All', 'Male', 'Female'] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => setGenderFilter(g)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold border transition-all cursor-pointer ${
                    genderFilter === g
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'bg-warm-bg text-warm-text/75 border-primary/10 hover:bg-primary/5'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-1">
              <span className="text-[10px] uppercase font-bold text-warm-text/40 font-display mr-1 ml-2">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-primary/10 bg-warm-bg px-2 py-1.5 text-xs font-semibold text-warm-text outline-none transition-all focus:border-primary cursor-pointer hover:bg-primary/5"
              >
                <option value="All">All Statuses</option>
                <option value="Onboarding">Onboarding</option>
                <option value="Active">Active</option>
                <option value="Matched">Matched</option>
                <option value="Paused">Paused</option>
              </select>
            </div>
          </div>

        </div>
      </div>

      {/* Customer List Grid / Table */}
      <div className="overflow-hidden rounded-2xl border border-primary/10 bg-white shadow-sm">
        {filteredCustomers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <Users className="h-10 w-10 text-warm-text/20 mb-3" />
            <h3 className="font-serif text-base font-bold text-primary">No customers found</h3>
            <p className="text-xs text-warm-text/60 mt-1">
              Adjust your search query or filters to explore other profiles in the database.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-primary/5 border-b border-primary/10">
                <tr className="text-xs font-bold uppercase tracking-wider text-primary font-display">
                  <th 
                    className="px-6 py-4 cursor-pointer select-none hover:bg-primary/10 transition-colors"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Client Name</span>
                      <ArrowUpDown className="h-3.5 w-3.5 opacity-60" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 cursor-pointer select-none hover:bg-primary/10 transition-colors"
                    onClick={() => handleSort('age')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Age</span>
                      <ArrowUpDown className="h-3.5 w-3.5 opacity-60" />
                    </div>
                  </th>
                  <th className="px-6 py-4">Gender</th>
                  <th className="px-6 py-4">City</th>
                  <th className="px-6 py-4">Designation</th>
                  <th 
                    className="px-6 py-4 cursor-pointer select-none hover:bg-primary/10 transition-colors"
                    onClick={() => handleSort('income')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Annual Income</span>
                      <ArrowUpDown className="h-3.5 w-3.5 opacity-60" />
                    </div>
                  </th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5">
                {filteredCustomers.map((customer) => {
                  const age = calculateAge(customer.dob);
                  return (
                    <tr 
                      key={customer.id} 
                      onClick={() => router.push(`/customers/${customer.id}`)}
                      className="group cursor-pointer hover:bg-primary/5 transition-colors"
                    >
                      {/* Name */}
                      <td className="whitespace-nowrap px-6 py-4 font-medium text-warm-text">
                        <div className="flex flex-col">
                          <span className="font-serif text-sm font-semibold group-hover:text-primary transition-colors">
                            {customer.firstName} {customer.lastName}
                          </span>
                          <span className="text-[10px] text-warm-text/40 mt-0.5">{customer.id}</span>
                        </div>
                      </td>

                      {/* Age */}
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="text-xs font-semibold">{age} yrs</span>
                      </td>

                      {/* Gender */}
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className={`inline-flex items-center rounded px-2 py-0.5 text-2xs font-bold border uppercase tracking-wider ${getGenderColor(customer.gender)}`}>
                          {customer.gender}
                        </span>
                      </td>

                      {/* City */}
                      <td className="whitespace-nowrap px-6 py-4 text-xs font-medium text-warm-text/75">
                        {customer.city}
                      </td>

                      {/* Designation */}
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-warm-text/75">{customer.designation}</span>
                          <span className="text-[10px] text-warm-text/40">{customer.company}</span>
                        </div>
                      </td>

                      {/* Income */}
                      <td className="whitespace-nowrap px-6 py-4 text-xs font-semibold text-warm-text/75">
                        ₹{(customer.income / 100000).toFixed(1)} Lakh/yr
                      </td>

                      {/* Status */}
                      <td className="whitespace-nowrap px-6 py-4">
                        {getStatusBadge(customer.status)}
                      </td>

                      {/* Link Trigger */}
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <button className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-all cursor-pointer">
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
