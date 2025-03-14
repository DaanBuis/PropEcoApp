import React,{ useState, useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

function Home() {
  const [inputValue, setInputValue] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  zoomLevel = 13;
  initialPosition = [55.8617,4.2583]


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


      <div style={{ height: '500px', width: '100%' }}>
      <MapContainer center={initialPosition} zoom={zoomLevel} style={{ width: '100%', height: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
            <Marker position={[searchResults.location.latitude, searchResults.location.longitude]}>
              <Popup>
                <div>
                  <h4>{searchResults.location.country_name}</h4>
                  <p><strong>In Conservation Area ? </strong> ${searchResults.planning.conservation_areas.in_conservation_area}</p>
                  <p><strong>Rainfall:</strong> {searchResults.climate.historical.average_rainfall.value}</p>
                
                </div>
              </Popup>
            </Marker>
         
      </MapContainer>
    </div>

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