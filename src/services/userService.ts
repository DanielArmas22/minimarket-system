import { Customer, Role } from '../types';

// Interfaces para el manejo de usuarios
export interface CreateUserData {
  username: string;
  email: string;
  password: string;
  name?: string;
  role?: number;
  estado?: boolean;
}

export interface UpdateUserData {
  username?: string;
  email?: string;
  password?: string;
  name?: string;
  role?: number;
  estado?: boolean;
  blocked?: boolean;
  confirmed?: boolean;
}

export interface UserResponse {
  data: Customer[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface SingleUserResponse {
  data: Customer;
}

export interface RoleResponse {
  data: Role[];
}

class UserService {
  private baseURL = 'http://localhost:1337/api';

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Obtener todos los usuarios
  async getUsers(page = 1, pageSize = 25): Promise<UserResponse> {
    return this.makeRequest<UserResponse>(
      `/users?pagination[page]=${page}&pagination[pageSize]=${pageSize}&populate=role`
    );
  }

  // Obtener usuario por ID
  async getUserById(id: string): Promise<SingleUserResponse> {
    return this.makeRequest<SingleUserResponse>(`/users/${id}?populate=role`);
  }

  // Crear nuevo usuario
  async createUser(userData: CreateUserData): Promise<SingleUserResponse> {
    return this.makeRequest<SingleUserResponse>('/auth/local/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Actualizar usuario
  async updateUser(id: string, userData: UpdateUserData): Promise<SingleUserResponse> {
    return this.makeRequest<SingleUserResponse>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Eliminar usuario
  async deleteUser(id: string): Promise<void> {
    await this.makeRequest(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Obtener roles disponibles
  async getRoles(): Promise<RoleResponse> {
    return this.makeRequest<RoleResponse>('/users-permissions/roles');
  }

  // Buscar usuarios por nombre o email
  async searchUsers(query: string): Promise<UserResponse> {
    return this.makeRequest<UserResponse>(
      `/users?filters[$or][0][name][$containsi]=${query}&filters[$or][1][email][$containsi]=${query}&populate=role`
    );
  }

  // Cambiar estado activo/inactivo
  async toggleUserStatus(id: string, estado: boolean): Promise<SingleUserResponse> {
    return this.updateUser(id, { estado });
  }

  // Bloquear/desbloquear usuario
  async toggleUserBlocked(id: string, blocked: boolean): Promise<SingleUserResponse> {
    return this.updateUser(id, { blocked });
  }

  // Confirmar usuario
  async confirmUser(id: string): Promise<SingleUserResponse> {
    return this.updateUser(id, { confirmed: true });
  }
}

export const userService = new UserService();