import React, { useEffect, useState } from 'react';
import { Collaborator } from '../../types';
import { collaboratorService } from '../../services/collaboratorService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { CollaboratorModal } from './CollaboratorModal';

export const Collaborators: React.FC = () => {
  const [items, setItems] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Collaborator | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; collaborator: Collaborator | null }>({ open: false, collaborator: null });

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const list = await collaboratorService.list();
      setItems(list);
    } catch (e: any) {
      setError(e?.message || 'Error al cargar colaboradores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onNew = () => { setEditing(null); setShowForm(true); };
  const onEdit = (c: Collaborator) => { setEditing(c); setShowForm(true); };
  const onDelete = (c: Collaborator) => { setDeleteDialog({ open: true, collaborator: c }); };
  const confirmDelete = async () => {
    if (!deleteDialog.collaborator) return;
    try {
      await collaboratorService.remove(deleteDialog.collaborator);
      toast({ title: 'Colaborador eliminado exitosamente' });
      await load();
    } catch (e: any) {
      toast({ title: 'No se puede eliminar', description: e?.message || 'El colaborador tiene operaciones asociadas', variant: 'destructive' });
    } finally {
      setDeleteDialog({ open: false, collaborator: null });
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Gestión de Colaboradores</span>
            <Button onClick={onNew} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nuevo
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded">{error}</div>
          )}
          {loading ? (
            <div className="text-center py-8">Cargando...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Puesto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.nombres}</TableCell>
                    <TableCell className="capitalize">{c.puesto}</TableCell>
                    <TableCell>
                      <Badge variant={c.estado ? 'default' : 'secondary'}>{c.estado ? 'Activo' : 'Inactivo'}</Badge>
                    </TableCell>
                    <TableCell>{c.users_permissions_user ? c.users_permissions_user.username : '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="outline" onClick={() => onEdit(c)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => onDelete(c)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {!loading && items.length === 0 && (
            <div className="text-center py-8 text-gray-500">No hay colaboradores registrados</div>
          )}
        </CardContent>
      </Card>

      {showForm && (
        <CollaboratorModal
          collaborator={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSaved={() => { setShowForm(false); setEditing(null); load(); }}
        />
      )}

      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, collaborator: deleteDialog.collaborator })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar colaborador?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Está seguro de eliminar al colaborador "{deleteDialog.collaborator?.nombres}"? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};


