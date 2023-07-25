import { Box, Button, Container, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, TextField } from "@mui/material"
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import React, { useState, useEffect } from "react"
import { db, storage } from "../../FireBase/Firebase"
import { ref, uploadBytesResumable, getDownloadURL, } from "firebase/storage"
// import { collection, addDoc, doc, serverTimestamp, getDoc, setDoc, updateDoc } from "firebase/firestore"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { UserAuth } from "../../context/AuthContext"
import "./Class.css"
import { FileIcon, defaultStyles } from 'react-file-icon';
import { useNavigate } from "react-router-dom";
import { BsFileEarmarkText } from 'react-icons/bs';
// import { getByTitle } from "@testing-library/react";

const Class = ({ Data }) => {     //TODO: Check Data
  const { user } = UserAuth()
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);
  const [joinQuizDialogOpen, setJoinQuizDialogOpen] = useState(false);
  const [showCustomButton, setShowCustomButton] = useState(false);  //! old quiz display
  const [editClass, setEditClass] = useState(false); //teacher Mode
  const [initDoc, setInitDoc] = useState(null);
  const [focusIndex, setFocusIndex] = useState(0);        //state with fetched quiz title
  const [quizNameField, setQuizNameField] = useState(""); //state with input text field quiz id
  const [uploadStack, setUploadStack] = useState([]);
  const [needStorage, setNeedStorage] = useState(false);
  const [editMode, setEditMode] = useState(false);    //! this editMode may be usefull
  const [elements, setElements] = useState([]);       //! elements are all files from a section
  const [sectionTitle, setSectionTitle] = useState("Section");
  const [sections, setSections] = useState([          //! this state holds the array of sections from flux
    {
      title: sectionTitle,
      elements: elements,
      showCustomButton: false, 
      sectQuizes: [],    
    },
  ]);

  useEffect(() => {
    const fetchQuizArray = async () => {     
        const fluxRef = doc(db, 'Flux-Temp', Data.id);
        const snapshot = await getDoc(fluxRef);
        if (snapshot.exists()) {
          const data = snapshot.data().sections;
          setSections(data);
          setInitDoc(data);
        } else {
          try {
            await setDoc(fluxRef, {
              sections: sections
            });
            setInitDoc(sections);
          } catch (error) {
            console.error("Error creating flux in database", error);
          }
        }
    }
      fetchQuizArray();
  }, []);

  const saveChanges = async () => {
    if(JSON.stringify(initDoc) !== JSON.stringify(sections) || uploadStack.length !== 0 || needStorage){
      setNeedStorage(false);
      if (uploadStack.length !== 0) {
        handleUpload();
      }else{
        await setDoc(doc(db, 'Flux-Temp', Data.id), {
          sections: [...sections]
        });
      }
      setInitDoc(sections);
    } else {
      console.warn("Nothing new to save!");
    }
  }

  const renderFileIcon = (fileType, fileName, url) => {       
    const handleFileDownload = () => {                   
      // const downloadLink = document.createElement("a");
      // downloadLink.href = url;
      // downloadLink.download = fileName;
      // downloadLink.click();
      window.open(url, "_blank");   //*This needs more info to work
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
    setNeedStorage(true);
  };

  const handleFileChange = (sectionIndex, e) => {
    const files = e.target.files;
    const newElements = [...sections[sectionIndex].elements];
    const newUploadStack = [...uploadStack];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const { type } = file;
      const fileType = type.split("/")[1];

      const newElement = {
        downloadLink: "",
        fileType: fileType,
        fileName: file.name,
      };
      const newUploadFile = {
        file: file,
        sectionIndex: sectionIndex,
        elementsIndex: newElements.length+i,
      }
      newElements.push(newElement); 
      newUploadStack.push(newUploadFile);
    }
    const updatedSections = [...sections];
    updatedSections[sectionIndex].elements = newElements;
    setSections(updatedSections);
    setUploadStack(newUploadStack);        
    console.log("section:", sections);
  };

  const handleNewSection = () => {                        
    const newSection = {
      delimiter: true,
      title: sectionTitle,
      elements: elements,
      sectQuizes: []
    };
    setSections(prevSections => [...prevSections, newSection]);
    setSectionTitle("Section");
    setElements([]);
    setEditMode(false);
  };  
  
  const handleRemoveSection = (index) => {
    setSections(prevSections => {
      const updatedSections = [...prevSections];
      updatedSections.splice(index, 1);
      return updatedSections;
    });
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
  
  const handleFileClick = (fileType, fileName, url) => { 
    if (fileType === "pdf") {
      window.open(url, "_blank");
    } else if(fileType === "jpeg" || fileType === "png" || fileType === "gif" || fileType === "svg+xml"){
      window.open(url, "_blank");
    } else {
      const downloadLink = document.createElement("a");
      downloadLink.href = url;
      console.log("url:", url);
      downloadLink.download = fileName;
      downloadLink.click();
      // window.open(url, "_blank");   
    }
  };

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

  const checkIfQuizExists = async (sectionIndex) => {
    const docRef = doc(db, 'Quizzes', quizNameField);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const getTitle = docSnap.data().title;                  
      addQuiz(getTitle, docRef.id, sectionIndex);               
    }
    else {
      console.warn("WARNING: quiz does not exist");
    }  
  }

  const addQuiz = (quizName, quizId, sectionIndex) => {            
    const array = sections[sectionIndex].sectQuizes;
    array.push({
      adress: quizId,
      title: quizName
    });
    setNeedStorage(true);  
  }

  const deleteQuiz = (sectionIndex, index) => {         
    let array = sections[sectionIndex].sectQuizes;
    array = array.filter(id => {
      return id !== array[index];
    });
    const updatedSections = [...sections];
    updatedSections[sectionIndex].sectQuizes = array;
    setSections(updatedSections);
    setNeedStorage(true);   
  };

  const handleUpload = async () => {   
    const promises = uploadStack.map((obj) => {
      //const { file } = obj.file;
      const uploadTask = uploadBytesResumable(ref(storage, `Upload/${obj.file.name}`), obj.file);
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
                const pathSections = [...sections];
                pathSections[obj.sectionIndex].elements[obj.elementsIndex].downloadLink = url;
                console.log("pathSections: ", pathSections);
                setSections(pathSections);
                setDoc(doc(db, 'Flux-Temp', Data.id), {
                  sections: pathSections
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
    setUploadStack([]);
  };

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
                      <div style={{ display: "flex", alignItems: "center", marginTop: '0.5rem', marginLeft: '2rem', marginBottom: "1rem" }}>
                        <h2 style={{ fontWeight: "bold" }}>{section.title}</h2>
                        {editClass &&
                          <div style={{ display: "flex" }}>
                            <IconButton onClick={() => setEditMode(true)}>
                              <EditIcon />
                            </IconButton>
                            <div style={{ marginRight: "1.3rem" }}>
                              <IconButton onClick={() => handleRemoveSection(sectionIndex)}>
                                <CloseIcon />
                              </IconButton>
                            </div>
                          </div>
                        }
                      </div>
                    )}

                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-start", marginLeft: "3.8rem", marginTop: "0.2rem" }}>
                      {section.elements.map((element, index) => (
                        <div key={index} style={{ display: "flex", alignItems: "center", margin: "0.1rem" }}>
                          <div style={{ display: "flex", alignItems: "center", flex: "1" }}>
                            {renderFileIcon(element.fileType, element.fileName ,element.downloadLink)}
                            <div style={{marginTop: '0.65rem'}}>
                              <button
                                onClick={() => handleFileClick(element.fileType, element.fileName ,element.downloadLink)}
                                style={{ marginBottom: '0.5rem', marginLeft: "0.52rem", color: "royalblue",
                                          textDecoration: "none", cursor: "pointer", background: "none", border: "none" }}
                              >
                                {element.fileName}
                              </button>
                            </div>
                          </div>
                          {editClass &&
                            <div style={{ marginRight: "1.3rem" }}>
                              <IconButton onClick={() => handleDelete(sectionIndex, index)}>
                                <CloseIcon />
                              </IconButton>
                            </div>
                          }
                        </div>
                      ))}
                      {section.sectQuizes.length > 0 &&  
                        section.sectQuizes.map((quiz_id, index) => {
                          return(
                            <div key={index} style={{ display: "flex", alignItems: "center", margin: "0.1rem" }}>
                              <div style={{ display: "flex", alignItems: "center", flex: "1" }}>
                                <BsFileEarmarkText size={25} style={{ marginRight: "-0.2rem" }} />
                                <button
                                  onClick={() => {navigate(`/join-quiz/${quiz_id.adress}`)}}
                                  style={{
                                    marginLeft: "0.5rem",
                                    color: "royalblue",
                                    textDecoration: "none",
                                    cursor: "pointer",
                                    background: "none",
                                    border: "none",
                                  }}
                                >
                                  {quiz_id.title !=="" ? quiz_id.title : quiz_id.adress}   
                                </button>
                                {user.email === Data.owner &&
                                  <button
                                  onClick={() => { window.open(`/results/${quiz_id.adress}`, "_blank");}} 
                                    style={{
                                      marginLeft: "0.5rem",
                                      color: "grey",
                                      textDecoration: "none",
                                      cursor: "pointer",
                                      background: "none",
                                      border: "none",
                                    }}
                                  >
                                    - View Results
                                  </button>
                                }
                              </div>
                              {editClass &&
                                <div style={{ marginRight: "1.3rem" }}>
                                  <IconButton onClick={() => deleteQuiz(sectionIndex, index)}>
                                    <CloseIcon />
                                  </IconButton>
                                </div>
                              }
                            </div>
                          );
                        })
                      }
                    </div>
                    {editClass &&
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
                          onClick={() => {
                            setFocusIndex(sectionIndex);
                            setOpenDialog(true);
                          }}
                          variant="outlined"
                          color="primary"
                          size="small"
                        >
                          Upload Quiz
                        </Button>
                    </div>
                    }
                  </div>
                ))}

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
                            onChange={(e) => setQuizNameField(e.target.value)}
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
                              checkIfQuizExists(focusIndex); 
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

                {editClass &&
                  <div style={{ display: "flex", justifyContent: "flex-end", marginRight: '1.5rem', }}>
                    <Button variant="contained" color="primary" onClick={handleNewSection}>
                      <AddIcon />
                    </Button>
                  </div>  
                }
                <div style={{ display: "flex", justifyContent: "center" }}>
                  {editClass &&
                    <Button
                    sx = {{marginTop: '2rem', marginBottom: '1.2rem'}}
                    onClick={saveChanges}
                    color="primary"
                    variant="contained"
                    >
                      Save Changes
                    </Button>
                  }
                  {Data.owner === user.email &&
                    <Button
                    sx = {{marginTop: '2rem', marginBottom: '1.2rem', marginLeft: '1rem'}}
                    onClick={() => setEditClass(!editClass)}
                    color="primary"
                    variant="contained"
                    >
                      {editClass? "End Edit" : "Edit"}
                    </Button>
                  }
                </div>
              </Box>
            </Container>
        </div>
      </div>
    </div>
  );
}

export default Class