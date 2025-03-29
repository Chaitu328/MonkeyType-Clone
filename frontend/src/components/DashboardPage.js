import React, { useState, useEffect } from 'react';
import axios from 'axios';

axios.defaults.baseURL = 'https://monkeytype-c21i.onrender.com';

const DashboardPage = () => {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null); // store entire session object
  const [analysis, setAnalysis] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch sessions on mount.
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const { data } = await axios.get('/api/sessions', {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        console.log("Fetched sessions:", data.sessions);
        setSessions(data.sessions);
      } catch (error) {
        console.error("Error fetching sessions:", error.response?.data || error.message);
      }
    };
    fetchSessions();
  }, []);

  // Fetch analysis data for a given session id.
  const fetchAnalysis = async (sessionId) => {
    try {
      const { data } = await axios.get(`/api/analysis/${sessionId}?t=${Date.now()}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      console.log("Fetched analysis for session", sessionId, ":", data);
      setAnalysis(data);
    } catch (error) {
      console.error("Error fetching analysis:", error.response?.data || error.message);
    }
  };

  // Compute common errors for the session locally from its keystrokes.
  const computeCommonErrors = (keystrokes = []) => {
    const errorMap = {};
    keystrokes.forEach(k => {
      if (!k.correct) {
        const key = `${k.char}->${k.typedChar}`;
        if (!errorMap[key]) {
          errorMap[key] = { expected: k.char, actual: k.typedChar, count: 0, totalLatency: 0 };
        }
        errorMap[key].count++;
        errorMap[key].totalLatency += k.latency;
      }
    });
    return Object.keys(errorMap).map(key => ({
      ...errorMap[key],
      avgDelay: Math.round(errorMap[key].totalLatency / errorMap[key].count)
    }));
  };

  // When a session card is clicked, set the session, fetch analysis, and show modal.
  const handleSessionClick = (sessionId) => {
    const session = sessions.find(s => s._id === sessionId);
    if (!session) return;
    setSelectedSession(session);
    fetchAnalysis(sessionId);
    setShowModal(true);
  };

  // Close the modal and clear analysis and selected session.
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedSession(null);
    setAnalysis(null);
  };

  // Inline CSS styles.
  const styles = {
    container: {
      maxWidth: '800px',
      margin: '20px auto',
      padding: '20px',
      color: 'white',
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif'
    },
    sessionList: {
      display: 'grid',
      gap: '20px',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))'
    },
    sessionCard: {
      backgroundColor: '#2a2a2a',
      padding: '15px',
      borderRadius: '8px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
      cursor: 'pointer',
      transition: 'transform 0.3s ease',
      textAlign: 'left'
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    },
    modalContent: {
      backgroundColor: '#1a1a1a',
      padding: '30px',
      borderRadius: '10px',
      maxWidth: '600px',
      width: '100%',
      color: 'white',
      position: 'relative',
      maxHeight: '80vh',
      overflowY: 'auto',
      animation: 'fadeIn 0.3s ease'
    },
    closeButton: {
      position: 'absolute',
      top: '10px',
      right: '10px',
      backgroundColor: '#fd4',
      border: 'none',
      borderRadius: '4px',
      padding: '5px 10px',
      cursor: 'pointer',
      fontSize: '14px'
    },
    analysisSection: {
      marginTop: '20px',
      textAlign: 'left'
    },
    commonErrorsSection: {
      marginTop: '20px',
      textAlign: 'left',
      backgroundColor: '#333',
      padding: '10px',
      borderRadius: '6px'
    },
    title: {
      marginBottom: '15px',
      fontSize: '24px'
    },
    text: {
      margin: '5px 0',
      fontSize: '16px'
    },
    subText: {
      fontSize: '14px',
      color: '#ddd'
    }
  };

  // Compute common errors from selected session keystrokes.
  const sessionCommonErrors = selectedSession ? computeCommonErrors(selectedSession.keystrokes) : [];

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Your Sessions</h2>
      {sessions.length > 0 ? (
        <div style={styles.sessionList}>
          {sessions.map(session => (
            <div 
              key={session._id} 
              style={styles.sessionCard}
              onClick={() => handleSessionClick(session._id)}
              onMouseOver={e => e.currentTarget.style.transform = 'scale(1.03)'}
              onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <p style={styles.text}><strong>WPM:</strong> {session.wpm}</p>
              <p style={styles.text}><strong>Accuracy:</strong> {session.accuracy}%</p>
              <small style={styles.subText}>{new Date(session.createdAt).toLocaleDateString()}</small>
            </div>
          ))}
        </div>
      ) : (
        <p>Loading session data...</p>
      )}
      
      {showModal && analysis && selectedSession && (
        <div style={styles.modalOverlay} onClick={handleCloseModal}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button style={styles.closeButton} onClick={handleCloseModal}>Close</button>
            <h3 style={{ ...styles.title, fontSize: '20px', marginBottom: '10px' }}>Typing Analysis</h3>
            <div style={styles.analysisSection}>
              <p style={styles.text}><strong>Impulsivity:</strong> {analysis.impulsivity}</p>
              <p style={styles.text}><strong>Cognitive Load:</strong> {analysis.cognitiveLoad}</p>
              <p style={styles.text}><strong>Resilience:</strong> {analysis.resilience}</p>
              <h4 style={{ fontSize: '18px', marginTop: '10px' }}>Metrics</h4>
              <p style={styles.text}><strong>Avg Speed:</strong> {analysis.metrics.avgSpeed} ms</p>
              <p style={styles.text}><strong>Error Rate:</strong> {analysis.metrics.errorRate}</p>
              <p style={styles.text}><strong>Error Recovery:</strong> {analysis.metrics.errorRecovery} ms</p>
            </div>
            {sessionCommonErrors && sessionCommonErrors.length > 0 && (
              <div style={styles.commonErrorsSection}>
                <h4 style={{ fontSize: '18px', marginBottom: '10px' }}>Common Errors (Session-Specific)</h4>
                {sessionCommonErrors.map((error, index) => (
                  <div key={index} style={{ marginBottom: '5px' }}>
                    <p style={styles.text}><strong>Expected:</strong> {error.expected}, <strong>Actual:</strong> {error.actual} (Count: {error.count}, Avg Delay: {error.avgDelay} ms)</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
