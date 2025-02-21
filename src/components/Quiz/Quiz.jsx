import React, { useState, useRef, useEffect } from "react";
import "./Quiz.css";
import { data } from "../../assets/data";
import { saveAttempt, getAttempts } from "../../utils/IndexedDB.js";
 // Import IndexedDB functions
   
const Quiz = () => {
  let [index, setIndex] = useState(0);
  let [question, setQuestion] = useState(data[index]);
  let [lock, setLock] = useState(false);
  let [score, setScore] = useState(0);
  let [result, setResult] = useState(false);
  let [timeLeft, setTimeLeft] = useState(30);
  let [inputAnswer, setInputAnswer] = useState("");
  let [attemptHistory, setAttemptHistory] = useState([]); // Store attempt history

  let Option1 = useRef(null);
  let Option2 = useRef(null);
  let Option3 = useRef(null);
  let Option4 = useRef(null);

  let option_array = [Option1, Option2, Option3, Option4];

  // Load previous attempts from IndexedDB when component mounts
  useEffect(() => {
    getAttempts().then((attempts) => {
      if (attempts) setAttemptHistory(attempts);
    });
  }, []);

  useEffect(() => {
    if (result) 
      return; // Stop the timer if the quiz is over

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === 1) {
          next();
          return 30; // Reset timer for the next question
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [index, result]);

  const checkAns = (e, ans) => {
    if (!lock) {
      if (question.ans === ans) {
        e.target.classList.add("correct");
        setScore((prev) => prev + 1);
        setLock(true); // Lock only when the correct answer is chosen
      } else {
        e.target.classList.add("wrong");
      }
    }
  };
  

  const checkIntegerAns = () => {
    if (!lock) {
      if (parseInt(inputAnswer) === question.ans) {
        setScore((prev) => prev + 1);
      }
      setLock(true);
    }
  };

  const next = () => {
    if (lock === true || timeLeft === 0) {
      if (index === data.length - 1) {
        setResult(true);
        const newAttempt = { score, time: new Date().toLocaleTimeString() };

        // Save to IndexedDB
        saveAttempt(newAttempt).then(() => {
          setAttemptHistory((prev) => [...prev, newAttempt]);
        });

        return;
      }

      setIndex((prev) => prev + 1);
      setQuestion(data[index + 1]);
      setLock(false);
      setTimeLeft(30); // Reset timer for the next question
      setInputAnswer("");
      option_array.forEach((option) => {
        if (option.current) option.current.classList.remove("wrong", "correct");
      });
    }
  };

  const reset = () => {
    setIndex(0);
    setQuestion(data[0]);
    setScore(0);
    setLock(false);
    setResult(false);
    setTimeLeft(30); // Reset timer
  };

  return (
    <div className="container">
      {/* Instructions at the top */}
      <div className="instructions">
        <h1>Sample Quiz</h1>
        <h3>Instructions:</h3>
        <p>1. For multiple-choice questions, select the one best answer (A, B, C, or D).</p>
        <p>2. For integer-type questions, write your numerical answer clearly.</p>
        <p>3. No calculators unless specified.</p>
        <p>4. You have 30 minutes to complete this quiz.</p>
      </div>

      <div className="header">
        <h1>Quiz App</h1>
        <div className="timer">{timeLeft}s</div>
      </div>

      <hr />
      {result ? (
        <>
          <h2 className="finalScore">You Scored {score} out of {data.length}</h2>
          <button onClick={reset}>Try Again</button>

          {/* Attempt History Section */}
          <div className="history">
            <h3>Attempt History</h3>
            {attemptHistory.length > 0 ? (
              <ul>
                {attemptHistory.map((attempt, i) => (
                  <li key={i}>
                    Attempt {i + 1}: {attempt.score}/{data.length} at {attempt.time}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No previous attempts.</p>
            )}
          </div>
        </>
      ) : (
        <>
          <h2>{index + 1}. {question.question}</h2>

          {/* Check if the question has multiple-choice options */}
          {question.option1 ? (
            <ul>
              <li ref={Option1} onClick={(e) => checkAns(e, 1)}>{question.option1}</li>
              <li ref={Option2} onClick={(e) => checkAns(e, 2)}>{question.option2}</li>
              <li ref={Option3} onClick={(e) => checkAns(e, 3)}>{question.option3}</li>
              <li ref={Option4} onClick={(e) => checkAns(e, 4)}>{question.option4}</li>
            </ul>
          ) : (
            <div className="integer-question">
              <input 
                type="number" 
                value={inputAnswer} 
                onChange={(e) => setInputAnswer(e.target.value)} 
                placeholder="Enter your answer"
              />
              <button onClick={checkIntegerAns}>Submit Answer</button>
            </div>
          )}

          <button onClick={next}>Next</button>
          <div className="index">{index + 1} of {data.length} questions</div>
        </>
      )}
    </div>
  );
};

export default Quiz;
