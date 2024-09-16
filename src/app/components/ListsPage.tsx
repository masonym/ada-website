'use client';

import React, { useEffect, useState } from 'react';

interface List {
  listId: string;
  name: string;
}

const ListsPage: React.FC = () => {
  const [lists, setLists] = useState<List[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLists = async () => {
      try {
        const response = await fetch('/api/get-lists');
        if (!response.ok) {
          throw new Error('Failed to fetch lists');
        }
        const data = await response.json();
        setLists(data.lists);
      } catch (err) {
        setError('An error occurred while fetching lists');
        console.error(err);
      }
    };

    fetchLists();
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">iContact Lists</h1>
      <ul>
        {lists.map((list) => (
          <li key={list.listId} className="mb-2">
            <span className="font-semibold">List ID:</span> {list.listId} - <span className="font-semibold">Name:</span> {list.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ListsPage;