import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Header.module.css';
import { Shield, Search, Menu, X } from 'lucide-react';

const Header = ({ coach, pageTitle, setSearchQuery }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={styles.logoSection}>
        <div className={styles.logoBox}><Shield size={22} color="white" fill="#ff4655" /></div>
        <span className={styles.brandName}>TRACKER.DB</span>
      </div>

      <div className={styles.searchSection}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} size={18} />
          <input 
  placeholder="SEARCH TEAMS OR PLAYERS..." 
  className={styles.searchInput}
  onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)} 
/>
        </div>
      </div>

      <div className={styles.userSection}>
        <div className={styles.userInfo}>
          <p className={styles.userName}>{coach?.name || "EP KOZZY"}</p>
        </div>
        <div className={styles.avatarCircle}>
          <img src={coach?.avatar} alt="Avatar" className={styles.avatarImg} />
        </div>
        
        <div className={styles.menuContainer}>
          <button 
            className={styles.menuBtn} 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} color="#ff4655" /> : <Menu size={24} color="white" />}
          </button>

          {isMenuOpen && (
            <div className={styles.dropdownMenu}>
              <Link to="/" className={styles.menuLink} onClick={() => setIsMenuOpen(false)}>DASHBOARD</Link>
              <Link to="/registration" className={styles.menuLink} onClick={() => setIsMenuOpen(false)}>REGISTRATIONS</Link>
              <Link to="/search" className={styles.menuLink} onClick={() => setIsMenuOpen(false)}>TEAM SEARCH</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;