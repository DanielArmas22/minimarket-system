import axios from 'axios';
import { Role, CreateRoleRequest, UpdateRoleRequest, StrapiResponse, RolePermissions } from '../types';
import { API_URL, API_KEY } from '../lib/env';

class RoleService {
  private getAuthHeaders() {
    if (API_KEY) return { Authorization: `Bearer ${API_KEY}` };
    const token = localStorage.getItem('token') || localStorage.getItem('jwt');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Obtener todos los roles
  async getRoles(): Promise<Role[]> {
    try {
      const response = await axios.get<StrapiResponse<Role[]>>(`${API_URL}/api/roles`, {
        headers: this.getAuthHeaders(),
        params: {
          sort: ['nivel:asc', 'nombre:asc'],
          pagination: {
            pageSize: 100
          }
        }
      });

      return response.data.data;
    } catch (error) {
      console.error('Error al obtener roles:', error);
      throw new Error('No se pudieron cargar los roles');
    }
  }

  // Obtener roles activos
  async getActiveRoles(): Promise<Role[]> {
    try {
      const response = await axios.get<StrapiResponse<Role[]>>(`${API_URL}/api/roles/active`, {
        headers: this.getAuthHeaders(),
      });

      return response.data.data;
    } catch (error) {
      console.error('Error al obtener roles activos:', error);
      throw new Error('No se pudieron cargar los roles activos');
    }
  }

  // Obtener un rol por ID o documentId
  async getRoleById(id: number | string): Promise<Role> {
    try {
      const response = await axios.get<StrapiResponse<Role>>(`${API_URL}/api/roles/${id}`, {
        headers: this.getAuthHeaders(),
      });

      return response.data.data;
    } catch (error) {
      console.error('Error al obtener el rol:', error);
      throw new Error('No se pudo cargar el rol');
    }
  }

  // Crear un nuevo rol
  async createRole(roleData: CreateRoleRequest): Promise<Role> {
    try {
      const response = await axios.post<StrapiResponse<Role>>(
        `${API_URL}/api/roles`,
        { data: roleData },
        {
          headers: {
            ...this.getAuthHeaders(),
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.data;
    } catch (error: any) {
      console.error('Error al crear el rol:', error);
      if (error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      throw new Error('No se pudo crear el rol');
    }
  }

  // Actualizar un rol existente (usa documentId)
  async updateRole(role: Role, roleData: UpdateRoleRequest): Promise<Role> {
    try {
      // Usar documentId para Strapi 5.x
      const identifier = role.documentId || role.id;
      const response = await axios.put<StrapiResponse<Role>>(
        `${API_URL}/api/roles/${identifier}`,
        { data: roleData },
        {
          headers: {
            ...this.getAuthHeaders(),
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.data;
    } catch (error: any) {
      console.error('Error al actualizar el rol:', error);
      if (error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      throw new Error('No se pudo actualizar el rol');
    }
  }

  // Eliminar un rol (usa documentId)
  async deleteRole(role: Role): Promise<void> {
    try {
      // Usar documentId para Strapi 5.x
      const identifier = role.documentId || role.id;
      await axios.delete(`${API_URL}/api/roles/${identifier}`, {
        headers: this.getAuthHeaders(),
      });
    } catch (error: any) {
      console.error('Error al eliminar el rol:', error);
      if (error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      throw new Error('No se pudo eliminar el rol');
    }
  }

  // Activar/desactivar un rol (usa documentId)
  async toggleRoleStatus(role: Role, activo: boolean): Promise<Role> {
    try {
      // Usar documentId para Strapi 5.x
      const identifier = role.documentId || role.id;
      const response = await axios.put<StrapiResponse<Role>>(
        `${API_URL}/api/roles/${identifier}`,
        { data: { activo } },
        {
          headers: {
            ...this.getAuthHeaders(),
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.data;
    } catch (error: any) {
      console.error('Error al cambiar estado del rol:', error);
      if (error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      throw new Error('No se pudo cambiar el estado del rol');
    }
  }

  // Obtener permisos por defecto para un nuevo rol
  getDefaultPermissions(): RolePermissions {
    return {
      dashboard: {
        ver: true,
        crear: false,
        editar: false,
        eliminar: false,
      },
      productos: {
        ver: false,
        crear: false,
        editar: false,
        eliminar: false,
      },
      ventas: {
        ver: false,
        crear: false,
        editar: false,
        eliminar: false,
      },
      clientes: {
        ver: false,
        crear: false,
        editar: false,
        eliminar: false,
      },
      reportes: {
        ver: false,
        crear: false,
        editar: false,
        eliminar: false,
      },
      configuracion: {
        ver: false,
        crear: false,
        editar: false,
        eliminar: false,
      },
    };
  }

  // Validar estructura de permisos
  validatePermissions(permisos: any): boolean {
    try {
      const expectedModules = ['dashboard', 'productos', 'ventas', 'clientes', 'reportes', 'configuracion'];
      const expectedActions = ['ver', 'crear', 'editar', 'eliminar'];

      if (!permisos || typeof permisos !== 'object') {
        return false;
      }

      for (const module of expectedModules) {
        if (!permisos[module] || typeof permisos[module] !== 'object') {
          return false;
        }

        for (const action of expectedActions) {
          if (typeof permisos[module][action] !== 'boolean') {
            return false;
          }
        }
      }

      return true;
    } catch (error) {
      return false;
    }
  }
}

export const roleService = new RoleService();
