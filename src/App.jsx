import React, { useState } from "react";
import Map from "./components/Map";
import PeopleList from "./components/PeopleList";
import PersonCard from "./components/PersonCard";
import PersonForm from "./components/PersonForm";
import { useData } from "./data/useData";

export default function App() {
  const { data, setData, loading } = useData();
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingPerson, setEditingPerson] = useState(null);

  if (loading) return <p>Загрузка...</p>;

  const people = selectedRegion
      ? data.filter((p) => p.region === selectedRegion)
      : [];

  const handleSavePerson = (personData) => {
    if (editingPerson) {
      // Редактирование
      const updatedPerson = { ...editingPerson, ...personData };
      setData((prev) =>
          prev.map((p) => (p.id === editingPerson.id ? updatedPerson : p))
      );
    } else {
      // Добавление
      const newPerson = {
        id: Date.now().toString(),
        ...personData,
        region: selectedRegion,
      };
      setData((prev) => [...prev, newPerson]);
    }

    setIsAdding(false);
    setEditingPerson(null);
  };

  const handleDeletePerson = (id) => {
    if (window.confirm("Удалить этого человека?")) {
      setData((prev) => prev.filter((p) => p.id !== id));
      setSelectedPerson(null);
    }
  };

  return (
      <div className="app">
        <h1>Журнал памяти</h1>

        {!selectedRegion && !selectedPerson && !isAdding && (
            <Map onSelect={setSelectedRegion} />
        )}

        {selectedRegion && !selectedPerson && !isAdding && (
            <>
              <button onClick={() => setIsAdding(true)}>➕ Добавить человека</button>
              <PeopleList
                  people={people}
                  onSelect={setSelectedPerson}
                  onBack={() => setSelectedRegion(null)}
              />
            </>
        )}

        {isAdding && (
            <PersonForm
                initialData={editingPerson || { region: selectedRegion }}
                onSave={handleSavePerson}
                onCancel={() => {
                  setIsAdding(false);
                  setEditingPerson(null);
                }}
            />
        )}

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
                  setEditingPerson(selectedPerson);
                  setSelectedPerson(null);
                  setIsAdding(true);
                }}
            />
        )}
      </div>
  );
}
