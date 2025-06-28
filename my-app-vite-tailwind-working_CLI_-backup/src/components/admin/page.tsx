import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

const GetUsers = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = Cookies.get('jwtToken');
        const response = await axios.get('http://localhost:8080/api/auth/users', {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        setUsers(response.data);
      } catch {
        setError('Failed to fetch users. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <p>Loading users...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="mt-4 p-4 bg-black bg-opacity-70 rounded-lg">
      <h2 className="text-xl font-semibold mb-4">User List:</h2>
      <ul className="space-y-2 max-h-96 overflow-auto">
        {users.map((user) => (
          <li key={user.id} className="text-sm">
            <span className="font-semibold">{user.name}</span> -{' '}
            <span className="text-gray-400">{user.email}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GetUsers;
