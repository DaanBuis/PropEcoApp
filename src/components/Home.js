import React,{ useState } from "react"

function GetUPRN() {
    const [inputValue, setInputValue] = useState('');
    const [searchResults, setSearchResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
  
    // Handle input change
    const handleInputChange = (event) => {
      setInputValue(event.target.value);
    };
  
    // Handle form submission (making the function async)
    const handleSubmit = async (event) => {
      event.preventDefault();
  
      const uprn = inputValue; // You can directly assign the value
      setLoading(true); // Start loading
  
      const apiKey = process.env.REACT_APP_API_KEY; // Fetch your API key from .env
  
      try {
        // Make the API request
        const response = await fetch(`https://api.propeco.io/properties/${uprn}`, {
          method: 'GET',
          headers: {
            'x-api-key': apiKey, // Correct header for API key
          },
        });
  
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
  
        // Parse the response
        const data = await response.json();
  
        // Set search results
        setSearchResults(data);
  
      } catch (err) {
        // Handle error if fetch fails
        setError('Something went wrong: ' + err.message);
      } finally {
        // Stop loading
        setLoading(false);
      }
    };
  
    return (
      <div>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Enter UPRN"
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Loading...' : 'Search'}
          </button>
        </form>
  
        {error && <p>{error}</p>}
  
        {searchResults && (
          <div>
            <h3>Search Results:</h3>
            <pre>{JSON.stringify(searchResults, null, 2)}</pre>
          </div>
        )}
      </div>
    );
  }
  
  export default Home;