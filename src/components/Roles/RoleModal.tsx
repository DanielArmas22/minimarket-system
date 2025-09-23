import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Shield, Settings, BarChart3, Users, ShoppingCart, Monitor } from 'lucide-react';
import { Role, CreateRoleRequest, UpdateRoleRequest, RolePermissions } from '../../types';
import { roleService } from '../../services/roleService';

interface RoleModalProps {
  role: Role | null;
  onClose: () => void;
  onSave: () => void;
}

export const RoleModal: React.FC<RoleModalProps> = ({ role, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    nivel: 1,
    activo: true,
  });
  
  const [permisos, setPermisos] = useState<RolePermissions>(roleService.getDefaultPermissions());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  const isEditing = role !== null;

  useEffect(() => {
    if (role) {
      setFormData({
        nombre: role.nombre,
        descripcion: role.descripcion || '',
        nivel: role.nivel,
        activo: role.activo,
      });
      setPermisos(role.permisos);
    } else {
      setFormData({
        nombre: '',
        descripcion: '',
        nivel: 1,
        activo: true,
      });
      setPermisos(roleService.getDefaultPermissions());
    }
  }, [role]);

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};

    if (!formData.nombre.trim()) {
      errors.nombre = 'El nombre del rol es requerido';
    } else if (formData.nombre.length < 3) {
      errors.nombre = 'El nombre debe tener al menos 3 caracteres';
    } else if (formData.nombre.length > 100) {
      errors.nombre = 'El nombre no puede exceder 100 caracteres';
    }

    if (formData.descripcion && formData.descripcion.length > 500) {
      errors.descripcion = 'La descripción no puede exceder 500 caracteres';
    }

    if (formData.nivel < 1 || formData.nivel > 10) {
      errors.nivel = 'El nivel debe estar entre 1 y 10';
    }

    if (!roleService.validatePermissions(permisos)) {
      errors.permisos = 'La estructura de permisos no es válida';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Limpiar error de validación si existe
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handlePermissionChange = (module: string, action: string, value: boolean) => {
    setPermisos(prev => ({
      ...prev,
      [module]: {
        ...prev[module as keyof RolePermissions],
        [action]: value,
      },
    }));

    // Limpiar error de validación de permisos si existe
    if (validationErrors.permisos) {
      setValidationErrors(prev => ({
        ...prev,
        permisos: '',
      }));
    }
  };

  const handleModuleToggle = (module: string, enabled: boolean) => {
    setPermisos(prev => ({
      ...prev,
      [module]: {
        ver: enabled,
        crear: enabled,
        editar: enabled,
        eliminar: enabled,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const roleData = {
        ...formData,
        permisos,
      };

      if (isEditing && role) {
        await roleService.updateRole(role, roleData as UpdateRoleRequest);
      } else {
        await roleService.createRole(roleData as CreateRoleRequest);
      }

      onSave();
    } catch (err: any) {
      setError(err.message || 'Error al guardar el rol');
    } finally {
      setLoading(false);
    }
  };

  const getModuleIcon = (module: string) => {
    switch (module) {
      case 'dashboard': return <Monitor className="h-5 w-5" />;
      case 'productos': return <ShoppingCart className="h-5 w-5" />;
      case 'ventas': return <BarChart3 className="h-5 w-5" />;
      case 'clientes': return <Users className="h-5 w-5" />;
      case 'reportes': return <BarChart3 className="h-5 w-5" />;
      case 'configuracion': return <Settings className="h-5 w-5" />;
      default: return <Shield className="h-5 w-5" />;
    }
  };

  const getModuleName = (module: string) => {
    const names: {[key: string]: string} = {
      dashboard: 'Dashboard',
      productos: 'Productos',
      ventas: 'Ventas',
      clientes: 'Clientes',
      reportes: 'Reportes',
      configuracion: 'Configuración',
    };
    return names[module] || module;
  };

  const isModuleEnabled = (module: string) => {
    const modulePerms = permisos[module as keyof RolePermissions];
    return Object.values(modulePerms).some(permission => permission);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            {isEditing ? 'Editar Rol' : 'Crear Nuevo Rol'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              {error}
            </div>
          )}

          {/* Información básica */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Información Básica</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Rol *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange('nombre', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    validationErrors.nombre ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Ej: Administrador, Vendedor, etc."
                />
                {validationErrors.nombre && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.nombre}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nivel de Acceso (1-10)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.nivel}
                  onChange={(e) => handleInputChange('nivel', parseInt(e.target.value))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    validationErrors.nivel ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {validationErrors.nivel && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.nivel}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  Nivel más bajo = más restricciones
                </p>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => handleInputChange('descripcion', e.target.value)}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  validationErrors.descripcion ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Descripción opcional del rol..."
              />
              {validationErrors.descripcion && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.descripcion}</p>
              )}
            </div>

            <div className="mt-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.activo}
                  onChange={(e) => handleInputChange('activo', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Rol activo</span>
              </label>
            </div>
          </div>

          {/* Permisos */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Permisos por Módulo</h3>
            {validationErrors.permisos && (
              <p className="mb-4 text-sm text-red-600">{validationErrors.permisos}</p>
            )}

            <div className="space-y-6">
              {Object.entries(permisos).map(([module, modulePerms]) => (
                <div key={module} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {getModuleIcon(module)}
                      <h4 className="font-medium text-gray-900">
                        {getModuleName(module)}
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleModuleToggle(module, !isModuleEnabled(module))}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        isModuleEnabled(module)
                          ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {isModuleEnabled(module) ? 'Deshabilitar Todo' : 'Habilitar Todo'}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(modulePerms).map(([action, enabled]) => (
                      <label key={action} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={enabled}
                          onChange={(e) => handlePermissionChange(module, action, e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 capitalize">
                          {action}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="h-4 w-4" />
              )}
              {loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear Rol')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
