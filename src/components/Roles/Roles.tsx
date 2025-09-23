import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, ToggleLeft, ToggleRight, Shield, Users } from 'lucide-react';
import { Role } from '../../types';
import { roleService } from '../../services/roleService';
import { RoleModal } from './RoleModal';
import { ConfirmDialog } from './ConfirmDialog';

export const Roles: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [filteredRoles, setFilteredRoles] = useState<Role[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para modales
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

  useEffect(() => {
    loadRoles();
  }, []);

  useEffect(() => {
    filterRoles();
  }, [roles, searchTerm]);

  const loadRoles = async () => {
    try {
      setLoading(true);
      setError(null);
      const rolesData = await roleService.getRoles();
      setRoles(rolesData);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los roles');
    } finally {
      setLoading(false);
    }
  };

  const filterRoles = () => {
    if (!searchTerm.trim()) {
      setFilteredRoles(roles);
      return;
    }

    const filtered = roles.filter(role =>
      role.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (role.descripcion && role.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredRoles(filtered);
  };

  const handleCreateRole = () => {
    setEditingRole(null);
    setShowModal(true);
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setShowModal(true);
  };

  const handleDeleteRole = (role: Role) => {
    setRoleToDelete(role);
    setShowConfirmDialog(true);
  };

  const confirmDeleteRole = async () => {
    if (!roleToDelete) return;

    try {
      await roleService.deleteRole(roleToDelete);
      await loadRoles();
      setShowConfirmDialog(false);
      setRoleToDelete(null);
    } catch (err: any) {
      setError(err.message || 'Error al eliminar el rol');
    }
  };

  const handleToggleStatus = async (role: Role) => {
    try {
      await roleService.toggleRoleStatus(role, !role.activo);
      await loadRoles();
    } catch (err: any) {
      setError(err.message || 'Error al cambiar el estado del rol');
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingRole(null);
  };

  const handleModalSave = async () => {
    await loadRoles();
    handleModalClose();
  };

  const getLevelColor = (nivel: number) => {
    if (nivel <= 2) return 'bg-red-100 text-red-800';
    if (nivel <= 5) return 'bg-yellow-100 text-yellow-800';
    if (nivel <= 7) return 'bg-blue-100 text-blue-800';
    return 'bg-green-100 text-green-800';
  };

  const getPermissionsCount = (role: Role) => {
    let totalPermissions = 0;
    let activePermissions = 0;

    Object.values(role.permisos).forEach(modulePerms => {
      Object.values(modulePerms).forEach(permission => {
        totalPermissions++;
        if (permission) activePermissions++;
      });
    });

    return { active: activePermissions, total: totalPermissions };
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Shield className="h-6 w-6 text-blue-600" />
              Gestión de Roles
            </h1>
            <p className="text-gray-600 mt-1">
              Administra los roles y permisos del sistema
            </p>
          </div>
          <button
            onClick={handleCreateRole}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Nuevo Rol
          </button>
        </div>

        {/* Barra de búsqueda */}
        <div className="mt-6 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Buscar roles por nombre o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Lista de roles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredRoles.map((role) => {
          const permissionsCount = getPermissionsCount(role);
          return (
            <div
              key={role.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {role.nombre}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(role.nivel)}`}>
                      Nivel {role.nivel}
                    </span>
                  </div>
                  {role.descripcion && (
                    <p className="text-gray-600 text-sm mb-3">
                      {role.descripcion}
                    </p>
                  )}
                </div>
                
                <button
                  onClick={() => handleToggleStatus(role)}
                  className={`p-1 rounded transition-colors ${
                    role.activo
                      ? 'text-green-600 hover:text-green-700'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                  title={role.activo ? 'Desactivar rol' : 'Activar rol'}
                >
                  {role.activo ? (
                    <ToggleRight className="h-6 w-6" />
                  ) : (
                    <ToggleLeft className="h-6 w-6" />
                  )}
                </button>
              </div>

              <div className="mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>
                    {permissionsCount.active} de {permissionsCount.total} permisos activos
                  </span>
                </div>
                <div className="mt-2 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(permissionsCount.active / permissionsCount.total) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                  Creado: {new Date(role.createdAt).toLocaleDateString('es-ES')}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditRole(role)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar rol"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteRole(role)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar rol"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredRoles.length === 0 && !loading && (
        <div className="text-center py-12">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No se encontraron roles' : 'No hay roles creados'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm
              ? 'Intenta con otros términos de búsqueda'
              : 'Crea tu primer rol para comenzar a gestionar permisos'}
          </p>
          {!searchTerm && (
            <button
              onClick={handleCreateRole}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Crear Primer Rol
            </button>
          )}
        </div>
      )}

      {/* Modal para crear/editar rol */}
      {showModal && (
        <RoleModal
          role={editingRole}
          onClose={handleModalClose}
          onSave={handleModalSave}
        />
      )}

      {/* Diálogo de confirmación para eliminar */}
      {showConfirmDialog && roleToDelete && (
        <ConfirmDialog
          title="Eliminar Rol"
          message={`¿Estás seguro de que deseas eliminar el rol "${roleToDelete.nombre}"? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          cancelText="Cancelar"
          onConfirm={confirmDeleteRole}
          onCancel={() => {
            setShowConfirmDialog(false);
            setRoleToDelete(null);
          }}
          type="danger"
        />
      )}
    </div>
  );
};
