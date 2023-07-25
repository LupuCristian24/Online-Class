import { Box, Button, Container, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, TextField } from "@mui/material"
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import React, { useState, useEffect } from "react"
import { db, storage } from "../../FireBase/Firebase"
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"
import { collection, addDoc, doc, serverTimestamp, getDoc } from "firebase/firestore"
import { UserAuth } from "../../context/AuthContext"
import "./Class.css"
import { FileIcon, defaultStyles } from 'react-file-icon';
import { useNavigate } from "react-router-dom";
import { BsFileEarmarkText } from 'react-icons/bs';

const Class = ({ Data }) => {
  const { user } = UserAuth()
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);
  const [joinQuizDialogOpen, setJoinQuizDialogOpen] = useState(false);
  const [quizId, setQuizId] = useState("");
  const [quizData, setQuizData] = useState(null);
  const [showCustomButton, setShowCustomButton] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [elements, setElements] = useState([]);
  const [sectionTitle, setSectionTitle] = useState("Section");
  const [sections, setSections] = useState([
    {
      title: sectionTitle,
      elements: elements,
      showCustomButton: false,
    },
  ]);

  useEffect(() => {
    const fetchQuizData = async () => {
      const quizRef = doc(db, 'Quizzes', quizId);
      const snapshot = await getDoc(quizRef);
      const quizData = snapshot.data();

      if (quizData) {
        setQuizData(quizData);
      }
    };
    
    if (quizId) {
      fetchQuizData();
    }
  }, [quizId]);

  const renderFileIcon = (file, index) => {
    const { type } = file;
    const fileType = type.split("/")[1];
  
    const handleFileDownload = () => {
      const downloadLink = document.createElement("a");
      downloadLink.href = URL.createObjectURL(file);
      downloadLink.download = file.name;
      downloadLink.click();
    };

    switch (fileType) {
      case "pdf":
        return( 
          <div style={{width:"21px", height:"21px", cursor: "pointer" }}  onClick={handleFileDownload}>
            <FileIcon extension={fileType} {...defaultStyles.pdf} />
          </div>
        )
      case "msword":
      case "doc":
      case "docx":
      case "vnd.openxmlformats-officedocument.wordprocessingml.document":
        return( 
          <div style={{width:"21px", height:"21px", cursor: "pointer" }}  onClick={handleFileDownload}>
            <FileIcon extension={"doc"} {...defaultStyles.docx} />
          </div>
        )
      case "vnd.ms-excel":
      case "vnd.openxmlformats-officedocument.spreadsheetml.sheet":
        return( 
          <div style={{width:"21px", height:"21px", cursor: "pointer" }}  onClick={handleFileDownload}>
             <FileIcon extension={"xlsx"} {...defaultStyles.xlsx} />
          </div>
        )
      case "ppt":
      case "vnd.ms-powerpoint":
      case "vnd.openxmlformats-officedocument.presentationml.presentation":
        return (
          <div style={{ width: "21px", height: "21px", cursor: "pointer" }}  onClick={handleFileDownload}>
            <FileIcon extension={"ppt"} {...defaultStyles.pptx} />
          </div>
        );
      case "plain":
      case "text":
        return (
          <div style={{ width: "21px", height: "21px", cursor: "pointer" }}  onClick={handleFileDownload}>
            <FileIcon extension={"txt"} {...defaultStyles.txt} />
          </div>
        );
      case "jpeg":
      case "png":
      case "gif":
      case "svg+xml":
        return( 
          <div style={{width:"21px", height:"21px", cursor: "pointer" }}  onClick={handleFileDownload}>
           <FileIcon extension={fileType} {...defaultStyles.img} />
          </div>
        )
      default:
        return (
          <div style={{ width: "21px", height: "21px", cursor: "pointer" }}  onClick={handleFileDownload}>
            <FileIcon extension={"file"} {...defaultStyles.file} />
          </div>
        );
    }
  };
  
  const handleDelete = (sectionIndex, index) => {
    const updatedSections = [...sections];
    const elements = updatedSections[sectionIndex].elements;
    elements.splice(index, 1);
    setSections(updatedSections);
  };

  const handleFileChange = (sectionIndex, e) => {
    const files = e.target.files;
    const newElements = [...sections[sectionIndex].elements];
  
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const newElement = {
        id: newElements.length + i,
        file: file,
        inputValue: file.name,
      };
      newElements.push(newElement);
    }
  
    const updatedSections = [...sections];
    updatedSections[sectionIndex].elements = newElements;
    setSections(updatedSections);
  };

  const handleNewSection = () => {
    const newSection = {
      delimiter: true,
      title: sectionTitle,
      elements: elements
    };
    setSections(prevSections => [...prevSections, newSection]);
    setSectionTitle("Section");
    setElements([]);
    setEditMode(false);
  };

  const updateSectionTitle = (sectionIndex, newTitle) => {
    setSections(prevSections => {
      const updatedSections = [...prevSections];
      updatedSections[sectionIndex] = {
        ...updatedSections[sectionIndex],
        title: newTitle
      };
      return updatedSections;
    });
  };
  
  const handleFileClick = (file) => {
    const { type } = file;
    const fileType = type.split("/")[1];
    
    if (fileType === "pdf") {
      window.open(URL.createObjectURL(file), "_blank");
    } else {
      const downloadLink = document.createElement("a");
      downloadLink.href = URL.createObjectURL(file);
      downloadLink.download = file.name;
      downloadLink.click();
    }
  };

  // const handleJoinQuiz = () => {
  //   setJoinQuizDialogOpen(true);  
  // };
  const handleJoinQuiz = (sectionIndex) => {
    setJoinQuizDialogOpen(true);
    setSections((prevSections) => {
      const updatedSections = [...prevSections];
      updatedSections[sectionIndex] = {
        ...updatedSections[sectionIndex],
        showCustomButton: true
      };
      return updatedSections;
    });
  };

  const handleCustomButtonDelete = () => {
    setShowCustomButton(false);
  };

  const handleUpload = async () => {
    const promises = elements.map((element) => {
      const { file } = element;
      const uploadTask = uploadBytesResumable(ref(storage, `File/${file.name}`), file);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          () => {},
          (error) => {
            reject(error);
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref)
              .then((url) => {
                addDoc(collection(doc(db, "Announcements", "Classes"), Data.id), {
                  timestamp: serverTimestamp(),
                  fileUrl: url,
                  fileName: file.name,
                  sender: user.email,
                })
                .then(() => {
                  resolve();
                })
                .catch((error) => {
                  reject(error);
                });
              })
              .catch((error) => {
                reject(error);
              });
          }
        );
      });
    });

    try {
      await Promise.all(promises);
      console.log("Files uploaded successfully");
    } catch (error) {
      console.log("Error uploading files:", error);
    }
  };

   // iiLd3ZUp3EFYAfZxg1RS

  return (
    <div className="Class">
      <div className="Class_Section">
        <div className="Class_Content">
          <div className="Class_Section1">
            <div className="Class_BgImage">
            </div>
            <div className="Class_Text">
              <h1 className="Class_Heading">
                {Data.className}
              </h1>
              <div className="Class_Under">
              {Data.subject} {Data.room}
              </div>
              <div className="Class_Id">
                Class Code : {Data.id}
              </div>
            </div>
          </div>
        </div>
        <div className="Class_Announce">
          <Container component="main" maxWidth='lg'>
              <Box
                sx={{
                  boxShadow: 3,
                  borderRadius: 3,
                  marginTop: 1,
                  marginBottom: 5,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                {sections.map((section, sectionIndex) => (
                  <div key={sectionIndex} style={{ margin: "1rem" }}>
                    {section.delimiter && <hr/>}
                    {editMode ? (
                      <div style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem" }}>
                        <input
                          type="text"
                          value={section.title}
                          onChange={(e) => updateSectionTitle(sectionIndex, e.target.value)}
                          style={{ marginRight: "0.5rem" }}
                        />
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          onClick={() => setEditMode(false)}
                        >
                          Save
                        </Button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", marginTop: '0.5rem', marginLeft: '2rem' }}>
                        <h2 style={{ fontWeight: "bold" }}>{section.title}</h2>
                        <IconButton onClick={() => setEditMode(true)}>
                          <EditIcon />
                        </IconButton>
                      </div>
                    )}

                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-start", marginLeft: "3.8rem", marginTop: "0.2rem" }}>
                      {section.elements.map((element, index) => (
                        <div key={index} style={{ display: "flex", alignItems: "center", margin: "0.1rem" }}>
                          <div style={{ display: "flex", alignItems: "center", flex: "1" }}>
                            {renderFileIcon(element.file, index)}
                            <button
                              onClick={() => handleFileClick(element.file)}
                              style={{ marginLeft: "0.5rem", color: "royalblue", textDecoration: "none", cursor: "pointer", background: "none", border: "none", }}
                            >
                              {element.inputValue}
                            </button>
                          </div>
                          <div style={{ marginRight: "1.3rem" }}>
                            <IconButton onClick={() => handleDelete(sectionIndex, index)}>
                              <CloseIcon />
                            </IconButton>
                          </div>
                        </div>
                      ))}
                    </div>
                        
                        {showCustomButton && (
                          <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-start", marginLeft: "3.8rem", marginTop: "0.1rem" }}>
                            <div style={{ display: "flex", alignItems: "center", margin: "0.1rem" }}>
                              <div style={{ display: "flex", alignItems: "center", flex: "1" }}>
                                <BsFileEarmarkText size={25} style={{ marginRight: "-0.2rem" }} />
                                <button
                                  onClick={() => navigate(`/join-quiz/`)}
                                  style={{
                                    marginLeft: "0.5rem",
                                    color: "royalblue",
                                    textDecoration: "none",
                                    cursor: "pointer",
                                    background: "none",
                                    border: "none",
                                  }}
                                >
                                  {quizData?.title}
                                </button>
                              </div>
                              <div style={{ marginRight: "1.3rem" }}>
                                <IconButton onClick={() => handleCustomButtonDelete()}>
                                  <CloseIcon />
                                </IconButton>
                              </div>
                            </div>
                          </div>
                        )}


                    {/* {showCustomButton && (
                      <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-start", marginLeft: "3.8rem", marginTop: "0.1rem" }}>
                        <div style={{ display: "flex", alignItems: "center", margin: "0.1rem" }}>
                          <div style={{ display: "flex", alignItems: "center", flex: "1" }}>
                            <BsFileEarmarkText size={25} style={{ marginRight: "-0.2rem" }} />
                            <button
                              onClick={() => navigate(`/join-quiz/`)}
                              style={{
                                marginLeft: "0.5rem",
                                color: "royalblue",
                                textDecoration: "none",
                                cursor: "pointer",
                                background: "none",
                                border: "none",
                              }}
                            >
                              {quizData?.title}
                            </button>
                          </div>
                          <div style={{ marginRight: "1.3rem" }}>
                            <IconButton onClick={() => handleCustomButtonDelete()}>
                              <CloseIcon />
                            </IconButton>
                          </div>
                        </div>
                      </div>
                    )} */}

                    <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                        <DialogTitle 
                          sx = {{marginLeft: '1rem', marginTop: '0.5rem', marginBottom: '0.5rem'}}
                        >
                          Select an Option
                        </DialogTitle>

                        <DialogContent>
                          <Button
                            color="primary"
                            variant="outlined"
                            size="small"
                            sx={{ marginLeft: '1rem' }}
                            onClick={() => window.open('/create-quiz', '_blank')}
                          >
                            Create Quiz
                          </Button>

                          <Button 
                            onClick={handleJoinQuiz} 
                            color="primary" variant="contained" 
                            sx = {{marginLeft: '1rem', marginRight: '1.3rem'}} 
                            size="small"
                          >
                            Add Quiz
                          </Button>

                          <Dialog open={joinQuizDialogOpen} onClose={() => setJoinQuizDialogOpen(false)}>
                              <DialogTitle sx={{ marginLeft: "1rem", marginTop: "0.5rem", marginBottom: "0.5rem" }}>
                                Enter Quiz ID
                              </DialogTitle>
                              <DialogContent>
                                <TextField
                                  label="Quiz ID"
                                  onChange={(e) => setQuizId(e.target.value)}
                                  fullWidth
                                  variant="outlined"
                                  margin="normal"
                                />
                              </DialogContent>
                              <DialogActions>
                                <Button onClick={() => setJoinQuizDialogOpen(false)} variant="text" color="primary" size="small">
                                  Cancel
                                </Button>
                                <Button
                                  onClick={() => {
                                    setShowCustomButton(true);
                                    setJoinQuizDialogOpen(false);
                                  }}
                                  color="primary"
                                  variant="contained"
                                  size="small"
                                >
                                  Create
                                </Button>
                              </DialogActions>
                            </Dialog>
                        </DialogContent>
                        
                        <DialogActions>
                          <Button
                           onClick={() => setOpenDialog(false)}
                           variant="text"
                           color="primary"
                           size="small"
                           >
                            Cancel
                          </Button>
                        </DialogActions>
                      </Dialog>

                      {/* {showCustomButton && (
                        <div style={{ marginLeft: "3.8rem", display: "flex", alignItems: "center" }}>
                          <BsFileEarmarkText size={25} style={{ marginRight: "0.05rem" }} />
                          <Button color="primary" variant="text" size="small">
                            {quizData?.title}
                            <IconButton onClick={handleDelete2}>
                              <CloseIcon />
                            </IconButton>
                          </Button>
                        </div>
                      )} */}


                    <div style={{ display: "flex", justifyContent: "flex-start", marginLeft: '4.5rem' }}>
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        component="label"
                      >
                        Add New File
                        <input
                          type="file"
                          style={{ display: "none" }}
                          onChange={(e) => handleFileChange(sectionIndex, e)}
                        />
                      </Button>

                      <Button
                        sx = {{marginLeft: '1rem'}}
                        onClick={() => setOpenDialog(true)}
                        variant="outlined"
                        color="primary"
                        size="small"
                        
                      >
                        Upload Quiz
                      </Button>
                    </div>
                  </div>
                ))}
  
                <div style={{ display: "flex", justifyContent: "flex-end", marginRight: '1.5rem', }}>
                  <Button variant="contained" color="primary" onClick={handleNewSection}>
                    <AddIcon />
                  </Button>
                </div>  

                <div style={{ display: "flex", justifyContent: "center" }}>
                  <Button
                    sx = {{marginTop: '2rem', marginBottom: '1.2rem'}}
                    onClick={handleUpload}
                    color="primary"
                    variant="contained"
                  >
                    Save Changes
                  </Button>
                </div>
              </Box>
            </Container>
        </div>
      </div>
    </div>
  );
  
}
export default Class