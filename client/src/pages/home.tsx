import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ThemeToggle } from '@/components/theme-toggle';
import type { Person } from '@shared/schema';
import BirthdayTimeline from "@/components/birthday-timeline";
import BirthdayCard from "@/components/birthday-card";

import StatsSection from "@/components/stats-section";
import { downloadCSV } from "@/lib/csv-utils";
import { getDaysUntilBirthday } from "@/lib/date-utils";
import { Search, Plus, Download, Cake, Calendar } from "lucide-react";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [statsFilter, setStatsFilter] = useState<'today' | 'next7Days' | 'next30Days' | 'all' | null>(null);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [isPersonModalOpen, setIsPersonModalOpen] = useState(false);
  
  const { data: people = [], isLoading } = useQuery<Person[]>({
    queryKey: ["/api/people"],
  });

  const validPeople = people.filter(person => person.month && person.day);

  const filteredPeople = validPeople.filter(person => {
    const matchesSearch = `${person.firstName} ${person.lastName}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesMonth = selectedMonth ? person.month === selectedMonth : true;
    
    let matchesStatsFilter = true;
    if (statsFilter) {
      const days = getDaysUntilBirthday(person.month!, person.day!);
      switch (statsFilter) {
        case 'today':
          matchesStatsFilter = days === 0;
          break;
        case 'next7Days':
          matchesStatsFilter = days <= 7 && days >= 0;
          break;
        case 'next30Days':
          matchesStatsFilter = days <= 30 && days > 0;
          break;
        case 'all':
          matchesStatsFilter = true;
          break;
      }
    }
    
    return matchesSearch && matchesMonth && matchesStatsFilter;
  });

  const sortedPeople = [...filteredPeople].sort((a, b) => {
    const monthOrder = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
    const aMonth = monthOrder.indexOf(a.month!);
    const bMonth = monthOrder.indexOf(b.month!);
    if (aMonth !== bMonth) return aMonth - bMonth;
    return (a.day || 0) - (b.day || 0);
  });

  const handleAddPerson = () => {
    setEditingPerson(null);
    setIsPersonModalOpen(true);
  };

  const handleEditPerson = (person: Person) => {
    setEditingPerson(person);
    setIsPersonModalOpen(true);
  };

  const handleDeletePerson = (person: Person) => {
    // TODO: Implement delete functionality
    console.log('Delete person:', person);
  };

  

  const handleExportCSV = () => {
    downloadCSV(people);
  };

  const handleMonthClick = (month: string) => {
    setSelectedMonth(selectedMonth === month ? null : month);
    setStatsFilter(null); // Clear stats filter when month is selected
  };

  const handleStatsFilterClick = (filterType: 'today' | 'next7Days' | 'next30Days' | 'all') => {
    setStatsFilter(statsFilter === filterType ? null : filterType);
    setSelectedMonth(null); // Clear month filter when stats filter is selected
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground text-xl">Loading birthdays...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ThemeToggle />
      {/* Header */}
      <header className="bg-card bg-opacity-90 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-bold text-card-foreground">
                <Cake className="inline-block text-rose-500 mr-3 h-8 w-8" />
                Birthday Timeline
              </h1>
              <p className="text-card-foreground/70 mt-2">Family & Friends Celebration Calendar</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search by name..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white border border-border rounded-lg px-4 py-2 pl-10 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              </div>
              <button 
                onClick={handleExportCSV}
                className="bg-secondary hover:bg-secondary/80 text-secondary-foreground font-semibold px-6 py-2 rounded-lg transition-colors"
              >
                <Download className="inline-block mr-2 h-4 w-4" />
                Export
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Section */}
      <StatsSection people={validPeople} onFilterClick={handleStatsFilterClick} />

      {/* Main Content */}
      <section className="container mx-auto px-4 py-8 space-y-8">
        {/* Timeline Section */}
        <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8">Yearly Birthday Timeline</h2>
          <BirthdayTimeline 
            people={validPeople} 
            onMonthClick={handleMonthClick}
            selectedMonth={selectedMonth}
          />
        </div>

        {/* Birthday Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedPeople.map(person => (
            <BirthdayCard 
              key={person.id}
              person={person}
              onEdit={handleEditPerson}
              onDelete={handleDeletePerson}
            />
          ))}
        </div>
        {filteredPeople.length === 0 && (
          <div className="text-center text-muted-foreground text-xl py-12">
            {searchTerm || selectedMonth ? 'No matching birthdays found' : 'No birthdays to display'}
          </div>
        )}
      </section>

      
    </div>
  );
}