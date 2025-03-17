import React,{ useState, useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import "../styles.css";


function Home() {
  const icon = L.icon({
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
  
  const [inputValue, setInputValue] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const zoomLevel = 10;


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

      console.log("API Response:", searchResults);
      setSearchResults(data);

    } catch (err) {
      
      setError('Something went wrong: ' + err.message);
    } finally {
      
      setLoading(false);
    }
  };


  return (
    
    <div>

        <div className="search-box"> 
      <form className="search-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Enter UPRN"
          className="search-input"
        />
        <button type="submit" disabled={loading} className="search-button">
          {loading ? 'Loading...' : 'Search'}
        </button>
      </form>
        </div>
      {error && <p>{error}</p>}

      

    <div style={{ alignItems:"center", justifyContent:"center", display:"flex", paddingTop:"30px" }}>
     {!loading && searchResults && (
      <div style={{width: "700px", height: "500px"}}>
      <MapContainer center={[searchResults.location.latitude, searchResults.location.longitude]} zoom={zoomLevel} style={{ height: "500px", width: "100%",margin: "0 auto", border:"3px solid #4CAF50", borderRadius: "10px", boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)"}}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {searchResults.location && searchResults.location.latitude && searchResults.location.longitude && (
          
            <Marker position={[searchResults.location.latitude, searchResults.location.longitude]} icon={icon}>
              <Popup>
                <div>
                  <h4>Location: {searchResults.location.admin_boundaries.country_name}, {searchResults.location.admin_boundaries.region_name}</h4>
                  <p><strong>In Conservation Area:</strong> {searchResults.planning.conservation_areas.in_conservation_area ? 'Yes' : 'No'}</p>
                  <p><strong>Rainfall:</strong> {searchResults.climate.historical.average_rainfall.value.toFixed(2)}</p>
                  <p><strong>Average Gas Costs:</strong> £{searchResults.energy.average_energy_usage_stats.lower_layer_super_output_area.mean_gas_cost.toFixed(2)}</p>
                  <p><strong>Average Electricity Costs:</strong> £{searchResults.energy.average_energy_usage_stats.lower_layer_super_output_area.mean_electricity_cost.toFixed(2)}</p>
                  <p><strong>Average House Price:</strong> £{searchResults.social.house_price_index.average_price}</p>
                
                </div>
              </Popup>
            </Marker>
        )}
         
      </MapContainer>
    </div>
    
    )}
    <div style={{
    width: "300px",
    height: "500px",
    padding: "15px",
    border: "3px solid #ddd",
    borderRadius: "10px",
    overflowY: "auto",
    backgroundColor: "#f9f9f9"
  }}>
    <h3>Property Information</h3>
    {searchResults ? (
      <>
        <p><strong>Country:</strong> {searchResults.location.admin_boundaries.country_name || "N/A"}</p>
        <p><strong>Local Authority District:</strong> {searchResults.location.admin_boundaries.local_authority_district_name || "N/A"}</p>
        <p><strong>Rainfall:</strong> {searchResults.climate.historical.average_rainfall.value.toFixed(2) || "N/A"}</p>
        <p><strong>In Conservation Area?</strong> {searchResults.planning.conservation_areas.in_conservation_area ? 'Yes' : 'No'}</p>
        <p><strong>Minimum and Maximum Temperatures:</strong> {searchResults.climate.historical.minimum_temperature.value.toFixed(2) || "N/A"} {searchResults.climate.historical.maximum_temperature.value.toFixed(2) || "N/A"}</p>
        <p><strong>Air Quality (NOx Concentration Value):</strong> {searchResults.environment.air_quality.nox.value.toFixed(2) || "N/A"}</p>
      </>
    ) : (
      <p>No data available.</p>
    )}
  </div>

</div>
    </div>

  );
}


export default Home;