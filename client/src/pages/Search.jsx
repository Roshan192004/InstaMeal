import React, { useState } from 'react';
import OrderNavbar from '../components/OrderNavbar';
import './Search.css';

const POPULAR_SEARCHES = [
  "Burger", "Pizza", "Biryani", "Chinese", "Desserts", "North Indian"
];

const RECENT_SEARCHES = [
  "KFC", "Burger King", "Dominos"
];

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="search-page-container">
      <OrderNavbar />
      
      <main className="search-main">
        <div className="search-box-wrapper">
          <div className="search-input-group">
            <svg className="search-page-icon" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              className="search-page-input" 
              placeholder="Search for restaurants and food"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            {searchQuery && (
              <button className="clear-search" onClick={() => setSearchQuery("")}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="search-suggestions">
          {!searchQuery ? (
            <>
              <section className="suggestion-section">
                <h3>Recent Searches</h3>
                <div className="suggestion-tags">
                  {RECENT_SEARCHES.map((item, idx) => (
                    <div key={idx} className="search-tag recent" onClick={() => setSearchQuery(item)}>
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="1 4 1 10 7 10"></polyline>
                        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                      </svg>
                      {item}
                    </div>
                  ))}
                </div>
              </section>

              <section className="suggestion-section">
                <h3>Popular Cuisines</h3>
                <div className="popular-cuisines-grid">
                  {POPULAR_SEARCHES.map((cuisine, idx) => (
                    <div key={idx} className="cuisine-item" onClick={() => setSearchQuery(cuisine)}>
                      <div className="cuisine-img-placeholder">
                        {cuisine[0]}
                      </div>
                      <span>{cuisine}</span>
                    </div>
                  ))}
                </div>
              </section>
            </>
          ) : (
            <div className="search-results-placeholder">
              <div className="searching-animation">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
              <p>Searching for "{searchQuery}"...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Search;
