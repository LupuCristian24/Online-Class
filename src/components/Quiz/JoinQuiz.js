import React, { useEffect, useState } from 'react';
import { makeStyles } from '@mui/styles';
import { Container, Typography, Button, Checkbox, Dialog, DialogTitle, DialogContent, DialogActions, } from '@mui/material';
import { db } from '../../FireBase/Firebase';
import { collection, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { UserAuth } from "../../context/AuthContext"
import { useParams } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
  root: {
    background: '#D4F1F4',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appContainer: {
    background: '#fff',
    borderRadius: 10,
    padding: 30,
  },
  delimiter: {
    color: '#001e4d',
    borderBottom: '1px solid #333',
    paddingBottom: 13,
    marginBottom: 8,
  },
  question: {
    paddingTop: 3,
  },
  answerContainer: {
    marginTop: 20,
  },
  answerText: {
    fontSize: 18,
  },
  nextButton: {
    background: '#001e4d',
    color: '#fff',
    fontWeight: 500,
    width: 120,
    cursor: 'pointer',
  },
  previousButton: {
    backgroundColor: '#ffffff',
    color: '#222',
    fontWeight: 500,
  },
  timer: {
    marginLeft: '10rem',
    marginTop: '0.5rem',
  },
  redTimer: {
    color: 'red',
  },
}));

const JoinQuiz = () => {
  const classes = useStyles();
  const { user } = UserAuth()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState(-1);
  const [timer, setTimer] = useState();
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [quizData, setQuizData] = useState(null);

  const [liveCheckbox, setLiveCheckbox] = useState([]);
  const quizId = useParams().quizId;

  useEffect(() => {
    const fetchQuizData = async () => {  
      const quizRef = doc(db, 'Quizzes', quizId);
      const snapshot = await getDoc(quizRef);
      const quizData = snapshot.data();
      if (quizData) {
        const updatedQuestions = quizData.questions.map((question, index) => ({
          ...question,
          id: `question_${index + 1}`, // Assigning unique IDs based on the index
        }));
        setQuizData(quizData);
        setQuestions(updatedQuestions);
        setUserAnswers(new Array(quizData.questions.length).fill(-1));
        setTimer(quizData.timer || 0);
        //! Create at quiz start a doc with empty fields for answers 
        try { 
          const pathRef = collection(db, `Results-Temp/${quizId}/results`); 
          await setDoc(doc(pathRef, `${user.email}`), {
            score: 0,
            timeTaken: "-1", 
            player: user.email,
            answered_questions: quizData.questions.map((_, count) => ({
              answer_index: -1,
              isCorrect: false,
              question_id: count,
            })),
          });
        } catch (error) {
          console.error('Error initializing quiz answer database for user:', error);
        }
      }
    };
    fetchQuizData();
  }, []);

  useEffect(() => {
    if (quizData) {
      const initialUserAnswers = Array(quizData.questions.length).fill(-1);
      setUserAnswers(initialUserAnswers);
    }
  }, [quizData]);

  useEffect(() => {
    let timerId;
    if (!isSubmitted && timer === 0) { // Only submit the quiz when the timer reaches 0 and it's not already submitted
      setUserAnswers((answers) => {
        handleQuizSubmission(answers); // Automatically submit quiz when the timer reaches 0
        return answers;
      });
    } else if (!isSubmitted) {
      timerId = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer === 0) {
            clearInterval(timerId);
            setUserAnswers((answers) => {
              handleQuizSubmission(answers); // Automatically submit quiz when the timer reaches 0
              return answers;
            });
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerId); // Clear the timer when the component unmounts or the quiz is submitted
  }, [isSubmitted, timer]);
  
  const handleNextQuestion = () => {
    const nextQuestionIndex = currentQuestionIndex + 1;
    if (nextQuestionIndex < questions.length) {
      setCurrentQuestionIndex(nextQuestionIndex);
      setSelectedAnswerIndex(-1); // Reset selected answer
    } else {
      handleQuizSubmission();
    }
    saveLiveProgress();
  };

  const handlePreviousQuestion = () => {
    const previousQuestionIndex = currentQuestionIndex - 1;
    if (previousQuestionIndex >= 0) {
      setCurrentQuestionIndex(previousQuestionIndex);
    }
    saveLiveProgress();
  };

  const handleQuizSubmission = async (answers = userAnswers) => {
    let totalScore = 0;
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      const userAnswerIndex = answers[i];
      const correctAnswerIndex = question.answer;
      if (userAnswerIndex === correctAnswerIndex) {
        totalScore += 1;
      }
    }
    const scorePercentage = (totalScore / questions.length) * 100;
    const message = `Quiz submitted! Score: ${totalScore}/${questions.length} (${scorePercentage}%)`;
    setShowDialog(true);
    setDialogMessage(message);
    setIsSubmitted(true);
    const initialTimer = quizData.timer || 0;
    const timeTaken = formatTime(initialTimer - timer);
    try { 
      const userRef = collection(db, `Results-Temp/${quizId}/results`); 
      await updateDoc(doc(userRef, `${user.email}`), {
        timeTaken: timeTaken,
        score: totalScore
      });
    } catch (error) {
      console.error('Error update quiz time:', error);
    }
  };

  const RealTimeMonitor = async (index, correct) => {
    if (!isSubmitted) {               
      setSelectedAnswerIndex(index);
      const updatedUserAnswers = [...userAnswers];
      updatedUserAnswers[currentQuestionIndex] = index;
      setUserAnswers(updatedUserAnswers);
      if (correct) {
        setScore(score + 1);
      }
      try {
        const snapshot = await getDoc(doc(db, 'Results-Temp', quizId, 'results', user.email));
        const fetchData = snapshot.data();
        const updatedArray = fetchData.answered_questions.map((tempIndex) => {
          if (tempIndex.question_id === currentQuestionIndex) {
            tempIndex.answer_index = index; 
            tempIndex.isCorrect = correct;
          }
          return tempIndex;
        });
        setLiveCheckbox(updatedArray);
      } catch (error) {
        console.error('Error seting new array:', error);
      }
    }
  };

  const saveLiveProgress = async () => {
    try {
      await updateDoc(doc(db, `Results-Temp/${quizId}/results/${user.email}`), {  
        answered_questions: liveCheckbox,
        //score: score,
        player: user.email,
      });
    } catch (error) {
      console.error("saveLiveProgress function: ", error);
    }
  }
  
  useEffect(() => {
    // Update the selected answer index when the current question changes
    if (currentQuestionIndex >= 0) {
      setSelectedAnswerIndex(userAnswers[currentQuestionIndex]);
    }
  }, [currentQuestionIndex, userAnswers]);  

  const handleDialogClose = () => {
    setShowDialog(false);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secondsRemaining = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secondsRemaining.toString().padStart(2, '0')}`;
  };

  const currentQuestion = quizData && quizData.questions[currentQuestionIndex];

  return (
    <div className={classes.root}>
      <Container className={classes.appContainer} maxWidth="lg">
        <div className={classes.quiz}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" component="h1">
              {quizData && quizData.title}
            </Typography>
            <Typography
              variant="h6"
              className={`${classes.timer} ${timer <= 120 && !isSubmitted ? classes.redTimer : ''}`}
            >
              Timer: {formatTime(timer)}
            </Typography>
          </div>
          <div className={classes.delimiter}></div>
          <Typography variant="h4" className={classes.question}>
            {currentQuestion && currentQuestion.question}
          </Typography>
          {//TODO: Checkbox Stuff: line 327
          }
          <div className={classes.answerContainer}>
            {currentQuestion?.options && currentQuestion.options.map((option, index) => (
              <div key={index} className={classes.answerText}>
                <Checkbox
                  className={classes.answerCheckbox}
                  checked={selectedAnswerIndex === index}
                  onChange={() => RealTimeMonitor(index, index === currentQuestion.answer)/*handleAnswerSelect*/}
                  disabled={isSubmitted} // Disable checkboxes when quiz is submitted
                />
                {String.fromCharCode(97 + index)})&nbsp; {option}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            {currentQuestionIndex > 0 && (
              <Button
                sx={{ marginTop: '0.3rem', marginBottom: '0.3rem', marginRight: '1rem' }}
                style={{ backgroundColor: '#ffffff', color: '#222', fontWeight: 500 }}
                className={classes.previousButton}
                variant="contained"
                onClick={handlePreviousQuestion}
                disabled={isSubmitted}
              >
                Previous
              </Button>
            )}
            <Button
              sx={{ marginTop: '0.3rem', marginBottom: '0.3rem', marginLeft: '4rem' }}
              style={{ backgroundColor: '#4c9deb' }}
              className={classes.nextButton}
              variant="contained"
              color="primary"
              id={currentQuestionIndex === questions.length - 1 ? 'Submit-btn' : 'Next-btn'}
              onClick={handleNextQuestion}
              disabled={selectedAnswerIndex === -1 || isSubmitted} // Disable button when quiz is submitted
            >
              {currentQuestionIndex === questions.length - 1 ? 'Submit' : 'Next'}
            </Button>
            <Dialog open={showDialog} onClose={handleDialogClose}>
              <DialogTitle>Quiz Results</DialogTitle>
              <DialogContent className={classes.dialogContent}>
                <Typography variant="h6" gutterBottom>
                  {dialogMessage}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Thank you for taking the quiz!
                </Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleDialogClose} color="primary" variant="contained">
                  Close
                </Button>
              </DialogActions>
            </Dialog>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default JoinQuiz;