import axios from 'axios';
import { Collaborator } from '../types';
import { API_URL, API_KEY } from '../lib/env';

interface StrapiData<T> { data: T }
interface StrapiList<T> { data: T[] }

export type CreateCollaboratorRequest = Omit<Collaborator, 'id' | 'documentId' | 'createdAt' | 'updatedAt' | 'publishedAt' | 'users_permissions_user'> & {
  users_permissions_user?: number | null;
};

export type UpdateCollaboratorRequest = Partial<CreateCollaboratorRequest>;

class CollaboratorService {
  private getAuthHeaders() {
    if (API_KEY) return { Authorization: `Bearer ${API_KEY}` };
    const token = localStorage.getItem('token') || localStorage.getItem('jwt');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async list(): Promise<Collaborator[]> {
    const res = await axios.get<StrapiList<Collaborator>>(`${API_URL}/api/collaborators`, {
      headers: this.getAuthHeaders(),
      params: { populate: ['users_permissions_user'] },
    });
    console.log(res);
    return res.data.data;
  }

  async create(payload: CreateCollaboratorRequest): Promise<Collaborator> {
    const data = {
      ...payload,
      users_permissions_user: payload.users_permissions_user ?? null,
    };
    const res = await axios.post<StrapiData<Collaborator>>(
      `${API_URL}/api/collaborators`,
      { data },
      { headers: { ...this.getAuthHeaders(), 'Content-Type': 'application/json' } }
    );
    return res.data.data;
  }

  async update(collaborator: Collaborator, payload: UpdateCollaboratorRequest): Promise<Collaborator> {
    const identifier = collaborator.documentId || collaborator.id;
    const data = {
      ...payload,
      users_permissions_user: payload.users_permissions_user ?? (payload.users_permissions_user === null ? null : undefined),
    };
    const res = await axios.put<StrapiData<Collaborator>>(
      `${API_URL}/api/collaborators/${identifier}`,
      { data },
      { headers: { ...this.getAuthHeaders(), 'Content-Type': 'application/json' } }
    );
    return res.data.data;
  }

  async remove(collaborator: Collaborator): Promise<void> {
    const identifier = collaborator.documentId || collaborator.id;
    await axios.delete(`${API_URL}/api/collaborators/${identifier}`, {
      headers: this.getAuthHeaders(),
    });
  }
}

export const collaboratorService = new CollaboratorService();


