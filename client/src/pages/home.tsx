import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ThemeToggle } from '@/components/theme-toggle';
import type { Person } from '@shared/schema';
import BirthdayTimeline from "@/components/birthday-timeline";
import BirthdayCard from "@/components/birthday-card";
import PersonModal from "@/components/person-modal";
import DeleteModal from "@/components/delete-modal";
import StatsSection from "@/components/stats-section";
import FamilyTree from "@/components/family-tree";
import { downloadCSV } from "@/lib/csv-utils";
import { Search, Plus, Download, Cake, Calendar, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [isPersonModalOpen, setIsPersonModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [personToDelete, setPersonToDelete] = useState<Person | null>(null);
  const [activeTab, setActiveTab] = useState("timeline");

  const { data: people = [], isLoading } = useQuery<Person[]>({
    queryKey: ["/api/people"],
  });

  const validPeople = people.filter(person => person.month && person.day);

  const filteredPeople = validPeople.filter(person => {
    const matchesSearch = `${person.firstName} ${person.lastName}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesMonth = selectedMonth ? person.month === selectedMonth : true;
    return matchesSearch && matchesMonth;
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
    setPersonToDelete(person);
    setIsDeleteModalOpen(true);
  };

  const handleExportCSV = () => {
    downloadCSV(people);
  };

  const handleMonthClick = (month: string) => {
    setSelectedMonth(selectedMonth === month ? null : month);
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
                onClick={handleAddPerson}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-2 rounded-lg transition-colors"
              >
                <Plus className="inline-block mr-2 h-4 w-4" />
                Add Person
              </button>
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
      <StatsSection people={validPeople} />

      {/* Main Content Tabs */}
      <section className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Birthday Timeline
            </TabsTrigger>
            <TabsTrigger value="family-tree" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Family Tree
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="space-y-8">
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
          </TabsContent>

          <TabsContent value="family-tree">
            <div className="bg-card border border-border rounded-xl shadow-sm h-[700px]">
              <FamilyTree people={validPeople} />
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* Modals */}
      <PersonModal 
        open={isPersonModalOpen}
        onOpenChange={setIsPersonModalOpen}
        person={editingPerson}
      />

      <DeleteModal 
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        person={personToDelete}
      />
    </div>
  );
}