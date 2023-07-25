import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import { Button, TextField, Box, Container, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../FireBase/Firebase';

const CreateQuiz = () => {
  const [quizTitle, setQuizTitle] = useState('');
  const [quizQuestions, setQuizQuestions] = useState([{ question: '', options: ['', ''], answer: '' }]);
  const [answerOptions, setAnswerOptions] = useState([2]);
  const [timer, setTimer] = useState('');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [quizId, setQuizId] = useState('');

  const addQuestion = () => {
    setQuizQuestions([...quizQuestions, { question: '', options: ['', ''], answer: '' }]);
  };

  const handleQuestionChange = (index, e) => {
    const newQuestions = [...quizQuestions];
    newQuestions[index].question = e.target.value;
    setQuizQuestions(newQuestions);
  };

  const addOption = (questionIndex) => {
    const newQuestions = [...quizQuestions];
    newQuestions[questionIndex].options.push('');
    setQuizQuestions(newQuestions);
    const newAnswerOptions = [...answerOptions];
    newAnswerOptions[questionIndex] += 1;
    setAnswerOptions(newAnswerOptions);
  };

  const removeOption = (questionIndex) => {
    const newQuestions = [...quizQuestions];
    newQuestions[questionIndex].options.pop();
    setQuizQuestions(newQuestions);
    const newAnswerOptions = [...answerOptions];
    newAnswerOptions[questionIndex] -= 1;
    setAnswerOptions(newAnswerOptions);
  };

  const handleOptionChange = (questionIndex, optionIndex, e) => {
    const newQuestions = [...quizQuestions];
    newQuestions[questionIndex].options[optionIndex] = e.target.value;
    setQuizQuestions(newQuestions);
  };

  const handleAnswerChange = (index, e) => {
    const newQuestions = [...quizQuestions];
    newQuestions[index].answer = e.target.value;
    setQuizQuestions(newQuestions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const quizRef = collection(db, 'Quizzes');
    const docRef = await addDoc(quizRef, {
      title: quizTitle,
      questions: quizQuestions,
      timer: timer,
    });
    setQuizId(docRef.id);
    setDialogOpen(true);
    setQuizTitle('');
    setQuizQuestions([{ question: '', options: ['', '',], answer: '' }]);
    setTimer('');
  };

  const handleTimerChange = (e) => {
    setTimer(e.target.value);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };  

  return (
    <Box
      sx={{
        background: '#e1eff6',
        display: 'flex',
      }}
    >
    <Container component="main" maxWidth='md'>
      <Box
        sx={{
          backgroundColor: '#fff',
          boxShadow: 3,
          borderRadius: 3,
          marginTop: 7,
          marginBottom: 7,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Box sx={{ padding: '1rem' }}>
        <div style={{ marginTop: '1.5rem',textAlign: 'center' }}>
          <h2>Create Quiz</h2>
        </div>
          <form onSubmit={handleSubmit}>
            <Box sx={{ 
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <FormControl sx={{ marginTop: '1rem', marginBottom: '2rem', marginLeft: '3rem' }} >
                <TextField
                  type="text"
                  label="Quiz Title:"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  sx={{ width: '450px', margin: '0 auto' }}
                  required
                />
              </FormControl>
              {quizQuestions.map((question, index) => (
                <div key={index}>
                  <FormControl sx={{ marginBottom: '1rem' }}>
                    <TextField
                      type="text"
                      label={question.question ? '' : `Question ${index + 1}:`}
                      multiline
                      value={question.question}
                      onChange={(e) => handleQuestionChange(index, e)}
                      sx={{ width: '700px', marginTop: '0.7rem'  }}
                      required
                    />
                  </FormControl>
                  <br />
                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex}>
                      <FormControl sx={{ marginBottom: '1rem', marginLeft: '4rem' }}>
                        <TextField
                          type="text"
                          label={option ? '' : `Option ${optionIndex + 1}:`}
                          multiline
                          value={option}
                          onChange={(e) => handleOptionChange(index, optionIndex, e)}
                          sx={{ width: '500px' }}
                          required
                        />
                      </FormControl>
                      {optionIndex >= 2 && optionIndex === question.options.length - 1 && (
                        <Button  
                          sx={{ marginLeft: '1rem', marginTop: '0.8rem' }}
                          size="small" 
                          variant="contained"
                          startIcon={<DeleteIcon />} 
                          onClick={() => removeOption(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button  
                    sx={{ marginBottom: '1rem', marginLeft: '4rem' }} 
                    size="small" 
                    variant="contained" 
                    onClick={() => addOption(index)}
                  >
                    Add Option
                  </Button>
                  <br />
                  <FormControl sx={{ marginBottom: '1rem', width: '6.5rem' }}>
                    <InputLabel>Answer:</InputLabel>
                    <Select value={question.answer} onChange={(e) => handleAnswerChange(index, e)} required>
                      {question.options.map((option, optionIndex) => (
                        <MenuItem key={optionIndex} value={optionIndex}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <hr />
                </div>
              ))}
              <Button variant="contained" type="button" onClick={addQuestion} sx={{ marginTop: '1rem', marginBottom: '1.7rem' }}>
                Add Question
              </Button>
              <FormControl >
                <TextField
                  type="number"
                  label="Time (in seconds):"
                  value={timer}
                  onChange={handleTimerChange}
                  sx={{ width: '200px' }}
                  required
                />
              </FormControl>
              <br />
              <br />
              <Button 
                variant="contained"
                type="submit" 
                endIcon={<SendIcon />}
                // disabled={!quizTitle || quizQuestions.some(question => !question.question || question.options.some(option => !option) ||
                //            question.answer === null || question.answer === undefined) || !timer}
              >
                Submit Quiz
              </Button>
            </Box>
          </form>
        </Box>
      </Box>
    </Container>
    <Dialog open={dialogOpen} onClose={handleCloseDialog}>
      <DialogTitle>Quiz Created</DialogTitle>
      <DialogContent sx={{ marginLeft: '0.5rem', marginRight: '0.6rem', marginTop: '0.3rem' }}>
        <p>
          Quiz ID:{' '}
          <span style={{ color: 'green', fontWeight: 'bold', fontSize: '1.2rem', padding: '0.3rem', borderRadius: '3px' }}>{quizId}</span>
        </p>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseDialog}>Close</Button>
      </DialogActions>
    </Dialog>
    </Box>
  );
};

export default CreateQuiz;
