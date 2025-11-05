import React, { useEffect, useState } from 'react';
import { Collaborator } from '../../types';
import { collaboratorService, CreateCollaboratorRequest, UpdateCollaboratorRequest } from '../../services/collaboratorService';
import { userService } from '../../services/userService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

interface Props {
  collaborator?: Collaborator | null;
  onClose: () => void;
  onSaved: () => void;
}

export const CollaboratorModal: React.FC<Props> = ({ collaborator, onClose, onSaved }) => {
  const [form, setForm] = useState<CreateCollaboratorRequest>({
    nombres: '',
    dni: '',
    puesto: 'cajero',
    fechaIngreso: new Date().toISOString().slice(0, 10),
    fechaNacimiento: undefined,
    direccion: '',
    telefono: '',
    correo: '',
    horarioAsignado: '',
    estado: true,
    users_permissions_user: undefined,
  });
  const [users, setUsers] = useState<{ id: string; username: string; email: string }[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await userService.getUsers(1, 100);
        setUsers(res.data.map((u) => ({ id: u.id, username: u.username, email: u.email })));
      } catch (_) {
        // ignore silently
      }
    })();
  }, []);

  useEffect(() => {
    if (collaborator) {
      setForm({
        nombres: collaborator.nombres,
        dni: collaborator.dni,
        puesto: collaborator.puesto,
        fechaIngreso: collaborator.fechaIngreso,
        fechaNacimiento: collaborator.fechaNacimiento,
        direccion: collaborator.direccion,
        telefono: collaborator.telefono,
        correo: collaborator.correo,
        horarioAsignado: collaborator.horarioAsignado,
        estado: collaborator.estado,
        users_permissions_user: collaborator.users_permissions_user?.id ?? null,
      });
    }
  }, [collaborator]);

  const updateField = (key: keyof CreateCollaboratorRequest, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validate = (): string | null => {
    if (!form.nombres.trim()) return 'Los nombres son obligatorios';
    if (!form.dni.trim()) return 'El DNI es obligatorio';
    if (!form.puesto) return 'El puesto es obligatorio';
    if (!form.fechaIngreso) return 'La fecha de ingreso es obligatoria';
    return null;
  };

  const handleSave = async () => {
    const error = validate();
    if (error) {
      toast({ title: 'Validación', description: error, variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      if (collaborator) {
        const payload: UpdateCollaboratorRequest = { ...form };
        await collaboratorService.update(collaborator, payload);
        toast({ title: 'Colaborador actualizado exitosamente' });
      } else {
        await collaboratorService.create(form);
        toast({ title: 'Colaborador registrado exitosamente' });
      }
      onSaved();
    } catch (e: any) {
      toast({ title: 'Error', description: e?.message || 'No se pudo guardar', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>{collaborator ? 'Modificar Colaborador' : 'Nuevo Colaborador'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Nombres completos</Label>
              <Input value={form.nombres} onChange={(e) => updateField('nombres', e.target.value)} />
            </div>
            <div>
              <Label>DNI</Label>
              <Input value={form.dni} onChange={(e) => updateField('dni', e.target.value)} />
            </div>
            <div>
              <Label>Fecha de nacimiento</Label>
              <Input type="date" value={form.fechaNacimiento || ''} onChange={(e) => updateField('fechaNacimiento', e.target.value)} />
            </div>
            <div>
              <Label>Correo electrónico</Label>
              <Input type="email" value={form.correo || ''} onChange={(e) => updateField('correo', e.target.value)} />
            </div>
            <div>
              <Label>Dirección</Label>
              <Input value={form.direccion || ''} onChange={(e) => updateField('direccion', e.target.value)} />
            </div>
            <div>
              <Label>Teléfono</Label>
              <Input value={form.telefono || ''} onChange={(e) => updateField('telefono', e.target.value)} />
            </div>
            <div>
              <Label>Puesto</Label>
              <Select value={form.puesto} onValueChange={(v) => updateField('puesto', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cajero">Cajero</SelectItem>
                  <SelectItem value="almacenero">Almacenero</SelectItem>
                  <SelectItem value="supervisor">Supervisor</SelectItem>
                  <SelectItem value="vendedor">Vendedor</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Fecha de ingreso</Label>
              <Input type="date" value={form.fechaIngreso} onChange={(e) => updateField('fechaIngreso', e.target.value)} />
            </div>
            <div>
              <Label>Horario asignado</Label>
              <Input value={form.horarioAsignado || ''} onChange={(e) => updateField('horarioAsignado', e.target.value)} />
            </div>
            <div>
              <Label>Estado</Label>
              <Select value={form.estado ? '1' : '0'} onValueChange={(v) => updateField('estado', v === '1')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Activo</SelectItem>
                  <SelectItem value="0">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label>Vincular con usuario (opcional)</Label>
              <Select
                value={form.users_permissions_user == null ? 'none' : String(form.users_permissions_user)}
                onValueChange={(v) => updateField('users_permissions_user', v === 'none' ? null : Number(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar usuario" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin vinculación</SelectItem>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={String(u.id)}>
                      {u.username} ({u.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={saving}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>{collaborator ? 'Guardar' : 'Crear'}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};


