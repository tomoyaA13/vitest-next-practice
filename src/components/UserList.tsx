import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface User {
  id: number;
  name: string;
  email: string;
}

export function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users');
        if (!response.ok) throw new Error('Failed to fetch users');
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className='space-y-2'>
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className='h-20 w-full' />
        ))}
      </div>
    );
  }

  if (error) {
    return <div className='text-red-500'>エラー: {error}</div>;
  }

  return (
    <div className='space-y-2'>
      {users.map((user) => (
        <Card key={user.id}>
          <CardHeader>
            <CardTitle>{user.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-gray-600'>{user.email}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
