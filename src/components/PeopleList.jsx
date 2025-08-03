import React from 'react'

export default function PeopleList({ people, onSelect, onBack }) {
  return (
    <div className="people-list">
      <button onClick={onBack}>← Назад к карте</button>
      <h2>Список людей</h2>
      <ul>
        {people.map((person) => (
          <li key={person.id}>
            <button onClick={() => onSelect(person)}>
              {person.lastName} {person.firstName} {person.middleName}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}