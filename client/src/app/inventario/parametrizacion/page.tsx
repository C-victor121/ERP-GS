'use client';

import React, { useEffect, useState } from 'react';
import Protected from '../../../components/auth/Protected';
import { getInventorySettings, updateInventorySettings, apiFetch } from '../../../utils/api';

interface AccountsConfig {
  inventoryAccount: string;
  cogsAccount: string;
  purchasesAccount: string;
  adjustmentsAccount: string;
}

interface InventorySettings {
  valuationMethod: 'FIFO' | 'LIFO' | 'PROMEDIO_PONDERADO';
  defaultWarehouse: string;
  defaultLocation: string;
  defaultStockMinimo: number | string;
  skuPrefix: string;
  allowNegativeStock: boolean;
  units: string[];
  accounts: AccountsConfig;
  taxRate: number | string;
  // Nuevos campos
  categories: string[];
  accountsByCategory: Record<string, AccountsConfig>;
}

const DEFAULT_CATEGORIES = ['paneles', 'inversores', 'baterías', 'cables', 'estructuras', 'otros'];

const ParametrizacionInventarioPage: React.FC = () => {
  const [settings, setSettings] = useState<InventorySettings>({
    valuationMethod: 'PROMEDIO_PONDERADO',
    defaultWarehouse: '',
    defaultLocation: '',
    defaultStockMinimo: 1,
    skuPrefix: 'GS-INV',
    allowNegativeStock: false,
    units: ['unidad', 'kit', 'caja'],
    accounts: {
      inventoryAccount: '1435',
      cogsAccount: '6135',
      purchasesAccount: '6130',
      adjustmentsAccount: '6199',
    },
    taxRate: 0,
    categories: DEFAULT_CATEGORIES,
    accountsByCategory: DEFAULT_CATEGORIES.reduce<Record<string, AccountsConfig>>((acc, cat) => {
      acc[cat] = {
        inventoryAccount: '1435',
        cogsAccount: '6135',
        purchasesAccount: '6130',
        adjustmentsAccount: '6199',
      };
      return acc;
    }, {}),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pucClases, setPucClases] = useState<Record<string, string>>({});
  const [pucCuentas, setPucCuentas] = useState<{ codigo: string; nombre: string; clase: string }[]>([]);

  const getCuentaInfo = (codigo?: string) => {
    if (!codigo) return null;
    const found = pucCuentas.find(c => c.codigo === codigo);
    return found ? { nombre: found.nombre, clase: pucClases[found.clase] || found.clase } : null;
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const resp = await getInventorySettings();
        const data = resp?.data || resp;
        const categories: string[] = Array.isArray(data.categories) && data.categories.length > 0 ? data.categories : DEFAULT_CATEGORIES;
        const accountsGlobal: AccountsConfig = data.accounts || {
          inventoryAccount: '1435',
          cogsAccount: '6135',
          purchasesAccount: '6130',
          adjustmentsAccount: '6199',
        };
        const accountsByCategory: Record<string, AccountsConfig> = data.accountsByCategory || {};
        // Asegurar que todas las categorías tengan cuentas
        const ensuredMap = { ...accountsByCategory };
        categories.forEach((cat) => {
          if (!ensuredMap[cat]) {
            ensuredMap[cat] = { ...accountsGlobal };
          }
        });

        setSettings({
          valuationMethod: data.valuationMethod || 'PROMEDIO_PONDERADO',
          defaultWarehouse: data.defaultWarehouse || '',
          defaultLocation: data.defaultLocation || '',
          defaultStockMinimo: data.defaultStockMinimo ?? 1,
          skuPrefix: data.skuPrefix || 'GS-INV',
          allowNegativeStock: !!data.allowNegativeStock,
          units: Array.isArray(data.units) ? data.units : ['unidad', 'kit', 'caja'],
          accounts: accountsGlobal,
          taxRate: data.taxRate ?? 0,
          categories,
          accountsByCategory: ensuredMap,
        });
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Error al cargar configuración');
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    const loadPUC = async () => {
      try {
        const res: any = await apiFetch('/api/finance/puc');
        if (res?.success && res.data) {
          setPucClases(res.data.clases || {});
          setPucCuentas(res.data.cuentas || []);
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadPUC();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target as any;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      accounts: {
        ...prev.accounts,
        [name]: value,
      }
    }));
  };

  const handleCategoryAccountChange = (
    category: string,
    field: keyof AccountsConfig,
    value: string
  ) => {
    setSettings(prev => ({
      ...prev,
      accountsByCategory: {
        ...prev.accountsByCategory,
        [category]: {
          ...prev.accountsByCategory[category],
          [field]: value,
        }
      }
    }));
  };

  const handleUnitsChange = (idx: number, value: string) => {
    setSettings(prev => {
      const units = [...prev.units];
      units[idx] = value;
      return { ...prev, units };
    });
  };

  const addUnit = () => {
    setSettings(prev => ({ ...prev, units: [...prev.units, ''] }));
  };

  const removeUnit = (idx: number) => {
    setSettings(prev => ({ ...prev, units: prev.units.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    // Validación de coherencia PUC antes de enviar
    const getClase = (codigo?: string) => (codigo ? pucCuentas.find(c => c.codigo === codigo)?.clase : undefined);
    const mismatches: string[] = [];
    // Generales
    if (settings.accounts.inventoryAccount && getClase(settings.accounts.inventoryAccount) !== '1') mismatches.push('Inventarios (general) debe ser clase 1 - Activo');
    if (settings.accounts.cogsAccount && getClase(settings.accounts.cogsAccount) !== '5') mismatches.push('Costo de ventas (general) debe ser clase 5 - Gastos');
    if (settings.accounts.purchasesAccount && getClase(settings.accounts.purchasesAccount) !== '5') mismatches.push('Compras (general) debe ser clase 5 - Gastos');
    if (settings.accounts.adjustmentsAccount && getClase(settings.accounts.adjustmentsAccount) !== '5') mismatches.push('Ajustes de inventario (general) debe ser clase 5 - Gastos');
    // Por categoría
    settings.categories.forEach((cat) => {
      const acc = settings.accountsByCategory[cat] || {} as AccountsConfig;
      if (acc.inventoryAccount && getClase(acc.inventoryAccount) !== '1') mismatches.push(`Inventarios (${cat}) debe ser clase 1 - Activo`);
      if (acc.cogsAccount && getClase(acc.cogsAccount) !== '5') mismatches.push(`Costo de ventas (${cat}) debe ser clase 5 - Gastos`);
      if (acc.purchasesAccount && getClase(acc.purchasesAccount) !== '5') mismatches.push(`Compras (${cat}) debe ser clase 5 - Gastos`);
      if (acc.adjustmentsAccount && getClase(acc.adjustmentsAccount) !== '5') mismatches.push(`Ajustes (${cat}) debe ser clase 5 - Gastos`);
    });
    if (mismatches.length > 0) {
      setLoading(false);
      setError(`Hay incoherencias en las cuentas PUC seleccionadas. Revisa: ${mismatches[0]}`);
      return;
    }
    try {
      const payload = {
        valuationMethod: settings.valuationMethod,
        defaultWarehouse: settings.defaultWarehouse.trim() || 'Principal',
        defaultLocation: settings.defaultLocation.trim() || 'General',
        defaultStockMinimo: Number(settings.defaultStockMinimo) || 1,
        skuPrefix: settings.skuPrefix.trim() || 'GS-INV',
        allowNegativeStock: !!settings.allowNegativeStock,
        units: settings.units.map(u => u.trim()).filter(Boolean),
        accounts: {
          inventoryAccount: settings.accounts.inventoryAccount.trim() || '1435',
          cogsAccount: settings.accounts.cogsAccount.trim() || '6135',
          purchasesAccount: settings.accounts.purchasesAccount.trim() || '6130',
          adjustmentsAccount: settings.accounts.adjustmentsAccount.trim() || '6199',
        },
        taxRate: Number(settings.taxRate) || 0,
        categories: settings.categories,
        accountsByCategory: Object.fromEntries(
          settings.categories.map((cat) => [
            cat,
            {
              inventoryAccount: settings.accountsByCategory[cat]?.inventoryAccount?.trim() || settings.accounts.inventoryAccount,
              cogsAccount: settings.accountsByCategory[cat]?.cogsAccount?.trim() || settings.accounts.cogsAccount,
              purchasesAccount: settings.accountsByCategory[cat]?.purchasesAccount?.trim() || settings.accounts.purchasesAccount,
              adjustmentsAccount: settings.accountsByCategory[cat]?.adjustmentsAccount?.trim() || settings.accounts.adjustmentsAccount,
            },
          ])
        ),
      };
      await updateInventorySettings(payload);
      setSuccess('Configuración guardada correctamente');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error al guardar configuración');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Protected>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Parametrización del Inventario</h1>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
            <p>{error}</p>
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4" role="alert">
            <p>{success}</p>
          </div>
        )}
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Método de valoración (NIF)</label>
                <select name="valuationMethod" value={settings.valuationMethod} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option value="FIFO">FIFO</option>
                  <option value="LIFO">LIFO</option>
                  <option value="PROMEDIO_PONDERADO">Promedio ponderado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Almacén por defecto</label>
                <input name="defaultWarehouse" value={settings.defaultWarehouse} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación por defecto</label>
                <input name="defaultLocation" value={settings.defaultLocation} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock mínimo por defecto</label>
                <input type="number" min={0} name="defaultStockMinimo" value={settings.defaultStockMinimo} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prefijo SKU</label>
                <input name="skuPrefix" value={settings.skuPrefix} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
              <div className="flex items-center">
                <input type="checkbox" id="allowNegativeStock" name="allowNegativeStock" checked={settings.allowNegativeStock} onChange={handleChange} className="mr-2" />
                <label htmlFor="allowNegativeStock" className="text-sm font-medium text-gray-700">Permitir stock negativo</label>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Unidades</h2>
              {settings.units.map((unit, idx) => (
                <div key={idx} className="flex items-center mb-2">
                  <input value={unit} onChange={(e) => handleUnitsChange(idx, e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-md" />
                  <button type="button" onClick={() => removeUnit(idx)} className="ml-2 text-red-600">Eliminar</button>
                </div>
              ))}
              <button type="button" onClick={addUnit} className="mt-2 bg-gray-200 hover:bg-gray-300 text-gray-800 py-1 px-3 rounded">Añadir unidad</button>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Cuentas contables (PUC) generales</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Inventarios</label>
                  <select
                    name="inventoryAccount"
                    value={settings.accounts.inventoryAccount}
                    onChange={handleAccountChange}
                    className={`w-full px-3 py-2 border rounded-md ${settings.accounts.inventoryAccount && (pucCuentas.find(c => c.codigo === settings.accounts.inventoryAccount)?.clase !== '1') ? 'border-red-400' : 'border-gray-300'}`}
                  >
                    {pucCuentas.filter(c => c.clase === '1').map(c => (
                      <option key={c.codigo} value={c.codigo}>{c.codigo} - {c.nombre} ({pucClases[c.clase]})</option>
                    ))}
                  </select>
                  {settings.accounts.inventoryAccount && (
                    <p className="mt-1 text-xs text-gray-500">
                      Seleccionado: {settings.accounts.inventoryAccount} - {getCuentaInfo(settings.accounts.inventoryAccount)?.nombre || 'Cuenta personalizada'}{getCuentaInfo(settings.accounts.inventoryAccount)?.clase ? ` (${getCuentaInfo(settings.accounts.inventoryAccount)?.clase})` : ''}
                    </p>
                  )}
                  {settings.accounts.inventoryAccount && (pucCuentas.find(c => c.codigo === settings.accounts.inventoryAccount)?.clase !== '1') && (
                    <p className="mt-1 text-xs text-red-600">Esta cuenta no pertenece a clase 1 (Activo).</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Costo de ventas</label>
                  <select
                    name="cogsAccount"
                    value={settings.accounts.cogsAccount}
                    onChange={handleAccountChange}
                    className={`w-full px-3 py-2 border rounded-md ${settings.accounts.cogsAccount && (pucCuentas.find(c => c.codigo === settings.accounts.cogsAccount)?.clase !== '5') ? 'border-red-400' : 'border-gray-300'}`}
                  >
                    {pucCuentas.filter(c => c.clase === '5').map(c => (
                      <option key={c.codigo} value={c.codigo}>{c.codigo} - {c.nombre} ({pucClases[c.clase]})</option>
                    ))}
                  </select>
                  {settings.accounts.cogsAccount && (
                    <p className="mt-1 text-xs text-gray-500">
                      Seleccionado: {settings.accounts.cogsAccount} - {getCuentaInfo(settings.accounts.cogsAccount)?.nombre || 'Cuenta personalizada'}{getCuentaInfo(settings.accounts.cogsAccount)?.clase ? ` (${getCuentaInfo(settings.accounts.cogsAccount)?.clase})` : ''}
                    </p>
                  )}
                  {settings.accounts.cogsAccount && (pucCuentas.find(c => c.codigo === settings.accounts.cogsAccount)?.clase !== '5') && (
                    <p className="mt-1 text-xs text-red-600">Esta cuenta no pertenece a clase 5 (Gastos).</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Compras</label>
                  <select
                    name="purchasesAccount"
                    value={settings.accounts.purchasesAccount}
                    onChange={handleAccountChange}
                    className={`w-full px-3 py-2 border rounded-md ${settings.accounts.purchasesAccount && (pucCuentas.find(c => c.codigo === settings.accounts.purchasesAccount)?.clase !== '5') ? 'border-red-400' : 'border-gray-300'}`}
                  >
                    {pucCuentas.filter(c => c.clase === '5').map(c => (
                      <option key={c.codigo} value={c.codigo}>{c.codigo} - {c.nombre} ({pucClases[c.clase]})</option>
                    ))}
                  </select>
                  {settings.accounts.purchasesAccount && (
                    <p className="mt-1 text-xs text-gray-500">
                      Seleccionado: {settings.accounts.purchasesAccount} - {getCuentaInfo(settings.accounts.purchasesAccount)?.nombre || 'Cuenta personalizada'}{getCuentaInfo(settings.accounts.purchasesAccount)?.clase ? ` (${getCuentaInfo(settings.accounts.purchasesAccount)?.clase})` : ''}
                    </p>
                  )}
                  {settings.accounts.purchasesAccount && (pucCuentas.find(c => c.codigo === settings.accounts.purchasesAccount)?.clase !== '5') && (
                    <p className="mt-1 text-xs text-red-600">Esta cuenta no pertenece a clase 5 (Gastos).</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ajustes de inventario</label>
                  <select
                    name="adjustmentsAccount"
                    value={settings.accounts.adjustmentsAccount}
                    onChange={handleAccountChange}
                    className={`w-full px-3 py-2 border rounded-md ${settings.accounts.adjustmentsAccount && (pucCuentas.find(c => c.codigo === settings.accounts.adjustmentsAccount)?.clase !== '5') ? 'border-red-400' : 'border-gray-300'}`}
                  >
                    {pucCuentas.filter(c => c.clase === '5').map(c => (
                      <option key={c.codigo} value={c.codigo}>{c.codigo} - {c.nombre} ({pucClases[c.clase]})</option>
                    ))}
                  </select>
                  {settings.accounts.adjustmentsAccount && (
                    <p className="mt-1 text-xs text-gray-500">
                      Seleccionado: {settings.accounts.adjustmentsAccount} - {getCuentaInfo(settings.accounts.adjustmentsAccount)?.nombre || 'Cuenta personalizada'}{getCuentaInfo(settings.accounts.adjustmentsAccount)?.clase ? ` (${getCuentaInfo(settings.accounts.adjustmentsAccount)?.clase})` : ''}
                    </p>
                  )}
                  {settings.accounts.adjustmentsAccount && (pucCuentas.find(c => c.codigo === settings.accounts.adjustmentsAccount)?.clase !== '5') && (
                    <p className="mt-1 text-xs text-red-600">Esta cuenta no pertenece a clase 5 (Gastos).</p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Cuentas PUC por categoría</h2>
              <p className="text-sm text-gray-600 mb-4">Configura las cuentas contables específicas por cada categoría de producto. Si no se especifica, se usarán las cuentas generales.</p>
              <div className="space-y-6">
                {settings.categories.map((cat) => (
                  <div key={cat} className="border rounded-md p-4">
                    <h3 className="text-md font-semibold text-gray-800 mb-3 capitalize">{cat}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Inventarios</label>
                        <select
                          value={settings.accountsByCategory[cat]?.inventoryAccount || ''}
                          onChange={(e) => handleCategoryAccountChange(cat, 'inventoryAccount', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-md ${settings.accountsByCategory[cat]?.inventoryAccount && (pucCuentas.find(c => c.codigo === settings.accountsByCategory[cat]?.inventoryAccount)?.clase !== '1') ? 'border-red-400' : 'border-gray-300'}`}
                        >
                          {pucCuentas.filter(c => c.clase === '1').map(c => (
                            <option key={c.codigo} value={c.codigo}>{c.codigo} - {c.nombre} ({pucClases[c.clase]})</option>
                          ))}
                        </select>
                        {settings.accountsByCategory[cat]?.inventoryAccount && (
                          <p className="mt-1 text-xs text-gray-500">
                            Seleccionado: {settings.accountsByCategory[cat]?.inventoryAccount} - {getCuentaInfo(settings.accountsByCategory[cat]?.inventoryAccount)?.nombre || 'Cuenta personalizada'}{getCuentaInfo(settings.accountsByCategory[cat]?.inventoryAccount)?.clase ? ` (${getCuentaInfo(settings.accountsByCategory[cat]?.inventoryAccount)?.clase})` : ''}
                          </p>
                        )}
                        {settings.accountsByCategory[cat]?.inventoryAccount && (pucCuentas.find(c => c.codigo === settings.accountsByCategory[cat]?.inventoryAccount)?.clase !== '1') && (
                          <p className="mt-1 text-xs text-red-600">Esta cuenta no pertenece a clase 1 (Activo).</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Costo de ventas</label>
                        <select
                          value={settings.accountsByCategory[cat]?.cogsAccount || ''}
                          onChange={(e) => handleCategoryAccountChange(cat, 'cogsAccount', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-md ${settings.accountsByCategory[cat]?.cogsAccount && (pucCuentas.find(c => c.codigo === settings.accountsByCategory[cat]?.cogsAccount)?.clase !== '5') ? 'border-red-400' : 'border-gray-300'}`}
                        >
                          {pucCuentas.filter(c => c.clase === '5').map(c => (
                            <option key={c.codigo} value={c.codigo}>{c.codigo} - {c.nombre} ({pucClases[c.clase]})</option>
                          ))}
                        </select>
                        {settings.accountsByCategory[cat]?.cogsAccount && (
                          <p className="mt-1 text-xs text-gray-500">
                            Seleccionado: {settings.accountsByCategory[cat]?.cogsAccount} - {getCuentaInfo(settings.accountsByCategory[cat]?.cogsAccount)?.nombre || 'Cuenta personalizada'}{getCuentaInfo(settings.accountsByCategory[cat]?.cogsAccount)?.clase ? ` (${getCuentaInfo(settings.accountsByCategory[cat]?.cogsAccount)?.clase})` : ''}
                          </p>
                        )}
                        {settings.accountsByCategory[cat]?.cogsAccount && (pucCuentas.find(c => c.codigo === settings.accountsByCategory[cat]?.cogsAccount)?.clase !== '5') && (
                          <p className="mt-1 text-xs text-red-600">Esta cuenta no pertenece a clase 5 (Gastos).</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Compras</label>
                        <select
                          value={settings.accountsByCategory[cat]?.purchasesAccount || ''}
                          onChange={(e) => handleCategoryAccountChange(cat, 'purchasesAccount', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-md ${settings.accountsByCategory[cat]?.purchasesAccount && (pucCuentas.find(c => c.codigo === settings.accountsByCategory[cat]?.purchasesAccount)?.clase !== '5') ? 'border-red-400' : 'border-gray-300'}`}
                        >
                          {pucCuentas.filter(c => c.clase === '5').map(c => (
                            <option key={c.codigo} value={c.codigo}>{c.codigo} - {c.nombre} ({pucClases[c.clase]})</option>
                          ))}
                        </select>
                        {settings.accountsByCategory[cat]?.purchasesAccount && (
                          <p className="mt-1 text-xs text-gray-500">
                            Seleccionado: {settings.accountsByCategory[cat]?.purchasesAccount} - {getCuentaInfo(settings.accountsByCategory[cat]?.purchasesAccount)?.nombre || 'Cuenta personalizada'}{getCuentaInfo(settings.accountsByCategory[cat]?.purchasesAccount)?.clase ? ` (${getCuentaInfo(settings.accountsByCategory[cat]?.purchasesAccount)?.clase})` : ''}
                          </p>
                        )}
                        {settings.accountsByCategory[cat]?.purchasesAccount && (pucCuentas.find(c => c.codigo === settings.accountsByCategory[cat]?.purchasesAccount)?.clase !== '5') && (
                          <p className="mt-1 text-xs text-red-600">Esta cuenta no pertenece a clase 5 (Gastos).</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ajustes de inventario</label>
                        <select
                          value={settings.accountsByCategory[cat]?.adjustmentsAccount || ''}
                          onChange={(e) => handleCategoryAccountChange(cat, 'adjustmentsAccount', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-md ${settings.accountsByCategory[cat]?.adjustmentsAccount && (pucCuentas.find(c => c.codigo === settings.accountsByCategory[cat]?.adjustmentsAccount)?.clase !== '5') ? 'border-red-400' : 'border-gray-300'}`}
                        >
                          {pucCuentas.filter(c => c.clase === '5').map(c => (
                            <option key={c.codigo} value={c.codigo}>{c.codigo} - {c.nombre} ({pucClases[c.clase]})</option>
                          ))}
                        </select>
                        {settings.accountsByCategory[cat]?.adjustmentsAccount && (
                          <p className="mt-1 text-xs text-gray-500">
                            Seleccionado: {settings.accountsByCategory[cat]?.adjustmentsAccount} - {getCuentaInfo(settings.accountsByCategory[cat]?.adjustmentsAccount)?.nombre || 'Cuenta personalizada'}{getCuentaInfo(settings.accountsByCategory[cat]?.adjustmentsAccount)?.clase ? ` (${getCuentaInfo(settings.accountsByCategory[cat]?.adjustmentsAccount)?.clase})` : ''}
                          </p>
                        )}
                        {settings.accountsByCategory[cat]?.adjustmentsAccount && (pucCuentas.find(c => c.codigo === settings.accountsByCategory[cat]?.adjustmentsAccount)?.clase !== '5') && (
                          <p className="mt-1 text-xs text-red-600">Esta cuenta no pertenece a clase 5 (Gastos).</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Impuesto (IVA %)</label>
              <input type="number" min={0} step={0.01} name="taxRate" value={settings.taxRate} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>

            <div className="mt-6 flex justify-end">
              <button type="submit" disabled={loading} className={`bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>{loading ? 'Guardando...' : 'Guardar configuración'}</button>
            </div>
          </form>
        </div>
      </div>
    </Protected>
  );
};

export default ParametrizacionInventarioPage;