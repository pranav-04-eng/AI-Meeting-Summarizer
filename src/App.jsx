import React, { useState } from 'react';
import { Upload, FileVideo, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setError(null);
    setResult(null);
  };

  const handleSubmit = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError('Failed to upload and process the file. Please try again.');
      console.error('Error uploading file:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError(null);
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '48px 16px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    wrapper: {
      maxWidth: '900px',
      margin: '0 auto'
    },
    header: {
      textAlign: 'center',
      marginBottom: '48px'
    },
    iconContainer: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '64px',
      height: '64px',
      background: '#5a67d8',
      borderRadius: '16px',
      marginBottom: '16px'
    },
    title: {
      fontSize: '36px',
      fontWeight: 'bold',
      color: '#ffffff',
      marginBottom: '8px',
      margin: '0'
    },
    subtitle: {
      color: '#e6e6fa',
      fontSize: '16px',
      margin: '8px 0 0 0'
    },
    card: {
      background: '#ffffff',
      borderRadius: '16px',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      padding: '25px',
      marginBottom: '24px'
    },
    label: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '12px'
    },
uploadArea: {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  padding: '48px 24px',
  border: '2px dashed',
  borderRadius: '12px',
  cursor: loading ? 'not-allowed' : 'pointer',
  transition: 'all 0.2s',
  marginBottom: '24px',
  boxSizing: 'border-box' // ✅ Added
}
,
    uploadAreaDefault: {
      borderColor: '#d1d5db',
      background: '#ffffff'
    },
    uploadAreaHover: {
      borderColor: '#818cf8',
      background: '#f9fafb'
    },
    uploadAreaActive: {
      borderColor: '#6366f1',
      background: '#eef2ff'
    },
    uploadAreaDisabled: {
      opacity: 0.5
    },
    uploadContent: {
      textAlign: 'center'
    },
    fileName: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#111827',
      marginBottom: '4px'
    },
    fileSize: {
      fontSize: '12px',
      color: '#6b7280'
    },
    uploadText: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#374151',
      marginBottom: '4px'
    },
    uploadSubtext: {
      fontSize: '12px',
      color: '#6b7280'
    },
    buttonGroup: {
      display: 'flex',
      gap: '12px'
    },
    button: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      padding: '12px 24px',
      borderRadius: '12px',
      fontWeight: '600',
      fontSize: '14px',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    buttonPrimary: {
      background: '#6366f1',
      color: '#ffffff'
    },
    buttonPrimaryHover: {
      background: '#4f46e5'
    },
    buttonDisabled: {
      background: '#d1d5db',
      cursor: 'not-allowed'
    },
    buttonSecondary: {
      padding: '12px 24px',
      borderRadius: '12px',
      fontWeight: '600',
      fontSize: '14px',
      border: '2px solid #d1d5db',
      background: '#ffffff',
      color: '#374151',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    errorCard: {
      background: '#fef2f2',
      borderLeft: '4px solid #ef4444',
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '24px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px'
    },
    errorTitle: {
      fontWeight: '600',
      color: '#991b1b',
      marginBottom: '4px',
      margin: '0 0 4px 0'
    },
    errorText: {
      color: '#b91c1c',
      fontSize: '14px',
      margin: 0
    },
    resultCard: {
      background: '#ffffff',
      borderRadius: '16px',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      padding: '32px',
      marginBottom: '24px'
    },
    resultHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '16px'
    },
    resultIconContainer: {
      width: '40px',
      height: '40px',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    summaryIcon: {
      background: '#d1fae5'
    },
    actionIcon: {
      background: '#dbeafe'
    },
    resultTitle: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#111827',
      margin: 0
    },
    resultText: {
      color: '#374151',
      lineHeight: '1.75',
      whiteSpace: 'pre-wrap',
      margin: 0
    },
    actionList: {
      listStyle: 'none',
      padding: 0,
      margin: 0
    },
    actionItem: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      marginBottom: '12px'
    },
    actionNumber: {
      flexShrink: 0,
      width: '24px',
      height: '24px',
      background: '#eef2ff',
      color: '#6366f1',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '14px',
      fontWeight: '600'
    },
    actionText: {
      color: '#374151',
      paddingTop: '2px'
    }
  };

  const [isHovering, setIsHovering] = useState(false);

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.iconContainer}>
            <FileVideo size={32} color="#ffffff" />
          </div>
          <h1 style={styles.title}>Meeting Summarizer</h1>
          <p style={styles.subtitle}>Upload your meeting recording to get an AI-powered summary and action points</p>
        </div>

        {/* Upload Card */}
        <div style={styles.card}>
          <div>
            <label style={styles.label}>Upload Meeting Video</label>
            
            <input
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              id="file-upload"
              disabled={loading}
            />
            <label
              htmlFor="file-upload"
              style={{
                ...styles.uploadArea,
                ...(file ? styles.uploadAreaActive : styles.uploadAreaDefault),
                ...(loading && styles.uploadAreaDisabled)
              }}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <div style={styles.uploadContent}>
                {file ? (
                  <>
                    <CheckCircle size={48} color="#6366f1" style={{ margin: '0 auto 12px' }} />
                    <p style={styles.fileName}>{file.name}</p>
                    <p style={styles.fileSize}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </>
                ) : (
                  <>
                    <Upload size={48} color="#9ca3af" style={{ margin: '0 auto 12px' }} />
                    <p style={styles.uploadText}>Click to upload or drag and drop</p>
                    <p style={styles.uploadSubtext}>MP4, MOV, AVI or any video format</p>
                  </>
                )}
              </div>
            </label>

            <div style={styles.buttonGroup}>
              <button
                onClick={handleSubmit}
                disabled={!file || loading}
                style={{
                  ...styles.button,
                  ...((!file || loading) ? styles.buttonDisabled : styles.buttonPrimary)
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                    <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload size={20} />
                    Upload and Summarize
                  </>
                )}
              </button>
              
              {file && !loading && (
                <button onClick={handleReset} style={styles.buttonSecondary}>
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div style={styles.errorCard}>
            <AlertCircle size={24} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h3 style={styles.errorTitle}>Upload Failed</h3>
              <p style={styles.errorText}>{error}</p>
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div>
            {/* Summary Card */}
            <div style={styles.resultCard}>
              <div style={styles.resultHeader}>
                <div style={{ ...styles.resultIconContainer, ...styles.summaryIcon }}>
                  <CheckCircle size={24} color="#10b981" />
                </div>
                <h2 style={styles.resultTitle}>Summary</h2>
              </div>
              <p style={styles.resultText}>{result.summary}</p>
            </div>

            {/* Action Points Card */}
            {result.actionPoints && result.actionPoints.length > 0 && (
              <div style={styles.resultCard}>
                <div style={styles.resultHeader}>
                  <div style={{ ...styles.resultIconContainer, ...styles.actionIcon }}>
                    <CheckCircle size={24} color="#3b82f6" />
                  </div>
                  <h2 style={styles.resultTitle}>Action Points</h2>
                </div>
                <ul style={styles.actionList}>
                  {result.actionPoints.map((point, index) => (
                    <li key={index} style={styles.actionItem}>
                      <span style={styles.actionNumber}>{index + 1}</span>
                      <span style={styles.actionText}>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;