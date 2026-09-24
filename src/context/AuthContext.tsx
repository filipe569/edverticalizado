import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/concurso';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  login: (username: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  switchUserDirect: (userId: string) => boolean;
  createUser: (userData: {
    username: string;
    name: string;
    password: string;
    role: 'admin' | 'aluno';
    color?: string;
  }) => { success: boolean; error?: string };
  updateUser: (
    id: string,
    updates: Partial<Omit<User, 'id' | 'createdAt'>>
  ) => { success: boolean; error?: string };
  deleteUser: (id: string) => { success: boolean; error?: string };
}

const DEFAULT_USERS: User[] = [
  {
    id: 'user-admin-1',
    username: 'admin',
    name: 'Administrador Geral',
    password: 'admin',
    role: 'admin',
    createdAt: '2026-01-01',
    color: '#C8102E',
  },
  {
    id: 'user-aluno-1',
    username: 'aluno',
    name: 'Estudante Focado',
    password: '123',
    role: 'aluno',
    createdAt: '2026-01-02',
    color: '#0D134C',
  },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem('edital_users_db');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Erro ao ler usuários:', e);
    }
    return DEFAULT_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const savedId = localStorage.getItem('edital_current_user_id');
      const savedUsers = localStorage.getItem('edital_users_db');
      const list: User[] = savedUsers ? JSON.parse(savedUsers) : DEFAULT_USERS;

      if (savedId) {
        const found = list.find((u) => u.id === savedId);
        if (found) return found;
      }
      // Default to first user (admin) if not explicitly logged out
      return list[0] || null;
    } catch {
      return DEFAULT_USERS[0];
    }
  });

  // Save users to localStorage and sync to server
  useEffect(() => {
    try {
      localStorage.setItem('edital_users_db', JSON.stringify(users));
      // Sync to server
      fetch('/api/db/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ users }),
      }).catch((e) => console.warn('Falha silenciosa ao sincronizar usuários com o servidor:', e));
    } catch (e) {
      console.error('Erro ao salvar usuários:', e);
    }
  }, [users]);

  // Fetch initial users from server on mount (cross-browser sync)
  useEffect(() => {
    fetch('/api/db/users')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.users) && data.users.length > 0) {
          setUsers(data.users);
          // If currentUser is not in list, fallback to first
          setCurrentUser((curr) => {
            if (!curr) return data.users[0];
            const found = data.users.find((u: User) => u.id === curr.id);
            return found || data.users[0];
          });
        }
      })
      .catch((e) => console.warn('Servidor offline ou sem conexão no momento:', e));
  }, []);

  // Save current user to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('edital_current_user_id', currentUser.id);
    } else {
      localStorage.removeItem('edital_current_user_id');
    }
  }, [currentUser]);

  const login = (username: string, password: string) => {
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    const user = users.find(
      (u) => u.username.toLowerCase() === cleanUser && u.password === cleanPass
    );

    if (user) {
      setCurrentUser(user);
      return { success: true };
    }
    return { success: false, error: 'Usuário ou senha incorretos.' };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const switchUserDirect = (userId: string) => {
    // Only admins can switch users directly without password
    if (currentUser && currentUser.role !== 'admin') {
      return false;
    }
    const user = users.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const createUser = (userData: {
    username: string;
    name: string;
    password: string;
    role: 'admin' | 'aluno';
    color?: string;
  }) => {
    // Enforce admin permission
    if (currentUser && currentUser.role !== 'admin') {
      return { success: false, error: 'Apenas administradores podem cadastrar novos usuários.' };
    }

    const cleanUser = userData.username.trim().toLowerCase();
    if (!cleanUser) {
      return { success: false, error: 'O nome de usuário não pode ser vazio.' };
    }
    if (cleanUser.includes(' ')) {
      return { success: false, error: 'O nome de usuário não deve conter espaços.' };
    }
    if (!userData.password || userData.password.trim().length === 0) {
      return { success: false, error: 'A senha é obrigatória.' };
    }

    const exists = users.some((u) => u.username.toLowerCase() === cleanUser);
    if (exists) {
      return { success: false, error: `O usuário "${cleanUser}" já existe.` };
    }

    const newUser: User = {
      id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      username: cleanUser,
      name: userData.name.trim() || cleanUser,
      password: userData.password.trim(),
      role: userData.role || 'aluno',
      createdAt: new Date().toISOString().slice(0, 10),
      color: userData.color || '#0D134C',
    };

    setUsers((prev) => [...prev, newUser]);
    return { success: true };
  };

  const updateUser = (id: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>) => {
    // Non-admins can only update their own profile and cannot elevate their role to admin
    if (currentUser && currentUser.role !== 'admin') {
      if (currentUser.id !== id) {
        return { success: false, error: 'Você não tem permissão para editar outros usuários.' };
      }
      if (updates.role && updates.role !== 'aluno') {
        return { success: false, error: 'Apenas administradores podem alterar o perfil de permissões.' };
      }
    }

    if (updates.username) {
      const cleanUser = updates.username.trim().toLowerCase();
      const conflict = users.some(
        (u) => u.id !== id && u.username.toLowerCase() === cleanUser
      );
      if (conflict) {
        return { success: false, error: `O nome de usuário "${cleanUser}" já está em uso.` };
      }
      updates.username = cleanUser;
    }

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const updated = { ...u, ...updates };
          if (currentUser?.id === id) {
            setCurrentUser(updated);
          }
          return updated;
        }
        return u;
      })
    );

    return { success: true };
  };

  const deleteUser = (id: string) => {
    // Enforce admin permission
    if (currentUser && currentUser.role !== 'admin') {
      return { success: false, error: 'Apenas administradores podem excluir usuários.' };
    }

    if (users.length <= 1) {
      return { success: false, error: 'Não é possível excluir o único usuário do sistema.' };
    }

    if (currentUser?.id === id) {
      return {
        success: false,
        error: 'Você não pode excluir o usuário conectado no momento. Alterne para outro antes de excluir.',
      };
    }

    setUsers((prev) => prev.filter((u) => u.id !== id));

    // Clean up local storage keys for deleted user
    try {
      localStorage.removeItem(`gran_concursos_u_${id}`);
      localStorage.removeItem(`gran_active_id_u_${id}`);
      localStorage.removeItem(`gran_progress_u_${id}`);
      localStorage.removeItem(`gran_historico_u_${id}`);
      localStorage.removeItem(`gran_revisoes_u_${id}`);
    } catch (e) {}

    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        login,
        logout,
        switchUserDirect,
        createUser,
        updateUser,
        deleteUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
