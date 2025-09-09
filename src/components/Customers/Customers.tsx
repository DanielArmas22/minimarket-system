import React, { useState } from 'react';
import { Plus, User, Edit, Trash2, Mail, Phone, MapPin } from 'lucide-react';
import { Customer } from '../../types';
import { CustomerForm } from './CustomerForm';

interface CustomersProps {
  customers: Customer[];
  onSaveCustomer: (customer: Customer) => void;
  onDeleteCustomer: (customerId: string) => void;
}

export const Customers: React.FC<CustomersProps> = ({ 
  customers, 
  onSaveCustomer, 
  onDeleteCustomer 
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setShowForm(true);
  };

  const handleSave = (customer: Customer) => {
    onSaveCustomer(customer);
    setShowForm(false);
    setEditingCustomer(undefined);
  };

  const handleClose = () => {
    setShowForm(false);
    setEditingCustomer(undefined);
  };

  const handleDelete = (customerId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este cliente?')) {
      onDeleteCustomer(customerId);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Gestión de Clientes</h2>
          <p className="text-gray-600">Administra la base de datos de clientes</p>
        </div>
        
        <button
          onClick={() => setShowForm(true)}
          className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2 justify-center"
        >
          <Plus className="h-5 w-5" />
          Nuevo Cliente
        </button>
      </div>

      <div>
        <input
          type="text"
          placeholder="Buscar clientes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((customer) => (
          <div
            key={customer.id}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="bg-blue-50 p-2 rounded-lg">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleEdit(customer)}
                  className="p-1.5 text-gray-500 hover:text-blue-600 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(customer.id)}
                  className="p-1.5 text-gray-500 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <h4 className="font-semibold text-gray-900 mb-3">{customer.name}</h4>
            
            <div className="space-y-2">
              {customer.email && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{customer.email}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="h-4 w-4" />
                <span>{customer.phone}</span>
              </div>
              
              {customer.address && (
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mt-0.5" />
                  <span className="truncate">{customer.address}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">No se encontraron clientes</p>
        </div>
      )}

      {showForm && (
        <CustomerForm
          customer={editingCustomer}
          onSave={handleSave}
          onClose={handleClose}
        />
      )}
    </div>
  );
};