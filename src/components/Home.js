import React,{ useState, useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import "leaflet/dist/leaflet.css";
import "../styles.css";

function Home() {
  const [inputValue, setInputValue] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const zoomLevel = 6;
  const initialPosition = [55.8617, -4.2583]


  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };


  const handleSubmit = async (event) => {
    event.preventDefault();

    const uprn = inputValue; 
    setLoading(true);

    const apiKey = process.env.REACT_APP_API_KEY; 

    try {
      
      const response = await fetch(`https://api.propeco.io/properties/${uprn}`, {
        method: 'GET',
        headers: {
          'x-api-key': apiKey, 
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      
      const data = await response.json();

      
      setSearchResults(data);

    } catch (err) {
      
      setError('Something went wrong: ' + err.message);
    } finally {
      
      setLoading(false);
    }
  };


  return (
    <div className="container">

        <div className="search-box"> 
      <form className="search-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Enter UPRN"
          className="search-input"
        />
        <button type="submit" disabled={loading} class="search-button">
          {loading ? 'Loading...' : 'Search'}
        </button>
      </form>
        </div>
      {error && <p>{error}</p>}

      

        <div>
     {!loading && searchResults && (
      <div className="map-container" style={{width: "100%", height: "500px"}}>
      <MapContainer center={initialPosition} zoom={zoomLevel} className="map">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {searchResults.location && searchResults.location.latitude && searchResults.location.longitude && (
            <Marker position={[searchResults.location.latitude, searchResults.location.longitude]}>
              <Popup>
                <div>
                  <h4>{searchResults.location.admin_boundaries_country_name}</h4>
                  <p><strong>In Conservation Area ? </strong> ${searchResults.planning.conservation_areas.in_conservation_area}</p>
                  <p><strong>Rainfall:</strong> {searchResults.climate.historical.average_rainfall.value}</p>
                
                </div>
              </Popup>
            </Marker>
        )}
         
      </MapContainer>
    </div>
    )}

</div>

{/* {searchResults && !loading && (
        <div>
          <h3>Search Results:</h3>
          <pre>{JSON.stringify(searchResults, null, 2)}</pre>
        </div>
      )} */}
    </div>

  );
}


export default Home;