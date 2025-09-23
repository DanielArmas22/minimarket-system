import React, { useState, useEffect } from "react";
import { Customer, Role } from "../../types";
import { userService } from "../../services/userService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { UserForm } from "./UserForm";
import { Plus, Search, Edit, Trash2, UserCheck, UserX } from "lucide-react";

export const UserList: React.FC = () => {
  const [users, setUsers] = useState<Customer[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<Customer | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    user: Customer | null;
  }>({ open: false, user: null });

  useEffect(() => {
    loadUsers();
    loadRoles();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getUsers();
      setUsers(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los usuarios",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const response = await userService.getRoles();
      setRoles(response.data);
    } catch (error) {
      console.error("Error loading roles:", error);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadUsers();
      return;
    }

    try {
      setLoading(true);
      const response = await userService.searchUsers(searchTerm);
      setUsers(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Error en la búsqueda",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNewUser = () => {
    setEditingUser(null);
    setShowForm(true);
  };

  const handleEditUser = (user: Customer) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const handleDeleteUser = (user: Customer) => {
    setDeleteDialog({ open: true, user });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.user) return;

    try {
      await userService.deleteUser(deleteDialog.user.id);
      toast({
        title: "Éxito",
        description: "Usuario eliminado correctamente",
      });
      loadUsers();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el usuario",
        variant: "destructive",
      });
    } finally {
      setDeleteDialog({ open: false, user: null });
    }
  };

  const handleToggleStatus = async (user: Customer) => {
    try {
      await userService.toggleUserStatus(user.id, !user.estado);
      toast({
        title: "Éxito",
        description: `Usuario ${
          !user.estado ? "activado" : "desactivado"
        } correctamente`,
      });
      loadUsers();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cambiar el estado del usuario",
        variant: "destructive",
      });
    }
  };

  const handleToggleBlocked = async (user: Customer) => {
    try {
      await userService.toggleUserBlocked(user.id, !user.blocked);
      toast({
        title: "Éxito",
        description: `Usuario ${
          !user.blocked ? "bloqueado" : "desbloqueado"
        } correctamente`,
      });
      loadUsers();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cambiar el bloqueo del usuario",
        variant: "destructive",
      });
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingUser(null);
    loadUsers();
    toast({
      title: "Éxito",
      description: editingUser
        ? "Usuario actualizado correctamente"
        : "Usuario creado correctamente",
    });
  };

  const getRoleName = (roleId: number) => {
    const role = roles.find((r) => r.id === roleId);
    return role?.name || "Sin rol";
  };

  if (showForm) {
    return (
      <UserForm
        user={editingUser}
        roles={roles}
        onSuccess={handleFormSuccess}
        onCancel={() => {
          setShowForm(false);
          setEditingUser(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Gestión de Usuarios</span>
            <Button onClick={handleNewUser} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Usuario
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} variant="outline">
              <Search className="h-4 w-4" />
            </Button>
            <Button onClick={loadUsers} variant="outline">
              Mostrar Todos
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-8">Cargando usuarios...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Bloqueado</TableHead>
                  <TableHead>Confirmado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.username}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.name || "-"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {getRoleName(user.role?.id || 0)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.estado ? "default" : "secondary"}>
                        {user.estado ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.blocked ? "destructive" : "default"}>
                        {user.blocked ? "Bloqueado" : "Activo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.confirmed ? "default" : "secondary"}>
                        {user.confirmed ? "Confirmado" : "Pendiente"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleStatus(user)}
                        >
                          {user.estado ? (
                            <UserX className="h-4 w-4" />
                          ) : (
                            <UserCheck className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteUser(user)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!loading && users.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No se encontraron usuarios
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          setDeleteDialog({ open, user: deleteDialog.user })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el
              usuario "{deleteDialog.user?.username}" del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
