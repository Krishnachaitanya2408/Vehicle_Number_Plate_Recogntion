import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
// import githubLogo from './github_logo.png'; // Put your GitHub logo in `src/components`

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        Vehicle Number Plate Recognition
      </div>
      <ul className="navbar-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/upload">Upload</Link></li>
        {/* <li>
          <a href="https://github.com/yourusername/yourrepo" target="_blank" rel="noopener noreferrer">
            <img src={githubLogo} alt="GitHub" className="github-logo" />
          </a>
        </li> */}
      </ul>
    </nav>
  );
}
