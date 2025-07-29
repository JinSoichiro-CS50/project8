import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Person } from "@shared/schema";
import BirthdayTimeline from "@/components/birthday-timeline";
import BirthdayCard from "@/components/birthday-card";
import PersonModal from "@/components/person-modal";
import DeleteModal from "@/components/delete-modal";
import StatsSection from "@/components/stats-section";
import { downloadCSV } from "@/lib/csv-utils";
import { Search, Plus, Download, Cake } from "lucide-react";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [isPersonModalOpen, setIsPersonModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [personToDelete, setPersonToDelete] = useState<Person | null>(null);

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
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading birthdays...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Header */}
      <header className="bg-black bg-opacity-30 backdrop-blur-md border-b border-white border-opacity-20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                <Cake className="inline-block text-yellow-400 mr-3 h-8 w-8" />
                Birthday Timeline
              </h1>
              <p className="text-blue-200 mt-2">Family & Friends Celebration Calendar</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search by name..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white bg-opacity-20 border border-white border-opacity-30 rounded-full px-4 py-2 pl-10 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-opacity-30"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-200 h-4 w-4" />
              </div>
              <button 
                onClick={handleAddPerson}
                className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-6 py-2 rounded-full transition-colors"
              >
                <Plus className="inline-block mr-2 h-4 w-4" />
                Add Person
              </button>
              <button 
                onClick={handleExportCSV}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded-full transition-colors"
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

      {/* Timeline Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="bg-white bg-opacity-5 backdrop-blur-md rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white text-center mb-8">Yearly Birthday Timeline</h2>
          <BirthdayTimeline 
            people={validPeople} 
            onMonthClick={handleMonthClick}
            selectedMonth={selectedMonth}
          />
        </div>
      </section>

      {/* Birthday Cards Section */}
      <section className="container mx-auto px-4 py-8">
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
          <div className="text-center text-white text-xl py-12">
            {searchTerm || selectedMonth ? 'No matching birthdays found' : 'No birthdays to display'}
          </div>
        )}
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
