import React, { useState } from 'react';
import {
  Database,
  Plus,
  Play,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  Layers,
  Code2,
  Table,
  Sliders,
  Clock,
  Shield,
  ExternalLink,
  ChevronRight,
  Download,
  Trash2,
  Sparkles,
  Zap,
  Server,
  Key,
  X,
} from 'lucide-react';
import {
  DatabaseConnection,
  DatabaseEngineType,
  VisualQueryDefinition,
  SqlQueryExecutionResult,
  RoleDefinition,
} from '../../types';
import { initialDatabases, sampleVisualQueries, sampleQueryExecutionData } from '../../data/databaseData';

interface DatabaseHubViewProps {
  currentRole: RoleDefinition;
  onNavigateTab: (tab: any) => void;
  onBindQueryToDashboard?: (queryName: string, sqlOrDefinition: string) => void;
}

export const DatabaseHubView: React.FC<DatabaseHubViewProps> = ({
  currentRole,
  onNavigateTab,
  onBindQueryToDashboard,
}) => {
  const [databases, setDatabases] = useState<DatabaseConnection[]>(initialDatabases);
  const [selectedDbId, setSelectedDbId] = useState<string>(databases[0]?.id || '');
  const [selectedTable, setSelectedTable] = useState<string>(
    databases[0]?.tables[0]?.name || ''
  );
  const [activeTab, setActiveTab] = useState<'connections' | 'visual_builder' | 'sql_console'>('connections');
  const [searchQuery, setSearchQuery] = useState('');
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [testingDbId, setTestingDbId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New DB form state
  const [newDb, setNewDb] = useState<{
    name: string;
    engine: DatabaseEngineType;
    host: string;
    port: number;
    databaseName: string;
    username: string;
    password: string;
    ssl: boolean;
  }>({
    name: '',
    engine: 'postgresql',
    host: '',
    port: 5432,
    databaseName: '',
    username: '',
    password: '',
    ssl: true,
  });

  // Visual Query State
  const [visualQuery, setVisualQuery] = useState<VisualQueryDefinition>(sampleVisualQueries[0]);
  const [visualResult, setVisualResult] = useState<SqlQueryExecutionResult | null>(sampleQueryExecutionData.default);
  const [isExecutingVisual, setIsExecutingVisual] = useState(false);

  // Raw SQL Console State
  const [rawSql, setRawSql] = useState(
    `SELECT \n  order_number,\n  product_sku,\n  quantity_target,\n  quantity_completed,\n  scrap_count,\n  unit_cost_actual,\n  status\nFROM production_work_orders\nWHERE scrap_count > 5\nORDER BY scrap_count DESC\nLIMIT 10;`
  );
  const [sqlResult, setSqlResult] = useState<SqlQueryExecutionResult | null>(sampleQueryExecutionData.default);
  const [isExecutingSql, setIsExecutingSql] = useState(false);

  const canWrite =
    currentRole.permissions.integrations === 'admin' ||
    currentRole.permissions.integrations === 'write';

  const selectedDb = databases.find((d) => d.id === selectedDbId) || databases[0];

  const handleTestConnection = (id: string) => {
    setTestingDbId(id);
    setTimeout(() => {
      setDatabases((prev) =>
        prev.map((db) =>
          db.id === id
            ? { ...db, status: 'connected', latencyMs: Math.floor(Math.random() * 20) + 12, lastTested: 'Just now' }
            : db
        )
      );
      setTestingDbId(null);
      setToastMessage('Database connection test successful. Latency: 18ms.');
      setTimeout(() => setToastMessage(null), 3500);
    }, 900);
  };

  const handleConnectDbSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDb.name || !newDb.host || !newDb.databaseName) return;

    const created: DatabaseConnection = {
      id: `db-${Date.now().toString(36)}`,
      name: newDb.name,
      engine: newDb.engine,
      host: newDb.host,
      port: Number(newDb.port),
      databaseName: newDb.databaseName,
      username: newDb.username || 'client_user',
      ssl: newDb.ssl,
      status: 'connected',
      latencyMs: 24,
      lastTested: 'Just now',
      tablesCount: 3,
      description: `Client-connected ${newDb.engine.toUpperCase()} database.`,
      tables: [
        {
          name: 'client_telemetry_logs',
          rowCount: 3200,
          sizeMb: 8.5,
          columns: [
            { name: 'id', type: 'UUID', nullable: false, isPrimaryKey: true },
            { name: 'device_serial', type: 'VARCHAR(50)', nullable: false },
            { name: 'reading_value', type: 'NUMERIC(10,2)', nullable: false },
            { name: 'logged_at', type: 'TIMESTAMP', nullable: false },
          ],
        },
      ],
    };

    setDatabases((prev) => [...prev, created]);
    setSelectedDbId(created.id);
    setIsConnectModalOpen(false);
    setToastMessage(`Connected database "${created.name}" successfully!`);
    setTimeout(() => setToastMessage(null), 3500);

    // Reset
    setNewDb({
      name: '',
      engine: 'postgresql',
      host: '',
      port: 5432,
      databaseName: '',
      username: '',
      password: '',
      ssl: true,
    });
  };

  const handleExecuteVisualQuery = () => {
    setIsExecutingVisual(true);
    setTimeout(() => {
      setVisualResult({
        columns: visualQuery.selectedColumns.length > 0 ? visualQuery.selectedColumns : ['id', 'name', 'value'],
        rows: sampleQueryExecutionData.default.rows,
        executionTimeMs: Math.floor(Math.random() * 18) + 14,
        rowCount: sampleQueryExecutionData.default.rows.length,
        executedAt: new Date().toLocaleTimeString(),
      });
      setIsExecutingVisual(false);
      setToastMessage('Visual query executed successfully.');
      setTimeout(() => setToastMessage(null), 3000);
    }, 600);
  };

  const handleExecuteSql = () => {
    setIsExecutingSql(true);
    setTimeout(() => {
      setSqlResult({
        columns: ['order_number', 'product_sku', 'quantity_target', 'quantity_completed', 'scrap_count', 'unit_cost_actual', 'status'],
        rows: sampleQueryExecutionData.default.rows,
        executionTimeMs: Math.floor(Math.random() * 25) + 12,
        rowCount: sampleQueryExecutionData.default.rows.length,
        executedAt: new Date().toLocaleTimeString(),
      });
      setIsExecutingSql(false);
      setToastMessage('SQL query executed successfully.');
      setTimeout(() => setToastMessage(null), 3000);
    }, 700);
  };

  const handleBindToDashboard = () => {
    if (onBindQueryToDashboard) {
      onBindQueryToDashboard(
        visualQuery.name || 'Custom Database Query',
        activeTab === 'sql_console' ? rawSql : JSON.stringify(visualQuery)
      );
    }
    setToastMessage('Query dataset bound as active data source for Dashboard Widgets!');
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#2D2D24] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-[#5A5A40]/50 text-xs font-mono animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#5A5A40]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#E5E5DE] p-6 rounded-3xl shadow-sm text-[#2D2D24]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-serif italic font-medium tracking-tight text-[#2D2D24] flex items-center gap-2.5">
              <Database className="w-6 h-6 text-[#5A5A40]" />
              Client Custom Database &amp; Cloud DB Gateway
            </h1>
            <span className="text-xs bg-[#F5F5F0] text-[#5A5A40] border border-[#E5E5DE] px-3 py-0.5 rounded-full font-semibold">
              PostgreSQL • MySQL • Snowflake • MongoDB • Aurora • Supabase
            </span>
          </div>
          <p className="text-xs text-[#8B7E66] mt-1 max-w-2xl">
            Hook up client-owned relational databases or cloud data warehouses to empower custom drag-and-drop dashboard widgets, run visual query pipelines, or execute raw SQL with sub-second performance.
          </p>
        </div>

        <button
          onClick={() => setIsConnectModalOpen(true)}
          disabled={!canWrite}
          className="bg-[#5A5A40] hover:bg-[#474732] disabled:opacity-40 text-white px-5 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Connect New Database</span>
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E5E5DE] pb-2">
        <button
          onClick={() => setActiveTab('connections')}
          className={`text-xs px-4 py-2 rounded-2xl font-semibold transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'connections'
              ? 'bg-[#5A5A40] text-white shadow-xs'
              : 'text-[#787668] hover:text-[#2D2D24] hover:bg-[#F5F5F0]'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>Connected Databases ({databases.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('visual_builder')}
          className={`text-xs px-4 py-2 rounded-2xl font-semibold transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'visual_builder'
              ? 'bg-[#5A5A40] text-white shadow-xs'
              : 'text-[#787668] hover:text-[#2D2D24] hover:bg-[#F5F5F0]'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Visual Query Builder</span>
        </button>

        <button
          onClick={() => setActiveTab('sql_console')}
          className={`text-xs px-4 py-2 rounded-2xl font-semibold transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'sql_console'
              ? 'bg-[#5A5A40] text-white shadow-xs'
              : 'text-[#787668] hover:text-[#2D2D24] hover:bg-[#F5F5F0]'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Raw SQL &amp; Formula Engine</span>
        </button>
      </div>

      {/* TAB 1: CONNECTED DATABASES & SCHEMA EXPLORER */}
      {activeTab === 'connections' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Databases List */}
          <div className="lg:col-span-1 space-y-3">
            <h3 className="text-xs uppercase font-bold text-[#8B7E66] px-1">Configured DB Engines</h3>
            <div className="space-y-3">
              {databases.map((db) => {
                const isSelected = selectedDbId === db.id;
                const isTesting = testingDbId === db.id;

                return (
                  <div
                    key={db.id}
                    onClick={() => {
                      setSelectedDbId(db.id);
                      if (db.tables[0]) setSelectedTable(db.tables[0].name);
                    }}
                    className={`bg-white border rounded-3xl p-5 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#5A5A40] ring-2 ring-[#5A5A40]/20 shadow-md'
                        : 'border-[#E5E5DE] hover:border-[#8B7E66]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-2xl bg-[#F5F5F0] border border-[#E5E5DE] flex items-center justify-center text-[#5A5A40] shrink-0 font-bold text-xs">
                          {db.engine.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-[#2D2D24] leading-snug">{db.name}</h4>
                          <span className="text-[10px] text-[#8B7E66] font-mono uppercase">{db.engine}</span>
                        </div>
                      </div>

                      <span
                        className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full font-bold ${
                          db.status === 'connected'
                            ? 'bg-[#2E6930]/15 text-[#2E6930]'
                            : 'bg-[#B85D36]/15 text-[#B85D36]'
                        }`}
                      >
                        {db.status}
                      </span>
                    </div>

                    <p className="text-xs text-[#787668] mt-2.5 line-clamp-2">{db.description}</p>

                    <div className="mt-3 pt-3 border-t border-[#E5E5DE] flex items-center justify-between text-[11px] text-[#8B7E66]">
                      <span>Latency: {db.latencyMs}ms</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTestConnection(db.id);
                        }}
                        disabled={isTesting}
                        className="text-[#5A5A40] hover:text-[#474732] font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className={`w-3 h-3 ${isTesting ? 'animate-spin' : ''}`} />
                        <span>{isTesting ? 'Testing...' : 'Ping DB'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Schema & Table Explorer for Selected DB */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-[#E5E5DE] rounded-3xl p-6 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E5DE] pb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#8B7E66]">Active Schema Inspector</span>
                  <h3 className="text-base font-serif italic font-semibold text-[#2D2D24] mt-0.5">
                    {selectedDb.name} ({selectedDb.databaseName})
                  </h3>
                  <span className="text-xs text-[#787668] font-mono mt-0.5 block">
                    Host: {selectedDb.host}:{selectedDb.port} • User: {selectedDb.username} • SSL: {selectedDb.ssl ? 'Enabled' : 'Disabled'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('visual_builder')}
                    className="text-xs bg-[#F5F5F0] hover:bg-[#E9E9E0] text-[#5A5A40] font-semibold px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 border border-[#E5E5DE] cursor-pointer"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Build Query</span>
                  </button>
                </div>
              </div>

              {/* Table Selector Pills */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-[#2D2D24] block">Available Relational Tables / Collections:</span>
                <div className="flex flex-wrap gap-2">
                  {selectedDb.tables.map((tbl) => (
                    <button
                      key={tbl.name}
                      onClick={() => setSelectedTable(tbl.name)}
                      className={`text-xs px-3.5 py-1.5 rounded-xl border transition-all flex items-center gap-2 cursor-pointer ${
                        selectedTable === tbl.name
                          ? 'bg-[#5A5A40] text-white border-[#5A5A40] shadow-xs'
                          : 'bg-[#F5F5F0] text-[#2D2D24] border-[#E5E5DE] hover:border-[#8B7E66]'
                      }`}
                    >
                      <Table className="w-3.5 h-3.5" />
                      <span className="font-mono">{tbl.name}</span>
                      <span className="text-[10px] opacity-80 font-mono">({tbl.rowCount} rows)</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Table Columns Schema Table */}
              {selectedDb.tables.find((t) => t.name === selectedTable) && (
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-[#2D2D24]">
                      Columns in table:{' '}
                      <span className="font-mono text-[#5A5A40]">{selectedTable}</span>
                    </span>
                    <span className="text-[#8B7E66]">
                      Est. Size:{' '}
                      {selectedDb.tables.find((t) => t.name === selectedTable)?.sizeMb} MB
                    </span>
                  </div>

                  <div className="overflow-x-auto border border-[#E5E5DE] rounded-2xl">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-[#F5F5F0] text-[10px] uppercase font-bold text-[#8B7E66] border-b border-[#E5E5DE]">
                        <tr>
                          <th className="p-3">Column Name</th>
                          <th className="p-3">Data Type</th>
                          <th className="p-3">Nullable</th>
                          <th className="p-3">Key Attribute</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E5DE]">
                        {selectedDb.tables
                          .find((t) => t.name === selectedTable)
                          ?.columns.map((col) => (
                            <tr key={col.name} className="hover:bg-[#F9F9F7]">
                              <td className="p-3 font-mono font-bold text-[#2D2D24] flex items-center gap-2">
                                <Code2 className="w-3.5 h-3.5 text-[#8B7E66]" />
                                <span>{col.name}</span>
                              </td>
                              <td className="p-3 font-mono text-[#5A5A40]">{col.type}</td>
                              <td className="p-3 text-[#787668]">
                                {col.nullable ? 'YES' : 'NO (Required)'}
                              </td>
                              <td className="p-3">
                                {col.isPrimaryKey ? (
                                  <span className="text-[10px] bg-[#5A5A40]/15 text-[#5A5A40] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1 w-max">
                                    <Key className="w-3 h-3" />
                                    PRIMARY KEY
                                  </span>
                                ) : (
                                  <span className="text-[#8B7E66] text-xs">—</span>
                                )}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VISUAL QUERY BUILDER */}
      {activeTab === 'visual_builder' && (
        <div className="space-y-5">
          <div className="bg-white border border-[#E5E5DE] rounded-3xl p-6 shadow-sm space-y-5 text-[#2D2D24]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E5DE] pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#8B7E66]">No-Code Visual Pipeline</span>
                <h3 className="text-base font-serif italic font-semibold text-[#2D2D24] mt-0.5">
                  Visual Enterprise Data Query Builder
                </h3>
                <p className="text-xs text-[#787668] mt-0.5">
                  Select target database, table, columns, and conditional filters to pull datasets directly into custom dashboard widgets.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExecuteVisualQuery}
                  disabled={isExecutingVisual}
                  className="bg-[#5A5A40] hover:bg-[#474732] text-white px-5 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
                >
                  <Play className={`w-3.5 h-3.5 ${isExecutingVisual ? 'animate-spin' : ''}`} />
                  <span>{isExecutingVisual ? 'Executing Query...' : 'Run Visual Query'}</span>
                </button>

                <button
                  onClick={handleBindToDashboard}
                  className="bg-white hover:bg-[#F5F5F0] text-[#5A5A40] border border-[#E5E5DE] px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Bind to Dashboard Widget</span>
                </button>
              </div>
            </div>

            {/* Selection Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-[#2D2D24]">Target Database Connection</label>
                <select
                  value={visualQuery.databaseId}
                  onChange={(e) => setVisualQuery({ ...visualQuery, databaseId: e.target.value })}
                  className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl p-2.5 text-xs text-[#2D2D24] outline-none focus:border-[#5A5A40]"
                >
                  {databases.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.engine})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-[#2D2D24]">Target Table</label>
                <select
                  value={visualQuery.tableName}
                  onChange={(e) => setVisualQuery({ ...visualQuery, tableName: e.target.value })}
                  className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl p-2.5 text-xs text-[#2D2D24] outline-none focus:border-[#5A5A40]"
                >
                  {selectedDb.tables.map((t) => (
                    <option key={t.name} value={t.name}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-[#2D2D24]">Row Limit</label>
                <input
                  type="number"
                  value={visualQuery.limit}
                  onChange={(e) => setVisualQuery({ ...visualQuery, limit: Number(e.target.value) })}
                  className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl p-2.5 font-mono text-xs text-[#2D2D24] outline-none focus:border-[#5A5A40]"
                />
              </div>
            </div>

            {/* Columns Multi-Select */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-[#2D2D24] block">Select Projected Columns:</span>
              <div className="flex flex-wrap gap-2">
                {selectedDb.tables
                  .find((t) => t.name === visualQuery.tableName)
                  ?.columns.map((col) => {
                    const isSelected = visualQuery.selectedColumns.includes(col.name);
                    return (
                      <button
                        key={col.name}
                        onClick={() => {
                          const updated = isSelected
                            ? visualQuery.selectedColumns.filter((c) => c !== col.name)
                            : [...visualQuery.selectedColumns, col.name];
                          setVisualQuery({ ...visualQuery, selectedColumns: updated });
                        }}
                        className={`text-xs px-3 py-1 rounded-xl border transition-all cursor-pointer font-mono ${
                          isSelected
                            ? 'bg-[#5A5A40] text-white border-[#5A5A40]'
                            : 'bg-[#F5F5F0] text-[#787668] border-[#E5E5DE] hover:border-[#8B7E66]'
                        }`}
                      >
                        {col.name}
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Visual Filters List */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-[#2D2D24]">Conditional WHERE Filters:</span>
                <button
                  onClick={() =>
                    setVisualQuery({
                      ...visualQuery,
                      filters: [
                        ...visualQuery.filters,
                        { id: `f-${Date.now()}`, column: 'scrap_count', operator: '>', value: '0' },
                      ],
                    })
                  }
                  className="text-[#5A5A40] hover:text-[#474732] font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Filter Rule</span>
                </button>
              </div>

              <div className="space-y-2">
                {visualQuery.filters.map((flt, idx) => (
                  <div
                    key={flt.id}
                    className="flex items-center gap-2 bg-[#F9F9F7] p-2 rounded-xl border border-[#E5E5DE] text-xs"
                  >
                    <span className="font-mono text-[#8B7E66] w-6">{idx + 1}.</span>
                    <input
                      type="text"
                      value={flt.column}
                      onChange={(e) => {
                        const updated = [...visualQuery.filters];
                        updated[idx].column = e.target.value;
                        setVisualQuery({ ...visualQuery, filters: updated });
                      }}
                      placeholder="Column"
                      className="bg-white border border-[#E5E5DE] rounded-lg p-1.5 font-mono text-xs text-[#2D2D24] flex-1"
                    />
                    <select
                      value={flt.operator}
                      onChange={(e: any) => {
                        const updated = [...visualQuery.filters];
                        updated[idx].operator = e.target.value;
                        setVisualQuery({ ...visualQuery, filters: updated });
                      }}
                      className="bg-white border border-[#E5E5DE] rounded-lg p-1.5 font-mono text-xs text-[#2D2D24]"
                    >
                      <option value="=">=</option>
                      <option value="!=">!=</option>
                      <option value=">">&gt;</option>
                      <option value="<">&lt;</option>
                      <option value="LIKE">LIKE</option>
                      <option value="IN">IN</option>
                    </select>
                    <input
                      type="text"
                      value={flt.value}
                      onChange={(e) => {
                        const updated = [...visualQuery.filters];
                        updated[idx].value = e.target.value;
                        setVisualQuery({ ...visualQuery, filters: updated });
                      }}
                      placeholder="Value"
                      className="bg-white border border-[#E5E5DE] rounded-lg p-1.5 font-mono text-xs text-[#2D2D24] flex-1"
                    />
                    <button
                      onClick={() => {
                        setVisualQuery({
                          ...visualQuery,
                          filters: visualQuery.filters.filter((f) => f.id !== flt.id),
                        });
                      }}
                      className="text-[#B85D36] hover:bg-[#B85D36]/10 p-1 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Execution Results Table */}
          {visualResult && (
            <div className="bg-white border border-[#E5E5DE] rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-[#2D2D24] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2E6930]" />
                  <span>Query Results ({visualResult.rowCount} rows returned)</span>
                </span>
                <span className="font-mono text-[#8B7E66]">
                  Execution time: {visualResult.executionTimeMs}ms • Executed: {visualResult.executedAt}
                </span>
              </div>

              <div className="overflow-x-auto border border-[#E5E5DE] rounded-2xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#F5F5F0] text-[10px] uppercase font-bold text-[#8B7E66] border-b border-[#E5E5DE]">
                    <tr>
                      {visualResult.columns.map((col) => (
                        <th key={col} className="p-3">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5DE]">
                    {visualResult.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-[#F9F9F7]">
                        {visualResult.columns.map((col) => (
                          <td key={col} className="p-3 font-mono text-[#2D2D24]">
                            {String(row[col] ?? '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: RAW SQL & FORMULA ENGINE */}
      {activeTab === 'sql_console' && (
        <div className="space-y-5">
          <div className="bg-white border border-[#E5E5DE] rounded-3xl p-6 shadow-sm space-y-4 text-[#2D2D24]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E5DE] pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#8B7E66]">Direct SQL Gateway</span>
                <h3 className="text-base font-serif italic font-semibold text-[#2D2D24] mt-0.5">
                  ANSI SQL &amp; Analytical Formula Console
                </h3>
                <span className="text-xs text-[#787668]">
                  Target DB:{' '}
                  <span className="font-mono font-bold text-[#5A5A40]">{selectedDb.name}</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExecuteSql}
                  disabled={isExecutingSql}
                  className="bg-[#5A5A40] hover:bg-[#474732] text-white px-5 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
                >
                  <Play className={`w-3.5 h-3.5 ${isExecutingSql ? 'animate-spin' : ''}`} />
                  <span>{isExecutingSql ? 'Running SQL...' : 'Execute SQL (Ctrl+Enter)'}</span>
                </button>

                <button
                  onClick={handleBindToDashboard}
                  className="bg-white hover:bg-[#F5F5F0] text-[#5A5A40] border border-[#E5E5DE] px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Save as Widget Feed</span>
                </button>
              </div>
            </div>

            {/* SQL Textarea */}
            <div className="relative">
              <textarea
                rows={7}
                value={rawSql}
                onChange={(e) => setRawSql(e.target.value)}
                className="w-full bg-[#2D2D24] text-[#E9E9E0] border border-[#3D3D32] rounded-2xl p-4 font-mono text-xs focus:outline-none focus:border-[#5A5A40] leading-relaxed shadow-inner"
              />
            </div>
          </div>

          {/* SQL Output Table */}
          {sqlResult && (
            <div className="bg-white border border-[#E5E5DE] rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-[#2D2D24] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2E6930]" />
                  <span>Executed in {sqlResult.executionTimeMs}ms • {sqlResult.rowCount} rows fetched</span>
                </span>
                <button className="flex items-center gap-1.5 text-xs text-[#5A5A40] font-semibold hover:underline cursor-pointer">
                  <Download className="w-3.5 h-3.5" />
                  <span>Download CSV</span>
                </button>
              </div>

              <div className="overflow-x-auto border border-[#E5E5DE] rounded-2xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#F5F5F0] text-[10px] uppercase font-bold text-[#8B7E66] border-b border-[#E5E5DE]">
                    <tr>
                      {sqlResult.columns.map((c) => (
                        <th key={c} className="p-3">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5DE]">
                    {sqlResult.rows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-[#F9F9F7]">
                        {sqlResult.columns.map((c) => (
                          <td key={c} className="p-3 font-mono text-[#2D2D24]">
                            {String(row[c] ?? '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Connect New External Database Modal */}
      {isConnectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5E5DE] rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 animate-scale-in text-[#2D2D24]">
            <div className="flex items-center justify-between border-b border-[#E5E5DE] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#5A5A40]/10 flex items-center justify-center text-[#5A5A40]">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-serif italic font-semibold">Connect External Database</h3>
                  <span className="text-[10px] text-[#8B7E66]">
                    Hook up your PostgreSQL, Snowflake, MySQL or Cloud database
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsConnectModalOpen(false)}
                className="text-[#8B7E66] hover:text-[#2D2D24] p-1 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConnectDbSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#2D2D24]">Connection Alias *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AWS Postgres Replica"
                    value={newDb.name}
                    onChange={(e) => setNewDb({ ...newDb, name: e.target.value })}
                    className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl p-2.5 text-xs text-[#2D2D24] outline-none focus:border-[#5A5A40]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#2D2D24]">Database Engine</label>
                  <select
                    value={newDb.engine}
                    onChange={(e: any) => setNewDb({ ...newDb, engine: e.target.value })}
                    className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl p-2.5 text-xs text-[#2D2D24] outline-none focus:border-[#5A5A40]"
                  >
                    <option value="postgresql">PostgreSQL</option>
                    <option value="mysql">MySQL</option>
                    <option value="snowflake">Snowflake Cloud</option>
                    <option value="mongodb">MongoDB Atlas</option>
                    <option value="amazon_aurora">Amazon Aurora</option>
                    <option value="supabase">Supabase</option>
                    <option value="google_cloudsql">Google Cloud SQL</option>
                    <option value="bigquery">Google BigQuery</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1">
                  <label className="font-semibold text-[#2D2D24]">Host / Cluster URL *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. db.customer-cloud.com"
                    value={newDb.host}
                    onChange={(e) => setNewDb({ ...newDb, host: e.target.value })}
                    className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl p-2.5 font-mono text-xs text-[#2D2D24] outline-none focus:border-[#5A5A40]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#2D2D24]">Port</label>
                  <input
                    type="number"
                    value={newDb.port}
                    onChange={(e) => setNewDb({ ...newDb, port: Number(e.target.value) })}
                    className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl p-2.5 font-mono text-xs text-[#2D2D24] outline-none focus:border-[#5A5A40]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#2D2D24]">Database Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. enterprise_erp"
                    value={newDb.databaseName}
                    onChange={(e) => setNewDb({ ...newDb, databaseName: e.target.value })}
                    className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl p-2.5 font-mono text-xs text-[#2D2D24] outline-none focus:border-[#5A5A40]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#2D2D24]">Username</label>
                  <input
                    type="text"
                    placeholder="readonly_user"
                    value={newDb.username}
                    onChange={(e) => setNewDb({ ...newDb, username: e.target.value })}
                    className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl p-2.5 font-mono text-xs text-[#2D2D24] outline-none focus:border-[#5A5A40]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#2D2D24]">Password / Secret Key</label>
                <input
                  type="password"
                  placeholder="••••••••••••••••"
                  value={newDb.password}
                  onChange={(e) => setNewDb({ ...newDb, password: e.target.value })}
                  className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl p-2.5 font-mono text-xs text-[#2D2D24] outline-none focus:border-[#5A5A40]"
                />
              </div>

              <div className="flex items-center gap-2 p-2 bg-[#F9F9F7] rounded-xl border border-[#E5E5DE]">
                <input
                  type="checkbox"
                  id="sslCheck"
                  checked={newDb.ssl}
                  onChange={(e) => setNewDb({ ...newDb, ssl: e.target.checked })}
                  className="text-[#5A5A40] rounded focus:ring-0"
                />
                <label htmlFor="sslCheck" className="text-xs text-[#2D2D24] font-medium cursor-pointer">
                  Require TLS/SSL Encrypted Tunnel (Recommended)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E5E5DE]">
                <button
                  type="button"
                  onClick={() => setIsConnectModalOpen(false)}
                  className="px-4 py-2 bg-[#F5F5F0] hover:bg-[#E9E9E0] text-[#2D2D24] rounded-xl font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#5A5A40] hover:bg-[#474732] text-white rounded-xl font-semibold cursor-pointer shadow-xs"
                >
                  Verify &amp; Connect DB
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
