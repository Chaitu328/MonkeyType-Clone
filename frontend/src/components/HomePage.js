import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

// A simple sentence library for demonstration.
const sentenceLibrary = {
  words: "The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs!",
  numbers: "1234567890 0987654321 1122334455 5566778899.",
  punctuation: "Hello, world! How's everything? Amazing, right?"
};

const getSentence = (type) => {
  return sentenceLibrary[type] || sentenceLibrary.words;
};

const HomePage = ({ user }) => {
  const [sentenceType, setSentenceType] = useState('words');
  const [text, setText] = useState(getSentence('words'));
  const [typed, setTyped] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);
  const [timerRunning, setTimerRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(30); // 15 or 30 seconds
  const latestTypedRef = useRef('');


  // States for keystroke tracking and word durations.
  const keystrokesRef = useRef([]);
  const typingDurationsRef = useRef([]);

  // const [errorWords, setErrorWords] = useState([]);

  // Refs for timer and timing.
  const inputRef = useRef(null);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const currentWordStartRef = useRef(null);
  const lastKeyTimeRef = useRef(null);

  // resetTest wrapped in useCallback for stability.
  const resetTest = useCallback((duration = selectedDuration) => {
    clearInterval(intervalRef.current);
    setTyped('');
    setTimeLeft(duration);
    setTimerRunning(false);
    setResults(null);

    // Clear keystroke and duration refs
    keystrokesRef.current = [];
    typingDurationsRef.current = [];
}, [selectedDuration]);


  useEffect(() => {
    setText(getSentence(sentenceType));
    resetTest();
  }, [sentenceType, resetTest]);

  const startTest = () => {
    if (timerRunning) return;
    setTimerRunning(true);
    
    startTimeRef.current = Date.now();
    currentWordStartRef.current = Date.now();
    lastKeyTimeRef.current = Date.now();
    inputRef.current.focus();

    intervalRef.current = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(intervalRef.current);
          setTimerRunning(false);
          calculateResults();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  // Use only onKeyDown to capture keys and update typed state.
  const handleKeyDown = (e) => {
    if (!user) return; // Only allow typing if logged in.
    if (e.key.length !== 1 && e.key !== 'Backspace') return;
  
    if (!timerRunning) {
      startTest();
    }
  
    const now = Date.now();
    const latency = now - lastKeyTimeRef.current;
    lastKeyTimeRef.current = now;
  
    // Handle Backspace: update typed and keystrokes accordingly.
    if (e.key === 'Backspace') {
      setTyped(prev => prev.slice(0, -1));
      keystrokesRef.current.pop(); // Remove last keystroke manually from the ref
      return;
    }
  
    // Use functional update to ensure we have the latest typed value.
    setTyped(prevTyped => {
      const updatedTyped = prevTyped + e.key;
      latestTypedRef.current = updatedTyped;
      const expectedChar = text[prevTyped.length] || '';
      const isCorrect = e.key === expectedChar;
  
      // Record the keystroke.
      const newKeystroke = {
        char: expectedChar,
        typedChar: e.key,
        correct: isCorrect,
        timestamp: now,
        latency
      };
      keystrokesRef.current.push(newKeystroke);
  
      // Record word duration when space is pressed.
      if (e.key === ' ') {
        const wordDuration = now - currentWordStartRef.current;
        typingDurationsRef.current.push(wordDuration);
        currentWordStartRef.current = now;
      }
  
      // If updated text equals expected text, finish test.
      if (updatedTyped === text) {
        clearInterval(intervalRef.current);
        setTimerRunning(false);
        calculateResults(updatedTyped);
      }
  
      return updatedTyped;
    });
  };
  

  // Calculate results using the final typed text.
  const calculateResults = async (finalTypedParam) => {
    const finalTyped = finalTypedParam || latestTypedRef.current;
    const totalTyped = finalTyped.length;
    let correctChars = 0;
    for (let i = 0; i < totalTyped; i++) {
      if (finalTyped[i] === text[i]) {
        correctChars++;
      }
    }
    const accuracy = totalTyped > 0 ? Math.round((correctChars / totalTyped) * 100) : 0;
    const elapsedTime = startTimeRef.current ? Date.now() - startTimeRef.current : selectedDuration;
    const minutes = elapsedTime / 60000;
    const wpm = minutes > 0 ? Math.round((totalTyped / 5) / minutes) : 0;
    const totalErrors = totalTyped - correctChars;
  
    const errorWords = text.split(' ').filter((word, idx) => {
      const typedWords = finalTyped.split(' ');
      return typedWords[idx] !== word;
    });
  
    const sessionData = {
      wpm,
      accuracy,
      totalErrors,
      errorWords,
      typingDurations: typingDurationsRef.current, // using ref values
      keystrokes: keystrokesRef.current,             // using ref values
      text
    };
  
    console.log("Calculated session data:", sessionData);
    axios.defaults.baseURL = 'https://monkeytype-c21i.onrender.com';
    if (user) {
      try {
        const response = await axios.post('/api/sessions', sessionData, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        console.log("POST successful, response:", response.data);
      } catch (error) {
        console.error("Failed to save session:", error);
      }
    }
    setResults({ wpm, accuracy, totalErrors });
  };
  
  

  const handleDurationChange = (e) => {
    const duration = parseInt(e.target.value, 10);
    setSelectedDuration(duration);
    setTimeLeft(duration);
    resetTest(duration);
  };

  return (
    <div className="container">
      <div className="options">
        <label>
          Sentence Type:
          <select value={sentenceType} onChange={e => setSentenceType(e.target.value)}>
            <option value="words">Words</option>
            <option value="numbers">Numbers</option>
            <option value="punctuation">Punctuation</option>
          </select>
        </label>
        <label>
          Duration:
          <select value={selectedDuration} onChange={handleDurationChange}>
            <option value={15}>15s</option>
            <option value={30}>30s</option>
          </select>
        </label>
      </div>
      {!user ? (
        <div className="notice">
          <p>Please <Link to="/login">login</Link> or <Link to="/signup">sign up</Link> to start the typing test.</p>
        </div>
      ) : results === null ? (
        <div>
          <div className="timer">{timeLeft}s remaining</div>
          <div className="textDisplay" onClick={() => inputRef.current.focus()}>
            {text.split('').map((char, index) => {
              let color = '#666';
              if (index < typed.length) {
                color = typed[index] === char ? '#4CAF50' : '#F44336';
              }
              return <span key={index} style={{ color }}>{char}</span>;
            })}
          </div>
          <textarea
            ref={inputRef}
            value={typed}
            onKeyDown={handleKeyDown}
            className="typingInput"
            placeholder="Start typing here..."
          />
        </div>
      ) : (
        <div className="results">
          <h2>Results</h2>
          <p>WPM: {results.wpm}</p>
          <p>Accuracy: {results.accuracy}%</p>
          <p>Total Errors: {results.totalErrors}</p>
          <button className="button" onClick={() => resetTest()}>Try Again</button>
        </div>
      )}
    </div>
  );
};

export default HomePage;
