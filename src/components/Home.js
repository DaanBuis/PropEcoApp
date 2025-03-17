import React,{ useState, useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import "../styles.css";

function Home() {

  //Icons for the map markers. The first Icon is the default Leaflet icon sourced online.
  const icon = L.icon({
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  //The second icon uses a stock image from online, which is credited in the footer.
  const icon2 = L.icon({
    iconUrl: "./airplane.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [35, 35],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  //Using useState to track the state of different variables. Helps control the different views of the webpage and its data handling.
  const [inputValue, setInputValue] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showRawData, setShowRawData] = useState(false);

  //Initial zoom level for the Map.
  const zoomLevel = 10;

  //Handles changes when the user enters data
  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  //Handles users submitting information
  const handleSubmit = async (event) => {
    event.preventDefault();

    //Grabs the submitted UPRN number.
    const uprn = inputValue; 
    setLoading(true);

    //Gets the API key from the .env file.
    const apiKey = process.env.REACT_APP_API_KEY; 

    //Acquires data using FETCH and GET to get data from the API regarding the submitted UPRN.
    try {
      const response = await fetch(`https://api.propeco.io/properties/${uprn}`, {
        method: 'GET',
        headers: {
          'x-api-key': apiKey, 
        },
      });

      //Error handling
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      //Stores the fetched data in json format
      const data = await response.json();


      //Debugging line to view api's response
      console.log("API Response:", data);
      //Transferring stored data to new variable
      setSearchResults(data);
      //Error handling
    } catch (err) {
      setError('Something went wrong: ' + err.message);
    } finally {  //Waits till the end of the function to change status of loading, allowing the map and other components to be displayed.
      setLoading(false);
    }
  };

  //Handles converting JSON data into a collapsible list for easier viewing/navigation.
  const CollapsibleItem = ({ label, value }) => {
    const [isOpen, setIsOpen] = useState(false);

    if (typeof value === 'object' && value !== null) {
      return (
        <li>
          <strong onClick={() => setIsOpen(!isOpen)} style={{ cursor: 'pointer' }}>
            {label} {isOpen ? 'v' : '>'}
          </strong>
          {isOpen && (
            <ul>  
              {Object.entries(value).map(([key, subValue]) => (
                <CollapsibleItem key={key} label={key} value={subValue} />
              ))}
            </ul>
          )}
        </li>
      );
    }

    return (
      <li>
        <strong>{label}:</strong> {value?.toString() || 'N/A'}
      </li>
    );
  };


  return (
    <div>
        {/*Creates a search box for the user to submit a UPRN. Once submitted, the input data is sent to the API through the handleInputChange function and updates the pages "loading" status  */}
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


      <div style={{ alignItems: "center", justifyContent: "center", display: "flex", paddingTop: "30px" }}>
          {/*Displays the Map Container on the condition that the API has finished loading required data, that searchResults is not empty meaning the API call was successful, and that the raw data view is not currently selected*/}
        {!loading && searchResults && !showRawData && (
          <div style={{ width: "700px", height: "500px" }}>
              {/*Map container centered around the longitude and latitude values of the inputted UPRN  */}
            <MapContainer 
              center={[searchResults.location.latitude, searchResults.location.longitude]} 
              zoom={zoomLevel} 
              style={{ height: "500px", width: "100%", margin: "0 auto", border: "3px solid #4CAF50", borderRadius: "10px", boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
                {/*Marker positioned at the location of the UPRN, with a popup that displays some relevant information  */}
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
                {/*Another marker that is positioned at the location of the nearest airport  */}
              {searchResults.location && searchResults.location.latitude && searchResults.location.longitude && (
                <Marker position={[searchResults.transportation.nearest_airport.latitude, searchResults.transportation.nearest_airport.longitude]} icon={icon2}>
                  <Popup>
                    <div>
                      <h4>Nearest Airport: {searchResults.transportation.nearest_airport.name}</h4>
                      <p><strong>Distance:</strong> {(searchResults.transportation.nearest_airport.distance / 1609).toFixed(1)} miles</p>
                    </div>
                  </Popup>
                </Marker>
                
              )}
            </MapContainer>
          </div>
        )}
        {/*A side card highlighting more information about the UPRN  */}
        {!loading && searchResults && !showRawData && (
          <div style={{ width: "300px", height: "500px", padding: "10px", paddingLeft: "40px", border: "3px solid #ddd", borderRadius: "10px", overflowY: "auto", backgroundColor: "#f9f9f9" }}>
            <h3>Property Information</h3>
            <p><strong>Country:</strong> {searchResults.location.admin_boundaries.country_name || "N/A"}</p>
            <p><strong>Local Authority District:</strong> {searchResults.location.admin_boundaries.local_authority_district_name || "N/A"}</p>
            <p><strong>Average Gas Costs:</strong> £{searchResults.energy.average_energy_usage_stats.lower_layer_super_output_area.mean_gas_cost.toFixed(2)}</p>
            <p><strong>Average Electricity Costs:</strong> £{searchResults.energy.average_energy_usage_stats.lower_layer_super_output_area.mean_electricity_cost.toFixed(2)}</p>
            <p><strong>Average House Price:</strong> £{searchResults.social.house_price_index.average_price}</p>
            <p><strong>In Conservation Area?</strong> {searchResults.planning.conservation_areas.in_conservation_area ? 'Yes' : 'No'}</p>
            <p><strong>Greenspace (m²):</strong> {searchResults.environment.greenspace.greenspace_area.toFixed(0) || "N/A"}</p>
            <p><strong>Rainfall:</strong> {searchResults.climate.historical.average_rainfall.value.toFixed(2) || "N/A"}</p>
            <p><strong>Minimum and Maximum Temperatures:</strong> {searchResults.climate.historical.minimum_temperature.value.toFixed(1) || "N/A"}°/{searchResults.climate.historical.maximum_temperature.value.toFixed(1) || "N/A"}°</p>
            <p><strong>Air Quality (NOx Concentration Value):</strong> {searchResults.environment.air_quality.nox.value.toFixed(2) || "N/A"}</p>
          </div>
        )}

        {/*Shows the Raw Data in a structured, drop-down format  */}
        {showRawData && (
          <div style={{ width: "600px", maxHeight: "500px", overflow: "auto", backgroundColor: "#bec4c5", color: "#black", padding: "20px", borderRadius: "10px", alignItems: "center", justifyContent: "left", display: "flex" }}>
           <ul>
              {Object.entries(searchResults).map(([key, value]) => (
                <CollapsibleItem key={key} label={key} value={value} />
              ))}
            </ul>
        </div>
        )}
      </div>

      {/*Shows a button that allows the user to change between viewing the map and viewing raw data. Errors are handled through the use of validating that the API call has occurred  */}
      {!loading && searchResults && (  
        <div style={{alignItems: "center", justifyContent: "center", display: "flex"}}>
      <button 
        onClick={() => setShowRawData((prev) => !prev)}
        style={{ marginTop: '20px', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }}
      >
        {showRawData ? 'View Map & Info' : 'View Raw Data'}
      </button>
        </div>
      )}

      {/*Footer crediting flaticon for the airport icon  */}
      <footer  style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', textAlign: 'center', padding: '10px 0', color: 'white' }}>
        <a href="https://www.flaticon.com/free-icons/plane" title="plane icons">Plane icons created by Freepik - Flaticon</a>
      </footer>
    </div>
  );
}

export default Home;
