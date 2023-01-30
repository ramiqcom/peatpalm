import { useState, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet-draw';
import Select from 'react-select'

// *** Global variables *** //

// Map data
let Map;
let Data;
let Image;

// Input data
let setCalculateDisabled;

// *** Global variables *** //

// Main app
export default function Main() {
  return (
    <div style={{ height: '100vh' }}>
      <Header />
      <Home />
      <Footer />
    </div>
  )
}

// Header
function Header() {
  return (
    <div id='header' className='frame'>
      <div style={{ margin: '0.3% 1%' }}>
        PPD: Peatland vs Palm Oil Dynamics
      </div>
    </div>
  )
}

// Footer
function Footer() {
  return (
    <div id='footer' className='frame'>
      <div style={{ margin: '0.3% 5%' }}>
        Contact
      </div>
    </div>
  )
}

// Main panel
function Home() {
  return (
    <div id='home' className='column'>
      <Info />
      <LeafletMap />
      <Control />
    </div>
  )
}

// Info panel
function Info(){
  return (
    <div id='info' className='side'>

    </div>
  )
}

// Control panel
function Control(){
  return (
    <div id='control' className='side'>
			<AOI />
			<Calculate />
    </div>
  )
}

// AOI select
function AOI(){

	const options = [
		{ value: 'shp', label: 'Shapefile (zip)' },
		{ value: 'draw', label: 'Drawing' },
		{ value: 'kml', label: 'KML' }
	]

  return (
    <div id='aoi' className='section'>
			<div>
					Select an AOI option
			</div>
			<Select
				options={options}
				defaultValue={{ value: 'draw', label: 'Drawing' }}
			/>
    </div>
  )
}

// Calculate
function Calculate(){
  const [disabled, setDisabled] = useState(true);

  useEffect(() => {
    setCalculateDisabled = setDisabled;
  })

  function clickCalculate(){
		// Delete all current image
		Image.clearLayers();

		const options = {
			headers: { 'Content-Type': 'application/json'},
			body: JSON.stringify(Data.toGeoJSON(0.001)),
			method: 'POST'
		}

    fetch('/api/simplify', options)
			.then(response => response.json())
			.then(geojson => {

				const options = {
					headers: { 'Content-Type': 'application/json' },
					method: 'POST',
					body: JSON.stringify(geojson)
				}

				return fetch('/api/image', options)
					.then(response => response.json())
					.catch(err => alert(err));
			})
			.then(data => data.urlFormat)
			.then(url => L.tileLayer(url))
			.then(tile => tile.addTo(Image))
			.catch(err => alert(err));
		
		// Delete all AOI
		Data.clearLayers()
  }

  return (
    <div id='calculate' className='section'>
      <button className='input' onClick={clickCalculate} disabled={disabled}>
        Calculate
      </button>
    </div>
  )
}

// Map Panel
function LeafletMap() {

  useEffect(() => {
		loadMap();
  });

  return (
    <div id='map' />
  )
}

// Load leaflet map
function loadMap(){
	if (Map === undefined) {

		Map = L.map("map", {
			center: [-0.559, 101.897],
			zoom: 6,
		});
	
		L.tileLayer("https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png", {
				attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
		}).addTo(Map);
	
		Data = L.featureGroup().addTo(Map);
		Image = L.featureGroup().addTo(Map);
	
		Map.addControl(new L.Control.Draw({
			edit: {
				featureGroup: Data,
			},
			draw: {
				marker: false,
				polyline: false,
				circlemarker: false
			}
		}));
	
		Map.on('draw:created', event => {
			Data.addLayer(event.layer);
			setCalculateDisabled(false);
		});
	
		Map.on('draw:deleted', event => {
			if (Object.keys(Data._layers).length) {
					setCalculateDisabled(false);
			} else {
					setCalculateDisabled(true);
			};
		})
	}
}
