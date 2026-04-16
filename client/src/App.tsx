import { useEffect, useState } from 'react';
import './App.css';

// API base URL - change this for different environments
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'http://localhost:4000'
  : '';

type Incident = {
  id: number;
  description: string;
  location: string;
  severity: number;
  created_at: string;
  resolved: boolean;
  dismissed: boolean;
};

type IncidentFilters = {
  dismissed?: 'true' | 'false';
  resolved?: 'true' | 'false';
  order?: string;
};

function IncidentFilters({ onFilterChange, onFetch }: {
  onFilterChange: (filters: IncidentFilters) => void;
  onFetch: () => void;
}) {
  const [filters, setFilters] = useState<IncidentFilters>({
    order: 'created_at'
  });

  const handleChange = (key: keyof IncidentFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="filters-section">
      <h3>Filter Incidents</h3>
      <div className="filters">
        <label>
          Dismissed:
          <select
            value={filters.dismissed || ''}
            onChange={(e) => handleChange('dismissed', e.target.value || undefined)}
          >
            <option value="">All</option>
            <option value="true">Dismissed Only</option>
            <option value="false">Not Dismissed</option>
          </select>
        </label>
        <label>
          Resolved:
          <select
            value={filters.resolved || ''}
            onChange={(e) => handleChange('resolved', e.target.value || undefined)}
          >
            <option value="">All</option>
            <option value="true">Resolved Only</option>
            <option value="false">Not Resolved</option>
          </select>
        </label>
        <label>
          Order by:
          <select
            value={filters.order}
            onChange={(e) => handleChange('order', e.target.value)}
          >
            <option value="created_at">Created At</option>
            <option value="severity">Severity</option>
            <option value="location">Location</option>
          </select>
        </label>
        <button onClick={onFetch}>Fetch Incidents</button>
      </div>
    </div>
  );
}

function IncidentList({ incidents, title, onAction }: { incidents: Incident[]; title: string; onAction?: (id: number, action: 'resolve' | 'dismiss') => void }) {
  return (
    <div className="incident-list-section">
      <h3>{title}</h3>
      {incidents.length === 0 ? (
        <p>No incidents found.</p>
      ) : (
        <ul className="incident-list">
          {incidents.map((incident) => {
            const isResolved = Boolean(incident.resolved);
            const isDismissed = Boolean(incident.dismissed);
            return (
            <li key={incident.id} className={`incident-item ${isResolved ? 'resolved' : ''} ${isDismissed ? 'dismissed' : ''}`}>
              <div className="incident-header">
                <strong>Incident #{incident.id}</strong>
                <span className={`severity severity-${incident.severity}`}>
                  Severity: {incident.severity}
                </span>
              </div>
              <p className="description">{incident.description}</p>
              <div className="incident-meta">
                <span>Location: {incident.location}</span>
                <span>Created: {new Date(incident.created_at).toLocaleString()}</span>
                {isResolved && <span className="status resolved">Resolved</span>}
                {isDismissed && !isResolved && <span className="status dismissed">Dismissed</span>}
              </div>
              {onAction && !isResolved && (
                <div className="incident-actions">
                  <button onClick={() => onAction(incident.id, 'resolve')}>Resolve</button>
                  {!isDismissed && <button onClick={() => onAction(incident.id, 'dismiss')}>Dismiss</button>}
                </div>
              )}
            </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function AutoRefreshIncidents() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(true);

  const intervalMs = 1 * 60 * 1000; // 1 minute
  const intervalMinutes = intervalMs / (60 * 1000);

  const fetchActiveIncidents = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/incidents?dismissed=false&resolved=false`);
      if (!response.ok) throw new Error('Failed to fetch incidents');
      const data = await response.json();
      setIncidents(data);
      setError(null);
    } catch (err) {
      setError('Unable to fetch active incidents');
    }
  };

  const handleAction = async (id: number, action: 'resolve' | 'dismiss') => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/incidents/${action}/${id}`, {
        method: 'PATCH',
      });
      if (!response.ok) throw new Error(`Failed to ${action} incident`);
      fetchActiveIncidents(); // Refresh the list
    } catch (err) {
      setError(`Unable to ${action} incident`);
    }
  };

  useEffect(() => {
    fetchActiveIncidents(); // Initial fetch

    if (isPolling) {
      const interval = setInterval(fetchActiveIncidents, intervalMs);
      return () => clearInterval(interval);
    }
  }, [isPolling]);

  return (
    <div className="auto-refresh-section">
      <div className="auto-refresh-header">
        <h3>Active Incidents (Auto-refresh every {intervalMinutes} minute{intervalMinutes !== 1 ? 's' : ''})</h3>
        <button onClick={() => setIsPolling(!isPolling)}>
          {isPolling ? 'Pause' : 'Resume'} Auto-refresh
        </button>
      </div>
      {error && <p className="error">{error}</p>}
      <IncidentList incidents={incidents} title="" onAction={handleAction} />
    </div>
  );
}

function CreateIncidentForm({ onIncidentCreated }: { onIncidentCreated: () => void }) {
  const [formData, setFormData] = useState({
    description: '',
    location: '',
    severity: 1
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/incidents/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to create incident');

      setMessage('Incident created successfully!');
      setFormData({ description: '', location: '', severity: 1 });
      onIncidentCreated();
    } catch (err) {
      setMessage('Failed to create incident');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="create-incident-section">
      <h3>Create New Incident</h3>
      <form onSubmit={handleSubmit} className="create-form">
        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            required
            rows={3}
          />
        </div>
        <div className="form-group">
          <label htmlFor="location">Location:</label>
          <input
            type="text"
            id="location"
            value={formData.location}
            onChange={(e) => handleChange('location', e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="severity">Severity (1-5):</label>
          <input
            type="number"
            id="severity"
            min="1"
            max="5"
            value={formData.severity}
            onChange={(e) => handleChange('severity', Number(e.target.value))}
            required
          />
        </div>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Incident'}
        </button>
        {message && <p className={message.includes('success') ? 'success' : 'error'}>{message}</p>}
      </form>
    </div>
  );
}

export default function App() {
  const [filteredIncidents, setFilteredIncidents] = useState<Incident[]>([]);
  const [currentFilters, setCurrentFilters] = useState<IncidentFilters>({});
  const [error, setError] = useState<string | null>(null);

  const fetchFilteredIncidents = async () => {
    try {
      const params = new URLSearchParams();
      if (currentFilters.dismissed) params.append('dismissed', currentFilters.dismissed);
      if (currentFilters.resolved) params.append('resolved', currentFilters.resolved);
      if (currentFilters.order) params.append('order', currentFilters.order);

      const response = await fetch(`${API_BASE_URL}/api/incidents?${params}`);
      if (!response.ok) throw new Error('Failed to fetch incidents');
      const data = await response.json();
      setFilteredIncidents(data);
      setError(null);
    } catch (err) {
      setError('Unable to fetch incidents');
    }
  };

  const handleFilterChange = (filters: IncidentFilters) => {
    setCurrentFilters(filters);
  };

  const handleAction = async (id: number, action: 'resolve' | 'dismiss') => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/incidents/${action}/${id}`, {
        method: 'PATCH',
      });
      if (!response.ok) throw new Error(`Failed to ${action} incident`);
      fetchFilteredIncidents(); // Refresh the filtered list
    } catch (err) {
      setError(`Unable to ${action} incident`);
    }
  };

  return (
    <div className="app-shell">
      <header>
        <h1>Traffic Incident Monitor</h1>
        <p>Monitor and manage traffic incidents</p>
      </header>

      <div className="main-content">
        {/* Top Section: Incident Reception */}
        <section className="incident-reception">
          <h2>Incident Reception</h2>

          {/* Automatic polling */}
          <AutoRefreshIncidents />

          {/* User-requested incidents */}
          <div className="user-requested-section">
            <IncidentFilters onFilterChange={handleFilterChange} onFetch={fetchFilteredIncidents} />
            {error && <p className="error">{error}</p>}
            <IncidentList incidents={filteredIncidents} title="Filtered Results" onAction={handleAction} />
          </div>
        </section>

        {/* Bottom Section: Create New Requests */}
        <section className="create-requests">
          <CreateIncidentForm onIncidentCreated={() => {}} />
        </section>
      </div>
    </div>
  );
}
