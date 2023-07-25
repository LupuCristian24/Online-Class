// import { AppBar } from '@mui/material';
// import {AppBar, Avatar, Menu, MenuItem, Toolbar, } from "@material-ui/core";
import {AppBar, Avatar, Toolbar, } from "@material-ui/core";
import { Button } from "@mui/material";
import React from 'react'
import { CreateClass, JoinClass } from "..";
import { useStyles } from "./style";
import logo2 from "../../images/logo2.png"
import { useLocalContext } from "../../context/context";
import { UserAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Header = ({ children }) => {
  const classes = useStyles()
  const [anchorEl, setAnchorEl] = React.useState(null);
  const navigate = useNavigate();
  const routeChange = () =>{ navigate('/logout') }
  const handleClose = () => setAnchorEl(null);
  const { setCreateClassDialog, setJoinClassDialog } = useLocalContext();
  const { user } = UserAuth();
  const handleCreate = () => {handleClose(); setCreateClassDialog(true); };
  const handleJoin = () => {handleClose(); setJoinClassDialog(true); };

  return (
    <div className={classes.root}>  
        <AppBar className={classes.appBar} position="static">
          <Toolbar className={classes.toolbar}>
            <div className={classes.headerWrapper}>
              {children}
              <img src={logo2} alt="Online Class" />
            </div>
            <div className={classes.header_right}>
              <div className={classes.Join}>
                <Button color='primary' variant="contained" onClick={handleJoin}>
                  Join a Class
                </Button>
              </div>
              <div className={classes.Create}>
                <Button variant="outlined" onClick={handleCreate}>
                  Create a Class
                </Button>
              </div>
              <div>
                <Avatar src={user?.photoURL} className={classes.icon} onClick={routeChange}/>
              </div>
            </div>
          </Toolbar>
        </AppBar>
        <CreateClass />
        <JoinClass />
    </div>
  )
}

export default Header