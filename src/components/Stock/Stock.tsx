import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Product, Category } from '@/types';

type StockStateFilter = 'all' | 'normal' | 'low' | 'zero';

interface MovementItem {
  type: 'entrada' | 'salida' | 'ajuste';
  quantity: number;
  date: string;
  user?: string;
  note?: string;
}

export const Stock: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState<StockStateFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [selected, setSelected] = useState<Product | null>(null);
  const [movements, setMovements] = useState<MovementItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [updating, setUpdating] = useState<boolean>(false);

  const API = (import.meta as any).env.VITE_URL_API || 'http://localhost:1337';

  const fetchProducts = async () => {
    setUpdating(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        axios.get(`${API}/api/products?populate=category`),
        axios.get(`${API}/api/categories`),
      ]);

      const data = Array.isArray(prodRes.data?.data) ? prodRes.data.data : [];
      const cats = Array.isArray(catRes.data?.data) ? catRes.data.data : [];
      setProducts(data as Product[]);
      setCategories(cats as Category[]);
      if (!selected && data.length > 0) {
        setSelected(data[0]);
      }
    } catch (e) {
      setProducts([]);
      setCategories([]);
    } finally {
      setUpdating(false);
    }
  };

  const fetchMovements = async (productId: number) => {
    setLoading(true);
    try {
      const [salesRes, buysRes, adjRes] = await Promise.all([
        axios.get(`${API}/api/detail-sales?filters[product][id][$eq]=${productId}&populate=sale&sort=createdAt:desc&pagination[pageSize]=5`),
        axios.get(`${API}/api/detail-order-buys?filters[product][id][$eq]=${productId}&populate=order_buy&sort=createdAt:desc&pagination[pageSize]=5`),
        axios.get(`${API}/api/inventory-adjustments?filters[product][id][$eq]=${productId}&sort=adjustmentDate:desc&pagination[pageSize]=5`),
      ]);

      const sales = (salesRes.data?.data || []).map((ds: any) => ({
        type: 'salida' as const,
        quantity: Number(ds.attributes?.cantidad || ds.cantidad || 0),
        date: ds.attributes?.createdAt || ds.createdAt,
        user: undefined,
      }));

      const buys = (buysRes.data?.data || []).map((db: any) => ({
        type: 'entrada' as const,
        quantity: Number(db.attributes?.cantidad || db.cantidad || 0),
        date: db.attributes?.createdAt || db.createdAt,
        user: undefined,
      }));

      const adjs = (adjRes.data?.data || []).map((adj: any) => ({
        type: 'ajuste' as const,
        quantity: Number(adj.attributes?.quantity || adj.quantity || 0) * (adj.attributes?.adjustmentType === 'decrease' ? -1 : 1),
        date: adj.attributes?.adjustmentDate || adj.adjustmentDate,
        user: adj.attributes?.users_permissions_user?.data?.attributes?.username,
        note: adj.attributes?.reason,
      }));

      const merged = [...sales, ...buys, ...adjs]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);
      setMovements(merged);
    } catch (e) {
      setMovements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (selected) fetchMovements(selected.id);
  }, [selected?.id]);

  useEffect(() => {
    const intId = window.setInterval(() => {
      fetchProducts();
    }, 30000);
    return () => window.clearInterval(intId);
  }, []);

  const parseStock = (p: Product) => Number.parseInt(String(p.stock || 0));
  const getState = (p: Product): 'normal' | 'low' | 'zero' => {
    const s = parseStock(p);
    if (s === 0) return 'zero';
    if (s < (p.stockMin || 0)) return 'low';
    return 'normal';
  };

  const lowCount = useMemo(() => products.filter(p => getState(p) === 'low').length, [products]);
  const zeroCount = useMemo(() => products.filter(p => getState(p) === 'zero').length, [products]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products.filter(p => {
      const price = Number(p.precioUnitario || 0);
      const inText = !term ||
        p.descripcion?.toLowerCase().includes(term) ||
        p.barCode?.toLowerCase().includes(term) ||
        p.category?.descripcion?.toLowerCase().includes(term);

      const inStockState = stockFilter === 'all' || getState(p) === stockFilter;
      const inCat = categoryFilter === 'all' || String(p.category?.id) === categoryFilter;
      const inMin = !minPrice || price >= Number(minPrice);
      const inMax = !maxPrice || price <= Number(maxPrice);
      return inText && inStockState && inCat && inMin && inMax;
    });
  }, [products, search, stockFilter, categoryFilter, minPrice, maxPrice]);

  const totalInventoryValue = useMemo(() => filtered.reduce((sum, p) => sum + parseStock(p) * Number(p.precioUnitario || 0), 0), [filtered]);

  const handleClearFilters = () => {
    setSearch('');
    setStockFilter('all');
    setCategoryFilter('all');
    setMinPrice('');
    setMaxPrice('');
  };

  const exportCSV = () => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const name = `stock_${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}.csv`;
    const headerInfo = [
      ['Fecha', now.toLocaleString()],
      ['Usuario', (localStorage.getItem('username') || 'N/A')],
      ['Total productos visibles', String(filtered.length)],
      ['Valor total inventario', totalInventoryValue.toFixed(2)],
      ['Productos con stock bajo', String(lowCount)],
      [],
    ] as any;

    const header = ['Código barras', 'Producto', 'Categoría', 'Stock', 'Precio', 'Estado'];
    const rows = filtered.map(p => [
      p.barCode,
      p.descripcion,
      p.category?.descripcion || '',
      String(parseStock(p)),
      Number(p.precioUnitario || 0).toFixed(2),
      getState(p) === 'normal' ? 'Stock normal' : getState(p) === 'low' ? 'Stock bajo' : 'Sin stock',
    ]);

    const all = [...headerInfo, header, ...rows];
    const csv = all.map((r: any[]) => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = name;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const exportPDF = () => {
    const nowLabel = new Date().toLocaleString();
    const w = window.open('', '_blank');
    if (!w) return;
    const rows = filtered.map(p => `
      <tr>
        <td style="padding:6px;border-bottom:1px solid #eee;">${p.barCode}</td>
        <td style="padding:6px;border-bottom:1px solid #eee;">${p.descripcion}</td>
        <td style="padding:6px;border-bottom:1px solid #eee;">${p.category?.descripcion || ''}</td>
        <td style="padding:6px;border-bottom:1px solid #eee; text-align:right;">${parseStock(p)}</td>
        <td style="padding:6px;border-bottom:1px solid #eee; text-align:right;">${Number(p.precioUnitario || 0).toFixed(2)}</td>
        <td style="padding:6px;border-bottom:1px solid #eee;">${getState(p) === 'normal' ? 'Stock normal' : getState(p) === 'low' ? 'Stock bajo' : 'Sin stock'}</td>
      </tr>`).join('');
    w.document.write(`
      <html>
        <head>
          <title>Reporte de Stock</title>
          <meta charset="utf-8" />
          <style>
            body{ font-family: Arial, sans-serif; padding: 20px; }
            h1{ margin: 0 0 4px 0; font-size: 18px; }
            .muted{ color:#666; font-size:12px; }
            table{ width:100%; border-collapse: collapse; margin-top:12px; }
            th{ text-align:left; background:#f6f7f9; padding:8px; border-bottom:1px solid #ddd; }
            td{ font-size:12px; }
          </style>
        </head>
        <body>
          <h1>Reporte de Stock</h1>
          <div class="muted">Generado: ${nowLabel}</div>
          <div class="muted">Total productos: ${filtered.length} | Valor total: S/ ${totalInventoryValue.toFixed(2)}</div>
          <table>
            <thead>
              <tr>
                <th>Código barras</th>
                <th>Producto</th>
                <th>Categoría</th>
                <th style="text-align:right;">Stock</th>
                <th style="text-align:right;">Precio</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          <script>window.onload = () => window.print();<\/script>
        </body>
      </html>
    `);
    w.document.close();
  };

  return (
    <div className="p-6 w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Consultar Stock</h2>
        <div className="flex items-center gap-2">
          <Badge onClick={() => setStockFilter('zero')} className="cursor-pointer" variant="destructive">{zeroCount} sin stock</Badge>
          <Badge onClick={() => setStockFilter('low')} className="cursor-pointer" variant="secondary">{lowCount} stock bajo</Badge>
          {updating && (
            <div className="text-sm text-blue-600 px-2 py-1 border border-blue-200 rounded">🔄 Actualizando stock...</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border p-4 mb-4">
            <div className="flex gap-2 mb-3">
              <Input placeholder="Buscar por nombre, código o categoría..." value={search} onChange={(e) => setSearch(e.target.value)} />
              <Button variant="secondary" onClick={() => fetchProducts()}>Buscar</Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-end">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-500">Estado de Stock</span>
                <Select value={stockFilter} onValueChange={(v) => setStockFilter(v as StockStateFilter)}>
                  <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="normal">Stock normal</SelectItem>
                    <SelectItem value="low">Stock bajo</SelectItem>
                    <SelectItem value="zero">Sin stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-500">Categoría</span>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger><SelectValue placeholder="Todas" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {categories.map(c => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.descripcion}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-500">Precio mínimo</span>
                <Input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="0.00" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-500">Precio máximo</span>
                <Input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="999.99" />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleClearFilters} className="w-full">Limpiar</Button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="text-sm text-gray-600">Vista de inventario ({filtered.length} productos)</div>
              <div className="flex gap-2">
                <Button variant="destructive" onClick={exportPDF}>📄 PDF</Button>
                <Button variant="default" onClick={exportCSV}>📊 CSV</Button>
              </div>
            </div>
            <div className="max-h-[520px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[140px]">Código</TableHead>
                    <TableHead>Producto</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead className="text-right">Precio</TableHead>
                    <TableHead className="w-[120px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((p) => {
                    const state = getState(p);
                    return (
                      <TableRow key={p.id} className="hover:bg-gray-50">
                        <TableCell className="font-mono text-xs">{p.barCode}</TableCell>
                        <TableCell className="font-medium">{p.descripcion}</TableCell>
                        <TableCell>{p.category?.descripcion}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className={`inline-block h-2 w-2 rounded-full ${state === 'normal' ? 'bg-emerald-500' : state === 'low' ? 'bg-amber-500' : 'bg-red-500'}`}></span>
                            <span className="font-semibold">{parseStock(p)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">S/ {Number(p.precioUnitario || 0).toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" onClick={() => setSelected(p)}>Ver detalles</Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border p-4">
            <div className="text-base font-semibold mb-3">Detalles del producto</div>
            {!selected ? (
              <div className="text-sm text-gray-500">Seleccione un producto para ver sus detalles.</div>
            ) : (
              <div className="space-y-4">
                <div className="aspect-video w-full bg-gray-100 rounded flex items-center justify-center text-gray-400 text-sm">Imagen no disponible</div>

                <div>
                  <div className="text-sm text-gray-500">Nombre</div>
                  <div className="font-semibold">{selected.descripcion}</div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-gray-500">Código de barras</div>
                    <div className="font-medium">{selected.barCode}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Categoría</div>
                    <div className="font-medium">{selected.category?.descripcion}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Stock actual</div>
                    <div className="font-bold text-emerald-600 text-lg">{parseStock(selected)}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Stock mínimo</div>
                    <div className="font-medium">{selected.stockMin || 0}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Precio compra</div>
                    <div className="font-medium">S/ -</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Precio venta</div>
                    <div className="font-medium">S/ {Number(selected.precioUnitario || 0).toFixed(2)}</div>
                  </div>
                </div>

                <div className="border rounded p-3">
                  <div className="text-sm font-semibold mb-2">Movimientos recientes</div>
                  {loading ? (
                    <div className="text-sm text-gray-500">Cargando movimientos...</div>
                  ) : movements.length === 0 ? (
                    <div className="text-sm text-gray-500">Sin movimientos recientes</div>
                  ) : (
                    <div className="space-y-2">
                      {movements.map((m, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm border-b last:border-0 py-1">
                          <div>
                            <span className={`font-semibold ${m.type === 'entrada' ? 'text-emerald-600' : m.type === 'salida' ? 'text-red-600' : 'text-blue-600'}`}>
                              {m.type === 'entrada' ? '➕ Entrada' : m.type === 'salida' ? '➖ Salida' : '🔄 Ajuste'}
                            </span>
                            <span className="ml-2 font-bold">{m.quantity > 0 ? `+${m.quantity}` : m.quantity}</span>
                          </div>
                          <div className="text-xs text-gray-500 text-right">
                            {new Date(m.date).toLocaleString()}
                            {m.user ? <div>Usuario: {m.user}</div> : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stock;


