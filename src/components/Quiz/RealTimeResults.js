import React, { useEffect, useState } from 'react';
import { makeStyles } from '@mui/styles';
import { Button, Container, Typography } from '@mui/material';
import { TableContainer, Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material';
import { db } from '../../FireBase/Firebase';
import { collection, doc, getDoc, onSnapshot, } from 'firebase/firestore';
import { useParams } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
  root: {
    background: '#e1eff6',
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
  button: {
    width: 20,
    height: 40,
    borderRadius: 0,
  },
}));

const QuizResults = () => {
  const classes = useStyles();
  const [quizData, setQuizData] = useState(null);
  const [quizResults, setQuizResults] = useState([]);
  const [quizStat, setQuizStat] = useState([]);
  const quizId = useParams().quizId;

  useEffect(() => {
    const fetchQuizData = async () => {             
      const quizRef = doc(db, 'Quizzes', quizId);
      const snapshot = await getDoc(quizRef);
      const quizData = snapshot.data();
      if (quizData) {
        setQuizData(quizData);
      }
    };
    fetchQuizData();
  }, []);

  useEffect(() => {
    const quizResultsRef = collection(db, `Results-Temp/${quizId}/results`);
    const unsubscribe = onSnapshot(quizResultsRef, (snapshot) => {
      const resultsData = snapshot.docs.map((doc) => doc.data());
      setQuizResults(resultsData);
      console.log("quizResults: ",resultsData);
    });
  
    return () => {
      unsubscribe();
    };
  }, []);

  const handleResetAnswers = () => {
    setQuizStat([]);
    setQuizResults((prevResults) => [
      {
        ...prevResults[0],
        score: 0,
        timeTaken:'0:00',
        player: '' 
      },
    ]);
  };

  return (
    <div className={classes.root}>
      <Container className={classes.appContainer} maxWidth="lg">
        <div style={{ marginBottom: '3.3rem', marginTop: '1.5rem', textAlign: 'center' }}>
          <h2>{quizData?.title}</h2>
        </div>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                {quizData &&
                  quizData?.questions &&
                  quizData.questions.map((_, index) => (
                    <TableCell key={index}>{quizData.questions[index].question}</TableCell>
                  ))}
                <TableCell>Time taken</TableCell>
                <TableCell>Score</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {quizResults.map((user_answers, index) => (
                <TableRow key={index}>
                  <TableCell>{user_answers.player}</TableCell>
                  {user_answers.answered_questions.map((questionAnswer, answerId) => {
                    let backgroundColor;
                    const isAnswered = questionAnswer.answer_index === -1;
                    if (isAnswered) {
                      backgroundColor = 'transparent';
                    } else {
                      backgroundColor = questionAnswer.isCorrect ? '#88ff88' : '#ff8888';
                    }
                    return (
                      <TableCell key={answerId+1}>
                        <div>
                            <Typography
                              key={questionAnswer.question_id}
                              variant="body2"
                              style={{
                                backgroundColor: backgroundColor,
                              }}
                            >
                              {!isAnswered 
                                ? quizData.questions[questionAnswer.question_id].options[questionAnswer.answer_index] 
                                : ''}
                            </Typography>
                        </div>
                      </TableCell>
                  );
                  })
                  }
                  <TableCell>
                    {
                      user_answers.timeTaken === "-1"
                        ? ""
                        : user_answers.timeTaken
                    }
                  </TableCell>
                  <TableCell>
                    {user_answers.score}/{quizData.questions.length}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {/* <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
          <Button sx={{ marginTop: '2rem', marginBottom: '0.6rem' }} variant="contained" onClick={handleResetAnswers}>
            Reset Answers
          </Button>
        </div> */}
      </Container>
    </div>
  );
};

export default QuizResults;