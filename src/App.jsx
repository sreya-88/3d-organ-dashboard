import { useState, useEffect, useRef } from 'react';
import { Settings, Activity, UploadCloud, Printer, CheckCircle, Brain, HeartPulse, Stethoscope, Droplet, User, Scale, Ruler, Database, AlertCircle } from 'lucide-react';
import Organ3D from './Organ3D';
import './App.css';

function App() {
  // Input State
  const [organ, setOrgan] = useState('Kidney');
  const [age, setAge] = useState(45);
  const [height, setHeight] = useState(175);
  const [weight, setWeight] = useState(70);
  const [conditions, setConditions] = useState({
    diabetes: false,
    hypertension: false,
    none: true,
  });

  // Output State
  const [results, setResults] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorInfo, setErrorInfo] = useState(null);

  // File Upload State
  const [fileName, setFileName] = useState(null);
  const fileInputRef = useRef(null);

  // Auto-calculate BMI
  const bmi = weight / Math.pow(height / 100, 2);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) setFileName(file.name);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) setFileName(file.name);
  };

  const handleConditionChange = (condition) => {
    setConditions(prev => {
      if (condition === 'none') {
        return { diabetes: false, hypertension: false, none: true };
      }
      return {
        ...prev,
        [condition]: !prev[condition],
        none: false
      };
    });
  };

  const calculateScaffold = async () => {
    setErrorInfo(null);
    setResults(null);

    if (age <= 0 || height <= 0 || weight <= 0) {
      setErrorInfo('Insufficient data: Age, Height, and Weight must be valid numbers greater than zero.');
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('http://localhost:5000/api/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ organ, age, height, weight, conditions })
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorInfo(data.error || 'A server error occurred while processing parameters.');
      } else {
        setResults(data);
      }
    } catch (error) {
      console.error('Error fetching calculation:', error);
      setErrorInfo('Network Error: Failed to connect to the computational engine.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <header className="top-navbar">
        <div className="brand">
          <Activity className="brand-icon" size={28} />
          <span>NeuroBio System</span>
        </div>
        <div className="nav-status">
          <div className="status-indicator">
            <div className="status-dot"></div>
            <span>System Active</span>
          </div>
          <div className="user-info">
            <Settings size={20} color="var(--text-muted)" />
            <User size={20} color="var(--text-muted)" />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="main-content">

        {/* Left Panel: Patient Data Input */}
        <div className="panel left-panel">
          <div className="panel-header">
            <Stethoscope size={20} />
            Patient Data & Configuration
          </div>

          <div className="form-group">
            <label>Organ Selection</label>
            <select
              className="form-control"
              value={organ}
              onChange={(e) => setOrgan(e.target.value)}
            >
              <option value="Kidney">Kidney</option>
              <option value="Liver">Liver</option>
              <option value="Heart Scaffold">Heart Scaffold</option>
            </select>
          </div>

          <div className="row-inputs">
            <div className="form-group">
              <label>Patient Age (Yrs)</label>
              <input
                type="number"
                className="form-control"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
              />
            </div>
            <div className="form-group">
              <label>Calculated BMI</label>
              <div className="form-control" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--accent-teal)', fontWeight: 'bold' }}>
                {bmi.toFixed(1)} kg/m²
              </div>
            </div>
          </div>

          <div className="row-inputs">
            <div className="form-group">
              <label>Height (cm)</label>
              <input
                type="number"
                className="form-control"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
              />
            </div>
            <div className="form-group">
              <label>Weight (kg)</label>
              <input
                type="number"
                className="form-control"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Pre-existing Conditions</label>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={conditions.none}
                  onChange={() => handleConditionChange('none')}
                />
                None / Healthy
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={conditions.diabetes}
                  onChange={() => handleConditionChange('diabetes')}
                />
                Diabetes (Vascular Adjust)
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={conditions.hypertension}
                  onChange={() => handleConditionChange('hypertension')}
                />
                Hypertension (Elasticity Adjust)
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>MRI/CT Scan Data (Optional)</label>
            <div
              className="upload-box"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              style={{
                borderColor: fileName ? 'var(--accent-green)' : '',
                backgroundColor: fileName ? 'rgba(16, 172, 132, 0.05)' : ''
              }}
            >
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
              <UploadCloud size={24} color={fileName ? 'var(--accent-green)' : 'currentColor'} />
              <span style={{ color: fileName ? 'var(--accent-green)' : 'currentColor', fontWeight: fileName ? 600 : 400 }}>
                {fileName ? fileName : 'Click or drag DICOM files'}
              </span>
            </div>
          </div>

          <button
            className="btn-primary"
            onClick={calculateScaffold}
            disabled={isGenerating}
          >
            <Brain size={20} />
            {isGenerating ? 'Processing Model...' : 'Generate Scaffold Model'}
          </button>

          {errorInfo && (
            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              backgroundColor: 'rgba(255, 107, 107, 0.1)',
              border: '1px solid var(--danger)',
              borderRadius: '8px',
              color: 'var(--danger)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              fontSize: '0.9rem'
            }}>
              <AlertCircle size={20} />
              <span>{errorInfo}</span>
            </div>
          )}
        </div>

        {/* Center Panel: Visualization & Primary Metrics */}
        <div className="panel center-panel">
          <div className="panel-header">
            <Database size={20} />
            Model Visualization
          </div>

          <div className="visualization-mock">
            <div className="grid-bg"></div>

            <Organ3D organ={organ} isGenerating={isGenerating} />

            <div className="vis-content" style={{ zIndex: 20, pointerEvents: 'none', position: 'absolute', bottom: '1rem' }}>
              <div className="placeholder-text" style={{ background: 'rgba(10, 14, 23, 0.85)', backdropFilter: 'blur(4px)' }}>
                {results ? `${organ} Scaffold Rendered` : 'Awaiting Data Parameter Input'}
              </div>
            </div>
          </div>

          <div className="metrics-grid">
            <div className="metric-card">
              <span className="metric-title">Calc. Organ Volume</span>
              <span className="metric-value">
                {results ? results.organVolume : '---.-'} <span className="metric-unit">cm³</span>
              </span>
            </div>
            <div className="metric-card accent-blue">
              <span className="metric-title">Dimensions (H/W/D)</span>
              <span className="metric-value" style={{ fontSize: '1rem' }}>
                {results ? results.volumeAdjustments : '--- / --- / ---'}
              </span>
            </div>
            <div className="metric-card accent-green">
              <span className="metric-title">Structural Density Index</span>
              <span className="metric-value">
                {results ? results.densityIndex : '-.--'} <span className="metric-unit">ρ</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Panel: Output Parameters & Print Instructions */}
        <div className="panel right-panel">
          <div className="panel-header">
            <Printer size={20} />
            Bioprinting Parameters
          </div>

          <div className="metrics-grid">
            <div className="metric-card accent-blue">
              <span className="metric-title">Total Biomaterial</span>
              <span className="metric-value">
                {results ? results.scaffoldMaterial : '---.-'} <span className="metric-unit">ml</span>
              </span>
            </div>
            <div className="metric-card">
              <span className="metric-title">Estimated Weight</span>
              <span className="metric-value">
                {results ? results.estimatedWeight : '---.-'} <span className="metric-unit">g</span>
              </span>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '0.5rem' }}>
            <label style={{ display: 'flex', justifyContent: 'space-between' }}>
              Structural Stability Score
              <span style={{ color: 'var(--text-main)' }}>{results ? results.structuralStability : '--'} / 100</span>
            </label>
            <div className="progress-container">
              <div
                className="progress-bar"
                style={{
                  width: `${results ? results.structuralStability : 0}%`,
                  background: 'linear-gradient(90deg, var(--danger), var(--accent-green))'
                }}
              ></div>
            </div>
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', justifyContent: 'space-between' }}>
              AI Confidence Index
              <span style={{ color: 'var(--accent-teal)' }}>{results ? results.aiConfidence : '--'}%</span>
            </label>
            <div className="progress-container">
              <div
                className="progress-bar"
                style={{ width: `${results ? results.aiConfidence : 0}%` }}
              ></div>
            </div>
          </div>

          <div className="form-group">
            <label>Print Instructions Generator</label>
            <div className="metric-card" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span className="metric-title">Layer Thickness</span>
                <span style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>0.2 mm</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span className="metric-title">Est. Printing Time</span>
                <span style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>
                  {results ? `${results.printTime} hrs` : '--'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="metric-title">Estimated Cost</span>
                <span style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>
                  {results ? `$${results.printCost}` : '--'}
                </span>
              </div>
            </div>
          </div>

          {results && (
            <div className="status-box">
              <div className="icon">
                <CheckCircle size={24} />
              </div>
              <div className="text">
                <p>Status</p>
                <p>G-code Ready for Bioprinter</p>
              </div>
            </div>
          )}

        </div>

      </main>
    </div>
  );
}

export default App;
