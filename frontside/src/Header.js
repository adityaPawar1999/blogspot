import {Link} from "react-router-dom";
import {useContext, useEffect, useState} from "react";
import {UserContext} from "./UserContext";
import styled from "styled-components";

const  HeaderStyle = styled.div`


`
export default function Header() {
  const {setUserInfo,userInfo} = useContext(UserContext);
  useEffect(() => {
    fetch('http://localhost:4000/profile', {
      credentials: 'include',
    }).then(response => {
      response.json().then(userInfo => {
        setUserInfo(userInfo);
      });
    });
  }, []);

  function logout() {
    fetch('http://localhost:4000/logout', {
      credentials: 'include',
      method: 'POST',
    });
    setUserInfo(null);
  }

  const username = userInfo?.username;

  return (
    
    <HeaderStyle>
      <div className="container">
       <header>
      <Link to="/" className="logo">BLOGSPOT</Link>
      <nav>
        {username && (
          <>
             <Link to="/">Home</Link>
            <Link to="/create">Create new </Link>
            <a href="/login" onClick={logout}>Logout ({username})</a>
          </>
        )}
        {!username && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>
    </header>
      
    </div>
   
    </HeaderStyle>
  );
}
