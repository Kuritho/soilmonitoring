import React, { useState, useEffect } from 'react';
import './App.css';
import { 
  Droplets, 
  Thermometer, 
  Gauge, 
  Leaf, 
  TestTube, 
  Sprout,
  Wifi,
  Settings,
  TrendingUp,
  Activity,
  Zap,
  BarChart3,
  Clock,
  Database,
  Play,
  Square,
  Download,
  Trash2,
  Search
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

function App() {
  const [sensorData, setSensorData] = useState({
    npk: { nitrogen: 45, phosphorus: 30, potassium: 60 },
    conductivity: 850,
    moisture: 65,
    temperature: 22.5,
    ph: 6.8,
    fertilizer: 25
  });

  const [historicalData, setHistoricalData] = useState([]);
  const [allRecordedData, setAllRecordedData] = useState([]);
  const [isConnected, setIsConnected] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [recordingStartTime, setRecordingStartTime] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('soilSensorData');
    if (savedData) {
      setAllRecordedData(JSON.parse(savedData));
    }
  }, []);

  // Save data to localStorage whenever allRecordedData changes
  useEffect(() => {
    localStorage.setItem('soilSensorData', JSON.stringify(allRecordedData));
  }, [allRecordedData]);

  // Generate historical data
  useEffect(() => {
    const generateHistoricalData = () => {
      const data = [];
      const now = new Date();
      
      for (let i = 23; i >= 0; i--) {
        const time = new Date(now);
        time.setHours(now.getHours() - i);
        
        data.push({
          time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          moisture: 50 + Math.random() * 30,
          temperature: 18 + Math.random() * 12,
          ph: 5.5 + Math.random() * 3,
          conductivity: 500 + Math.random() * 1200,
          nitrogen: 30 + Math.random() * 50,
          phosphorus: 20 + Math.random() * 40,
          potassium: 40 + Math.random() * 40
        });
      }
      return data;
    };

    setHistoricalData(generateHistoricalData());
  }, []);

  // Recording timer
  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Simulate sensor data updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (isConnected) {
        const newData = {
          npk: {
            nitrogen: Math.max(0, Math.min(100, sensorData.npk.nitrogen + (Math.random() * 4 - 2))),
            phosphorus: Math.max(0, Math.min(100, sensorData.npk.phosphorus + (Math.random() * 4 - 2))),
            potassium: Math.max(0, Math.min(100, sensorData.npk.potassium + (Math.random() * 4 - 2)))
          },
          conductivity: Math.max(200, Math.min(2000, sensorData.conductivity + (Math.random() * 40 - 20))),
          moisture: Math.max(0, Math.min(100, (sensorData.moisture + (Math.random() * 4 - 2)))),
          temperature: Math.max(10, Math.min(35, (sensorData.temperature + (Math.random() * 1 - 0.5)))),
          ph: Math.max(4, Math.min(9, (sensorData.ph + (Math.random() * 0.2 - 0.1)))),
          fertilizer: Math.max(0, Math.min(50, sensorData.fertilizer + (Math.random() * 2 - 1)))
        };

        setSensorData(newData);

        // Always record data when connected, but mark recording session
        const timestamp = new Date();
        const dataEntry = {
          id: timestamp.getTime() + Math.random(),
          timestamp: timestamp.toLocaleString(),
          date: timestamp.toLocaleDateString(),
          time: timestamp.toLocaleTimeString(),
          ...newData,
          recordingTime: isRecording ? formatDuration(recordingDuration) : 'Auto',
          session: isRecording ? 'Manual Recording' : 'Auto Log'
        };

        setAllRecordedData(prev => {
          const newDataArray = [dataEntry, ...prev]; // Add to beginning for newest first
          // Keep only last 1000 entries to prevent memory issues
          return newDataArray.slice(0, 1000);
        });

        // Update historical data
        setHistoricalData(prev => {
          const newDataArray = [...prev.slice(1)];
          const newTime = new Date();
          
          newDataArray.push({
            time: newTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            moisture: newData.moisture,
            temperature: newData.temperature,
            ph: newData.ph,
            conductivity: newData.conductivity,
            nitrogen: newData.npk.nitrogen,
            phosphorus: newData.npk.phosphorus,
            potassium: newData.npk.potassium
          });
          
          return newDataArray;
        });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isConnected, sensorData, isRecording, recordingDuration]);

  const toggleConnection = () => {
    setIsConnected(!isConnected);
  };

  const toggleRecording = () => {
    if (!isRecording) {
      // Start recording
      setRecordingStartTime(new Date());
      setRecordingDuration(0);
    } else {
      // Stop recording
      setRecordingStartTime(null);
    }
    setIsRecording(!isRecording);
  };

  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to delete all recorded data? This action cannot be undone.')) {
      setAllRecordedData([]);
      localStorage.removeItem('soilSensorData');
    }
  };

  const exportData = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "ID,Timestamp,Date,Time,Recording Session,Recording Time,Nitrogen (%),Phosphorus (%),Potassium (%),Moisture (%),Temperature (°C),pH,Conductivity (µS/cm),Fertilizer (kg/ha)\n"
      + allRecordedData.map(row => 
          `"${row.id}","${row.timestamp}","${row.date}","${row.time}","${row.session}","${row.recordingTime}",${row.npk.nitrogen},${row.npk.phosphorus},${row.npk.potassium},${row.moisture},${row.temperature},${row.ph},${row.conductivity},${row.fertilizer}`
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `soil-sensor-data-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusColor = (value, type) => {
    switch (type) {
      case 'moisture':
        return value < 30 ? '#ef4444' : value < 70 ? '#eab308' : '#22c55e';
      case 'ph':
        return value < 5.5 || value > 7.5 ? '#ef4444' : value < 6 || value > 7 ? '#eab308' : '#22c55e';
      case 'temperature':
        return value < 15 || value > 30 ? '#ef4444' : value < 18 || value > 25 ? '#eab308' : '#22c55e';
      case 'conductivity':
        return value < 500 || value > 1500 ? '#ef4444' : value < 800 || value > 1200 ? '#eab308' : '#22c55e';
      case 'nitrogen':
        return value < 30 ? '#ef4444' : value < 60 ? '#eab308' : '#22c55e';
      case 'phosphorus':
        return value < 20 ? '#ef4444' : value < 40 ? '#eab308' : '#22c55e';
      case 'potassium':
        return value < 40 ? '#ef4444' : value < 70 ? '#eab308' : '#22c55e';
      default:
        return '#3b82f6';
    }
  };

  // Filter recorded data based on search term
  const filteredData = allRecordedData.filter(record => 
    record.timestamp.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.session.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.recordingTime.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // NPK Radar Data
  const npkRadarData = [
    { subject: 'N', value: sensorData.npk.nitrogen, fullMark: 100 },
    { subject: 'P', value: sensorData.npk.phosphorus, fullMark: 100 },
    { subject: 'K', value: sensorData.npk.potassium, fullMark: 100 },
  ];

  // Soil Health Data
  const soilHealthData = [
    { name: 'Optimal', value: 65, color: '#22c55e' },
    { name: 'Moderate', value: 25, color: '#eab308' },
    { name: 'Poor', value: 10, color: '#ef4444' },
  ];

  // Quick Stats for Overview
  const quickStats = [
    {
      icon: Droplets,
      label: 'Moisture',
      value: sensorData.moisture.toFixed(1),
      unit: '%',
      color: getStatusColor(sensorData.moisture, 'moisture')
    },
    {
      icon: Thermometer,
      label: 'Temperature',
      value: sensorData.temperature.toFixed(1),
      unit: '°C',
      color: getStatusColor(sensorData.temperature, 'temperature')
    },
    {
      icon: TestTube,
      label: 'pH Level',
      value: sensorData.ph.toFixed(1),
      unit: '',
      color: getStatusColor(sensorData.ph, 'ph')
    },
    {
      icon: Gauge,
      label: 'Conductivity',
      value: sensorData.conductivity.toFixed(0),
      unit: 'µS/cm',
      color: getStatusColor(sensorData.conductivity, 'conductivity')
    }
  ];

  return (
    <div className="app dark-theme">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <Sprout className="logo-icon" />
            <h1>USM-KCC MoNiTR</h1>
          </div>
          <div className="header-controls">
            <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
              <Wifi size={18} />
              <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
            <button className="settings-btn">
              <Settings size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <Activity size={16} />
          Overview
        </button>
        <button 
          className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <BarChart3 size={16} />
          Analytics
        </button>
        <button 
          className={`tab ${activeTab === 'npk' ? 'active' : ''}`}
          onClick={() => setActiveTab('npk')}
        >
          <Zap size={16} />
          NPK
        </button>
        <button 
          className={`tab ${activeTab === 'recording' ? 'active' : ''}`}
          onClick={() => setActiveTab('recording')}
        >
          <Database size={16} />
          Data Log
        </button>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        {/* Connection Status */}
        <div className="status-bar">
          <div className="sensor-status">
            <div className={`status-indicator ${isConnected ? 'online' : 'offline'}`}></div>
            <span>II Recorder Sensor {isConnected ? 'Online' : 'Offline'}</span>
          </div>
          <button 
            className={`connect-btn ${isConnected ? 'connected' : 'disconnected'}`}
            onClick={toggleConnection}
          >
            {isConnected ? 'Disconnect' : 'Connect'}
          </button>
        </div>

        {activeTab === 'overview' && (
          <div className="overview-content">
            {/* Quick Stats Grid */}
            <div className="stats-grid">
              {quickStats.map((stat, index) => (
                <div key={index} className="stat-card">
                  <div className="stat-header">
                    <stat.icon className="stat-icon" style={{ color: stat.color }} />
                    <span className="stat-label">{stat.label}</span>
                  </div>
                  <div className="stat-value" style={{ color: stat.color }}>
                    {stat.value}
                    <span className="stat-unit">{stat.unit}</span>
                  </div>
                  <div className="stat-chart">
                    <ResponsiveContainer width="100%" height={40}>
                      <AreaChart data={historicalData.slice(-6)}>
                        <Area 
                          type="monotone" 
                          dataKey={stat.label.toLowerCase()} 
                          stroke={stat.color}
                          fill={stat.color}
                          fillOpacity={0.1}
                          strokeWidth={1.5}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ))}
            </div>

            {/* NPK Balance - Fixed Layout */}
            <div className="card graph-card">
  <div className="card-header">
    <Zap className="card-icon" />
    <h2>NPK Balance</h2>
    <div className="npk-overview">
      <div className="npk-overview-item">
        <div className="npk-dot nitrogen"></div>
        <span>N</span>
      </div>
      <div className="npk-overview-item">
        <div className="npk-dot phosphorus"></div>
        <span>P</span>
      </div>
      <div className="npk-overview-item">
        <div className="npk-dot potassium"></div>
        <span>K</span>
      </div>
    </div>
  </div>
  
  {/* NPK Bar Chart */}
  <div className="npk-chart-container">
    <div className="npk-chart">
      <div className="npk-chart-item">
        <div className="npk-bar-wrapper">
          <div 
            className="npk-bar nitrogen"
            style={{ height: `${sensorData.npk.nitrogen}%` }}
          >
            <div className="npk-value">{sensorData.npk.nitrogen.toFixed(0)}%</div>
          </div>
        </div>
        <div className="npk-label">Nitrogen</div>
        <div className="npk-status" style={{ color: getStatusColor(sensorData.npk.nitrogen, 'nitrogen') }}>
          {sensorData.npk.nitrogen < 30 ? 'Low' : sensorData.npk.nitrogen < 60 ? 'Optimal' : 'High'}
        </div>
      </div>
      
      <div className="npk-chart-item">
        <div className="npk-bar-wrapper">
          <div 
            className="npk-bar phosphorus"
            style={{ height: `${sensorData.npk.phosphorus}%` }}
          >
            <div className="npk-value">{sensorData.npk.phosphorus.toFixed(0)}%</div>
          </div>
        </div>
        <div className="npk-label">Phosphorus</div>
        <div className="npk-status" style={{ color: getStatusColor(sensorData.npk.phosphorus, 'phosphorus') }}>
          {sensorData.npk.phosphorus < 20 ? 'Low' : sensorData.npk.phosphorus < 40 ? 'Optimal' : 'High'}
        </div>
      </div>
      
      <div className="npk-chart-item">
        <div className="npk-bar-wrapper">
          <div 
            className="npk-bar potassium"
            style={{ height: `${sensorData.npk.potassium}%` }}
          >
            <div className="npk-value">{sensorData.npk.potassium.toFixed(0)}%</div>
          </div>
        </div>
        <div className="npk-label">Potassium</div>
        <div className="npk-status" style={{ color: getStatusColor(sensorData.npk.potassium, 'potassium') }}>
          {sensorData.npk.potassium < 40 ? 'Low' : sensorData.npk.potassium < 70 ? 'Optimal' : 'High'}
        </div>
      </div>
    </div>
    
    {/* Y-axis labels */}
    <div className="npk-y-axis">
      <span>100%</span>
      <span>75%</span>
      <span>50%</span>
      <span>25%</span>
      <span>0%</span>
    </div>
  </div>
  
  {/* NPK Trend Indicators */}
  <div className="npk-trends">
    <div className="trend-item">
      <div className="trend-label">Balance Score</div>
      <div className="trend-value">
        {Math.min(sensorData.npk.nitrogen, sensorData.npk.phosphorus, sensorData.npk.potassium).toFixed(0)}%
      </div>
      <div className="trend-indicator">
        {Math.abs(sensorData.npk.nitrogen - sensorData.npk.phosphorus) < 20 && 
         Math.abs(sensorData.npk.phosphorus - sensorData.npk.potassium) < 20 ? 
         '⚡ Balanced' : '⚠️ Imbalanced'}
      </div>
    </div>
  </div>
</div>

            {/* Soil Health & Recommendation */}
            <div className="recommendation-grid">
              <div className="card health-card">
                <div className="card-header">
                  <Activity className="card-icon" />
                  <h2>Soil Health</h2>
                </div>
                <div className="health-content">
                  <div className="health-score">78%</div>
                  <div className="health-status">Good Condition</div>
                </div>
              </div>

              <div className="card fertilizer-card">
                <div className="card-header">
                  <Leaf className="card-icon" />
                  <h2>Fertilizer</h2>
                </div>
                <div className="fertilizer-content">
                  <div className="fertilizer-amount">
                    {sensorData.fertilizer.toFixed(0)}
                    <span className="amount-unit">kg/ha</span>
                  </div>
                  <div className="fertilizer-message">
                    {sensorData.fertilizer < 20 
                      ? "Low requirement"
                      : sensorData.fertilizer < 35
                      ? "Moderate need"
                      : "High requirement"
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="analytics-content">
            {/* Main Trends Chart */}
            <div className="card graph-card">
              <div className="card-header">
                <TrendingUp className="card-icon" />
                <h2>Soil Metrics Trend</h2>
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="time" stroke="#9ca3af" fontSize={11} />
                    <YAxis stroke="#9ca3af" fontSize={11} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="moisture" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="Moisture %"
                      dot={false}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="temperature" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      name="Temperature °C"
                      dot={false}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="ph" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      name="pH Level"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Conductivity Chart */}
            <div className="card graph-card">
              <div className="card-header">
                <Gauge className="card-icon" />
                <h2>Conductivity Trend</h2>
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="time" stroke="#9ca3af" fontSize={11} />
                    <YAxis stroke="#9ca3af" fontSize={11} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="conductivity" 
                      stroke="#8b5cf6" 
                      fill="#8b5cf6" 
                      fillOpacity={0.1}
                      strokeWidth={2}
                      name="Conductivity µS/cm"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'npk' && (
          <div className="npk-content">
            {/* NPK Radar Chart */}
            <div className="card graph-card">
              <div className="card-header">
                <Zap className="card-icon" />
                <h2>NPK Balance Analysis</h2>
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={npkRadarData}>
                    <PolarGrid stroke="#374151" />
                    <PolarAngleAxis dataKey="subject" stroke="#9ca3af" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#9ca3af" />
                    <Radar
                      name="NPK Levels"
                      dataKey="value"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.3}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }} 
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* NPK Historical */}
            <div className="card graph-card">
              <div className="card-header">
                <BarChart3 className="card-icon" />
                <h2>NPK Levels Over Time</h2>
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={historicalData.slice(-6)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="time" stroke="#9ca3af" fontSize={11} />
                    <YAxis stroke="#9ca3af" fontSize={11} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }} 
                    />
                    <Bar dataKey="nitrogen" fill="#3b82f6" name="Nitrogen" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="phosphorus" fill="#ef4444" name="Phosphorus" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="potassium" fill="#10b981" name="Potassium" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'recording' && (
          <div className="recording-content">
            {/* Recording Controls */}
            <div className="card recording-controls">
              <div className="card-header">
                <Database className="card-icon" />
                <h2>Data Log</h2>
                <div className="data-count">
                  {allRecordedData.length} records
                </div>
              </div>
              <div className="recording-status">
                <div className="recording-indicator">
                  <div className={`recording-dot ${isConnected ? 'online' : 'offline'}`}></div>
                  <span>Auto-logging: {isConnected ? 'Active' : 'Paused'}</span>
                </div>
                <div className="recording-timer">
                  <Clock size={16} />
                  <span>Session: {formatDuration(recordingDuration)}</span>
                </div>
              </div>
              <div className="recording-actions">
                <button 
                  className={`record-btn ${isRecording ? 'stop' : 'start'}`}
                  onClick={toggleRecording}
                >
                  {isRecording ? <Square size={16} /> : <Play size={16} />}
                  {isRecording ? 'Stop Manual Record' : 'Start Manual Record'}
                </button>
                {allRecordedData.length > 0 && (
                  <>
                    <button className="export-btn" onClick={exportData}>
                      <Download size={16} />
                      Export CSV
                    </button>
                    <button className="clear-btn" onClick={clearAllData}>
                      <Trash2 size={16} />
                      Clear All
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Search and Filter */}
            {allRecordedData.length > 0 && (
              <div className="card search-card">
                <div className="search-container">
                  <Search size={18} />
                  <input
                    type="text"
                    placeholder="Search by timestamp, session, or recording time..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                  {searchTerm && (
                    <button 
                      className="clear-search"
                      onClick={() => setSearchTerm('')}
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="search-info">
                  Showing {filteredData.length} of {allRecordedData.length} records
                  {searchTerm && ` for "${searchTerm}"`}
                </div>
              </div>
            )}

            {/* Recorded Data Table - Show ALL data */}
            {allRecordedData.length > 0 ? (
              <div className="card data-table-card">
                <div className="card-header">
                  <Database className="card-icon" />
                  <h2>All Recorded Data</h2>
                  <div className="data-stats">
                    <span className="session-stats">
                      Manual: {allRecordedData.filter(d => d.session === 'Manual Recording').length} | 
                      Auto: {allRecordedData.filter(d => d.session === 'Auto Log').length}
                    </span>
                  </div>
                </div>
                <div className="data-table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Timestamp</th>
                        <th>Session</th>
                        <th>Rec Time</th>
                        <th>N</th>
                        <th>P</th>
                        <th>K</th>
                        <th>Moist</th>
                        <th>Temp</th>
                        <th>pH</th>
                        <th>Cond</th>
                        <th>Fert</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((record) => (
                        <tr key={record.id}>
                          <td className="timestamp">
                            <div>{record.date}</div>
                            <div>{record.time}</div>
                          </td>
                          <td className={`session-type ${record.session === 'Manual Recording' ? 'manual' : 'auto'}`}>
                            {record.session === 'Manual Recording' ? 'Manual' : 'Auto'}
                          </td>
                          <td className="rec-time">{record.recordingTime}</td>
                          <td style={{ color: getStatusColor(record.npk.nitrogen, 'nitrogen') }}>
                            {record.npk.nitrogen.toFixed(0)}%
                          </td>
                          <td style={{ color: getStatusColor(record.npk.phosphorus, 'phosphorus') }}>
                            {record.npk.phosphorus.toFixed(0)}%
                          </td>
                          <td style={{ color: getStatusColor(record.npk.potassium, 'potassium') }}>
                            {record.npk.potassium.toFixed(0)}%
                          </td>
                          <td style={{ color: getStatusColor(record.moisture, 'moisture') }}>
                            {record.moisture.toFixed(1)}%
                          </td>
                          <td style={{ color: getStatusColor(record.temperature, 'temperature') }}>
                            {record.temperature.toFixed(1)}°
                          </td>
                          <td style={{ color: getStatusColor(record.ph, 'ph') }}>
                            {record.ph.toFixed(1)}
                          </td>
                          <td style={{ color: getStatusColor(record.conductivity, 'conductivity') }}>
                            {record.conductivity.toFixed(0)}
                          </td>
                          <td>
                            {record.fertilizer.toFixed(0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredData.length === 0 && (
                  <div className="no-data-message">
                    No records found matching your search.
                  </div>
                )}
              </div>
            ) : (
              <div className="card empty-state">
                <div className="empty-content">
                  <Database size={48} className="empty-icon" />
                  <h3>No Data Recorded Yet</h3>
                  <p>Connect your sensor to start auto-logging data, or start manual recording to capture measurements.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
