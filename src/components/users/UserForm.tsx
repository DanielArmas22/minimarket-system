import React, { useState, useEffect } from "react";
import { Customer, Role } from "../../types";
import {
  userService,
  CreateUserData,
  UpdateUserData,
} from "../../services/userService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";

interface UserFormProps {
  user?: Customer | null;
  roles: Role[];
  onSuccess: () => void;
  onCancel: () => void;
}

export const UserForm: React.FC<UserFormProps> = ({
  user,
  roles,
  onSuccess,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    name: "",
    role: "",
    estado: true,
    blocked: false,
    confirmed: true,
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        password: "", // No mostrar password existente
        name: user.name || "",
        role: user.role?.id?.toString() || "",
        estado: user.estado ?? true,
        blocked: user.blocked ?? false,
        confirmed: user.confirmed ?? true,
      });
    }
  }, [user]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validar username
    if (!formData.username.trim()) {
      newErrors.username = "El nombre de usuario es requerido";
    } else if (formData.username.length < 3) {
      newErrors.username =
        "El nombre de usuario debe tener al menos 3 caracteres";
    }

    // Validar email
    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "El email no tiene un formato válido";
    }

    // Validar password (solo para usuarios nuevos o si se está cambiando)
    if (!user && !formData.password) {
      newErrors.password = "La contraseña es requerida para usuarios nuevos";
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    // Validar rol
    if (!formData.role) {
      newErrors.role = "Debe seleccionar un rol";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (user) {
        // Actualizar usuario existente
        const updateData: UpdateUserData = {
          username: formData.username,
          email: formData.email,
          name: formData.name || undefined,
          role: parseInt(formData.role),
          estado: formData.estado,
          blocked: formData.blocked,
          confirmed: formData.confirmed,
        };

        // Solo incluir password si se está cambiando
        if (formData.password) {
          updateData.password = formData.password;
        }

        await userService.updateUser(user.id, updateData);
      } else {
        // Crear nuevo usuario
        const createData: CreateUserData = {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          name: formData.name || undefined,
          role: parseInt(formData.role),
          estado: formData.estado,
        };

        await userService.createUser(createData);
      }

      onSuccess();
    } catch (error: any) {
      let errorMessage = "Error al guardar el usuario";

      if (error.message.includes("400")) {
        errorMessage =
          "Datos inválidos. Verifique que el email y username no estén en uso.";
      } else if (error.message.includes("409")) {
        errorMessage = "El email o nombre de usuario ya están en uso.";
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            {user ? "Editar Usuario" : "Nuevo Usuario"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username">
                  Nombre de Usuario <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) =>
                    handleInputChange("username", e.target.value)
                  }
                  placeholder="Ingrese el nombre de usuario"
                  className={errors.username ? "border-red-500" : ""}
                />
                {errors.username && (
                  <p className="text-sm text-red-500">{errors.username}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Ingrese el email"
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">
                  {user ? "Nueva Contraseña (opcional)" : "Contraseña"}
                  {!user && <span className="text-red-500">*</span>}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    placeholder={
                      user
                        ? "Dejar vacío para mantener actual"
                        : "Ingrese la contraseña"
                    }
                    className={errors.password ? "border-red-500" : ""}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password}</p>
                )}
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Nombre Completo</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Ingrese el nombre completo"
                />
              </div>

              {/* Role */}
              <div className="space-y-2">
                <Label htmlFor="role">
                  Rol <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleInputChange("role", value)}
                >
                  <SelectTrigger
                    className={errors.role ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Seleccione un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-sm text-red-500">{errors.role}</p>
                )}
              </div>
            </div>

            {/* Checkboxes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="estado"
                  checked={formData.estado}
                  onCheckedChange={(checked) =>
                    handleInputChange("estado", checked)
                  }
                />
                <Label htmlFor="estado">Usuario Activo</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="confirmed"
                  checked={formData.confirmed}
                  onCheckedChange={(checked) =>
                    handleInputChange("confirmed", checked)
                  }
                />
                <Label htmlFor="confirmed">Email Confirmado</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="blocked"
                  checked={formData.blocked}
                  onCheckedChange={(checked) =>
                    handleInputChange("blocked", checked)
                  }
                />
                <Label htmlFor="blocked">Usuario Bloqueado</Label>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-6">
              <Button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {loading
                  ? "Guardando..."
                  : user
                  ? "Actualizar"
                  : "Crear Usuario"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
