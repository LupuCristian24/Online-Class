import {AppBar, Avatar, Toolbar, } from "@material-ui/core";
import React from 'react'
import { CreateClass, JoinClass } from "..";
import { useStyles } from "./style";
import logo2 from "../../images/logo2.png"
import { UserAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Header = ({ children }) => {
  const classes = useStyles()
  // const [anchorEl, setAnchorEl] = React.useState(null);
  const navigate = useNavigate();
  const routeChange = () =>{ navigate('/logout') }
  const { user } = UserAuth();

  return (
    <div className={classes.root}>  
        <AppBar className={classes.appBar} position="static">
          <Toolbar className={classes.toolbar}>
            <div className={classes.headerWrapper}>
              {children}
              <img src={logo2} alt="Online Class" />
            </div>
            <div className={classes.header_right}>
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