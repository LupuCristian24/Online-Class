import React from 'react'
import { Link } from "react-router-dom";
import "./JoinedClasses.css";

  const JoinedClasses = ({ Class }) => {
    return (
      <li className="List">
        <div className="Wrapper">
          <Link className="Upper" to={`/${Class.id}`}>
            <div className="Delimiter">
              <div className="Image" />
              <div className="Content">
                <p className="Owner">{Class.owner}</p>
              </div>
            </div>
          </Link>
        </div>
        <div className="Bottom">
          <Link className="Name" to={`/${Class.id}`}>
              <h2>{Class.className}</h2>
          </Link>
        </div>
      </li>
    )
  }

export default JoinedClasses