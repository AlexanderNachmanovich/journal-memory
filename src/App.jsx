import React, { useState } from "react";
import Map from "./components/Map";
import PeopleList from "./components/PeopleList";
import PersonCard from "./components/PersonCard";
import PersonForm from "./components/PersonForm";
import RegionPeopleList from "./components/RegionPeopleList";
import { useData } from "./data/useData";
import { useAuth } from "./data/useAuth";

export default function App() {
  const { data: people, loading, reload } = useData();
  const { isAdmin, login, logout } = useAuth();

  // UI state
  const [selectedRegion, setSelectedRegion] = useState(null); // null | "Имя региона" | "__ALL__"
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingPerson, setEditingPerson] = useState(null);

  const handleSavePerson = async () => {
    await reload();
    setIsAdding(false);
    setEditingPerson(null);
  };

  const handleDeletePerson = async (id) => {
    if (window.confirm("Удалить этого человека?")) {
      try {
        await window.api.deletePerson(id);
        await reload();
        setSelectedPerson(null);
      } catch {
        alert("Операция не разрешена. Войдите как администратор.");
      }
    }
  };

  if (loading) return <p>Загрузка...</p>;

  return (
      <div className="app">
        {/* --- Главная: карта --- */}
        {!selectedRegion && !selectedPerson && !isAdding && (
            <Map
                onSelect={setSelectedRegion}
                isAdmin={isAdmin}
                onAdminLogin={login}
                onAdminLogout={logout}
            />
        )}

        {/* --- Список людей выбранного региона (разворот книги) --- */}
        {selectedRegion && selectedRegion !== "__ALL__" && !selectedPerson && !isAdding && (
            <RegionPeopleList
                region={selectedRegion}
                people={people}
                onSelect={setSelectedPerson}
                onBackToMap={() => setSelectedRegion(null)}
                onShowAll={() => setSelectedRegion("__ALL__")}
                onAdd={isAdmin ? () => { setIsAdding(true); setEditingPerson(null); } : undefined}
                isAdmin={isAdmin}
                onAdminLogout={logout}
            />
        )}

        {/* --- Общий список (разворот книги) --- */}
        {selectedRegion === "__ALL__" && !selectedPerson && !isAdding && (
            <PeopleList
                people={people}
                onSelect={setSelectedPerson}
                onBack={() => setSelectedRegion(null)}
                onAdd={isAdmin ? () => { setIsAdding(true); setEditingPerson(null); } : undefined}
                isAdmin={isAdmin}
                onAdminLogout={logout}
            />
        )}

        {/* --- Форма добавления/редактирования (разворот книги) --- */}
        {isAdding && (
            <PersonForm
                initialData={
                    editingPerson || {
                      region: selectedRegion && selectedRegion !== "__ALL__" ? selectedRegion : ""
                    }
                }
                onSave={handleSavePerson}
                onCancel={() => {
                  setIsAdding(false);
                  setEditingPerson(null);
                }}
                onBackToMap={() => {
                  setIsAdding(false);
                  setEditingPerson(null);
                  setSelectedPerson(null);
                  setSelectedRegion(null);
                }}
                isAdmin={isAdmin}
                onAdminLogout={logout}
            />
        )}

        {/* --- Карточка человека (разворот книги) --- */}
        {selectedPerson && !isAdding && (
            <PersonCard
                person={selectedPerson}
                onBackToList={() => setSelectedPerson(null)}
                onBackToMap={() => {
                  setSelectedPerson(null);
                  setSelectedRegion(null);
                }}
                onDelete={() => handleDeletePerson(selectedPerson.id)}
                onEdit={() => {
                  if (!isAdmin) {
                    alert("Только администратор может редактировать.");
                    return;
                  }
                  setEditingPerson(selectedPerson);
                  setSelectedPerson(null);
                  setIsAdding(true);
                }}
                isAdmin={isAdmin}
                onAdminLogout={logout}
            />
        )}
      </div>
  );
}
