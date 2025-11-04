import React, { useState, useEffect } from 'react';
import { Promotion } from '../../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import axios from 'axios';

export const Promotions: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [formData, setFormData] = useState({
    descripcion: '',
    tipoPromocion: 'Porcentaje',
    descuento: 0,
    fechaInicio: '',
    fechaFin: '',
    cantidadProducto: 1,
    estado: true,
  });

  useEffect(() => {
    obtenerPromociones();
  }, []);

  const obtenerPromociones = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_URL_API}/api/promotions`);
      console.log('Promociones obtenidas:', response.data);
      
      if (response.data && response.data.data) {
        setPromotions(response.data.data);
      }
    } catch (error) {
      console.error('Error al obtener promociones:', error);
      setPromotions([]);
    }
  };

  const filteredPromotions = promotions.filter(promotion =>
    promotion.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const promotionData = {
        data: {
          descripcion: formData.descripcion,
          tipoPromocion: formData.tipoPromocion,
          descuento: formData.descuento,
          fechaInicio: formData.fechaInicio,
          fechaFin: formData.fechaFin,
          cantidadProducto: formData.cantidadProducto,
          estado: formData.estado,
        }
      };

      if (editingPromotion) {
        // Actualizar promoción existente
        const response = await axios.put(
          `${import.meta.env.VITE_URL_API}/api/promotions/${editingPromotion.documentId}`,
          promotionData
        );
        console.log('Promoción actualizada:', response.data);
      } else {
        // Crear nueva promoción
        const response = await axios.post(
          `${import.meta.env.VITE_URL_API}/api/promotions`,
          promotionData
        );
        console.log('Promoción creada:', response.data);
      }

      // Recargar la lista de promociones
      await obtenerPromociones();
      resetForm();
    } catch (error) {
      console.error('Error al guardar promoción:', error);
      alert('Error al guardar la promoción. Por favor, intente nuevamente.');
    }
  };

  const resetForm = () => {
    setFormData({
      descripcion: '',
      tipoPromocion: 'Porcentaje',
      descuento: 0,
      fechaInicio: '',
      fechaFin: '',
      cantidadProducto: 1,
      estado: true,
    });
    setEditingPromotion(null);
    setShowForm(false);
  };

  const handleEdit = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setFormData({
      descripcion: promotion.descripcion,
      tipoPromocion: promotion.tipoPromocion,
      descuento: promotion.descuento,
      fechaInicio: promotion.fechaInicio.split('T')[0],
      fechaFin: promotion.fechaFin.split('T')[0],
      cantidadProducto: promotion.cantidadProducto,
      estado: promotion.estado,
    });
    setShowForm(true);
  };

  const handleDelete = async (documentId: string) => {
    try {
      await axios.delete(`${import.meta.env.VITE_URL_API}/api/promotions/${documentId}`);
      console.log('Promoción eliminada');
      await obtenerPromociones();
    } catch (error) {
      console.error('Error al eliminar promoción:', error);
      alert('Error al eliminar la promoción. Por favor, intente nuevamente.');
    }
  };

  if (showForm) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {editingPromotion ? 'Editar Promoción' : 'Nueva Promoción'}
            </h2>
            <Button variant="outline" onClick={resetForm}>
              Cancelar
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="descripcion">Descripción</Label>
              <Input
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tipoPromocion">Tipo de Promoción</Label>
                <select
                  id="tipoPromocion"
                  value={formData.tipoPromocion}
                  onChange={(e) => setFormData({ ...formData, tipoPromocion: e.target.value })}
                  className="w-full border rounded-md p-2"
                  required
                >
                  <option value="Porcentaje">Porcentaje</option>
                  <option value="2x1">2x1</option>
                  <option value="3x2">3x2</option>
                  <option value="Monto Fijo">Monto Fijo</option>
                </select>
              </div>

              <div>
                <Label htmlFor="descuento">Descuento (%)</Label>
                <Input
                  id="descuento"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.descuento}
                  onChange={(e) => setFormData({ ...formData, descuento: parseFloat(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fechaInicio">Fecha de Inicio</Label>
                <Input
                  id="fechaInicio"
                  type="date"
                  value={formData.fechaInicio}
                  onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="fechaFin">Fecha de Fin</Label>
                <Input
                  id="fechaFin"
                  type="date"
                  value={formData.fechaFin}
                  onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="cantidadProducto">Cantidad de Productos</Label>
              <Input
                id="cantidadProducto"
                type="number"
                min="1"
                value={formData.cantidadProducto}
                onChange={(e) => setFormData({ ...formData, cantidadProducto: parseInt(e.target.value) })}
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="estado"
                type="checkbox"
                checked={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="estado" className="cursor-pointer">Promoción Activa</Label>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" className="flex-1">
                {editingPromotion ? 'Actualizar' : 'Crear'} Promoción
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Promociones</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Promoción
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar promociones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">Descripción</TableHead>
              <TableHead className="text-center">Tipo</TableHead>
              <TableHead className="text-center">Descuento</TableHead>
              <TableHead className="text-center">Fecha Inicio</TableHead>
              <TableHead className="text-center">Fecha Fin</TableHead>
              <TableHead className="text-center">Cantidad</TableHead>
              <TableHead className="text-center">Estado</TableHead>
              <TableHead className="text-center">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPromotions.map((promotion) => (
              <TableRow key={promotion.id}>
                <TableCell className="font-medium text-center">{promotion.descripcion}</TableCell>
                <TableCell className="text-center">{promotion.tipoPromocion}</TableCell>
                <TableCell className="text-center font-semibold text-green-600">
                  {promotion.descuento}%
                </TableCell>
                <TableCell className="text-center">
                  {new Date(promotion.fechaInicio).toLocaleDateString('es-PE')}
                </TableCell>
                <TableCell className="text-center">
                  {new Date(promotion.fechaFin).toLocaleDateString('es-PE')}
                </TableCell>
                <TableCell className="text-center">{promotion.cantidadProducto}</TableCell>
                <TableCell className="text-center">
                  <span className={`px-2 py-1 rounded text-xs ${
                    promotion.estado 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {promotion.estado ? 'Activa' : 'Inactiva'}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex gap-2 justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(promotion)}
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" title="Eliminar">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar promoción?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. La promoción será eliminada permanentemente.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(promotion.documentId)}>
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredPromotions.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No se encontraron promociones
        </div>
      )}
    </div>
  );
};
