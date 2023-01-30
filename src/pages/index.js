import Head from 'next/head';
import { useState, useEffect, useRef } from 'react';
import Select from 'react-select';
import Script from 'next/script';
import * as turf from '@turf/turf';
import { kml } from "@tmcw/togeojson";

// ** Global variables ** //

// Map data
let Map;
let Data;
let Image;
let Draw;

// File data
let SHPFile;
let KMLFile;
let GeoJSONFile;

// App variables
let setCalculateDisabled;
let loadingScreen;

// ** Global variables ** //

export default function App() {
  return (
    <>
      <Head>
        <title>Peatland vs Palm Oil</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Script 
        src="https://unpkg.com/leaflet@1.9.3/dist/leaflet.js"
        integrity="sha256-WBkoXOwTeyKclOHuWtc+i2uENFpDZ9YPdf5Hf+D7ewM="
        crossOrigin=""
        onLoad={mountMap}
      />

      <Main />
    </>
  )
}

// Main app
function Main() {
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
  const [loading, setLoading] = useState('none');

  useEffect(() => {
    loadingScreen = setLoading;
  })

  return (
    <div id='info' className='side'>

      <div className='section' style={{ display: loading, textAlign: 'center', fontSize: 'x-large', color: 'blue', fontWeight: 'bold' }}>
        Loading...
      </div>

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
  const [shpShow, setShpShow] = useState('none');
  const [geojsonShow, setGeojsonShow] = useState('none');
  const [kmlShow, setKmlShow] = useState('none');

	const options = [
		{ value: 'shp', label: 'Shapefile (zip)' },
		{ value: 'draw', label: 'Drawing' },
		{ value: 'kml', label: 'KML' },
    { value: 'geojson', label: 'GeoJSON' }
	]

  function changeAoi (event) {
    const value = event.value;

    Map.removeControl(Draw);
    setShpShow('none');
    setGeojsonShow('none');
    setKmlShow('none');

    switch (value) {
      case 'shp':
        setShpShow('inline');
        break;
      case 'draw':
        Map.addControl(Draw);
        break;
      case 'geojson':
        setGeojsonShow('inline');
        break;
      case 'kml':
        setKmlShow('inline');
        break;
    }
  }

  return (
    <div id='aoi' className='section'>
      
      <div style={{ margin: '5% auto' }}>
        Select an AOI option
        <div>
          <Select
            options={options}
            defaultValue={{ value: 'draw', label: 'Drawing' }}
            onChange={changeAoi}
          />
        </div>
      </div>
      
      <div>
        <SHPUpload style={{ display: shpShow }} />
        <KMLUpload style={{ display: kmlShow }} />
        <GeoJSONUpload style={{ display: geojsonShow }} />
      </div>

    </div>
  )
}

// SHP upload button
function SHPUpload(props){
	const [selectedFile, setSelectedFile] = useState();
	const [isFilePicked, setIsFilePicked] = useState(false);
  const [showButton, setShowButton] = useState(true);

  useEffect(() => {
    SHPFile = selectedFile;
  })

	const changeHandler = (event) => {
		setSelectedFile(event.target.files[0]);
		setIsFilePicked(true);
    setShowButton(false);
	};

	return(
   <div style={props.style}>

			<input 
        type="file" 
        name="file" 
        accept='.zip' 
        onChange={changeHandler}
        className='upload'
      />

      <button style={{ width: '100%' }} className={props.className} disabled={showButton} onClick={showSHP}>
        Show SHP to map
      </button>

		</div>
	)
}

// KML Upload section
function KMLUpload(props){
  const [selectedFile, setSelectedFile] = useState();
	const [isFilePicked, setIsFilePicked] = useState(false);
  const [showButton, setShowButton] = useState(true);

  useEffect(() => {
    KMLFile = selectedFile;
  })

	const changeHandler = (event) => {
		setSelectedFile(event.target.files[0]);
		setIsFilePicked(true);
    setShowButton(false);
	};

	return(
   <div style={props.style}>
			<input 
        type="file" 
        name="file" 
        accept='.kml,.kmz'
        onChange={changeHandler}
        className='upload'
      />

      <button style={{ width: '100%' }} className={props.className} disabled={showButton} onClick={showKML}>
        Show KML to map
      </button>

		</div>
	)
}

// KML Upload section
function GeoJSONUpload(props){
  const [selectedFile, setSelectedFile] = useState();
	const [isFilePicked, setIsFilePicked] = useState(false);
  const [showButton, setShowButton] = useState(true);

  useEffect(() => {
    GeoJSONFile = selectedFile;
  })

	const changeHandler = (event) => {
		setSelectedFile(event.target.files[0]);
		setIsFilePicked(true);
    setShowButton(false);
	};

	return(
   <div style={props.style} className={props.className}>
			<input 
        type="file" 
        name="file" 
        accept='.json,.geojson'
        onChange={changeHandler}
        className='upload'
      />

      <button style={{ width: '100%' }} className={props.className} disabled={showButton} onClick={showGeoJSON}>
        Show GeoJSON to map
      </button>

		</div>
	)
}

// Calculate
function Calculate(){
  const [disabled, setDisabled] = useState(true);

  useEffect(() => {
    setCalculateDisabled = setDisabled;
  });

  function clickCalculate(){
    loadingScreen('block');

		// Delete all current image
		Image.clearLayers();

    const options = {
      method: 'POST',
      body: JSON.stringify(Data.toGeoJSON(false)),
      headers: { 'Content-Type': 'application/json'}
    }

    fetch('/api/image', options)
      .then(response => response.json())
      .then(data => data.urlFormat)
      .then(url => {
        const tile = L.tileLayer(url);
        tile.on('loading', () => loadingScreen('block'));
        tile.on('load', () => loadingScreen('none'));
        return tile;
      })
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
  return (
    <div id='map' />
  )
}

// ** Functions ** //

// LeafletMap run
function mountMap () {
  if (Map === undefined) {

    require('leaflet-draw');

    Map = L.map('map', {
      center: [-0.559, 101.897],
      zoom: 6,
    });
  
    L.tileLayer("https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
    }).addTo(Map);
  
    Data = L.geoJSON().addTo(Map);
    Image = L.featureGroup().addTo(Map);
    
    Draw = new L.Control.Draw({
      edit: {
        featureGroup: Data,
      },
      draw: {
        marker: false,
        polyline: false,
        circlemarker: false
      }
    })

    Map.addControl(Draw);
  
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
    });
  }
}

// Show SHP to map button
function showSHP(){
  const body = new FormData();
  body.append("file", SHPFile);

  let options = {
    method: 'POST',
    body: body
  };

  fetch('/api/shp', options)
    .then(response => response.json())
    .then(geojson => toMap(geojson));

  setCalculateDisabled(false);
}

// Show KML file to map
function showKML(){
  new Promise(resolve => resolve(KMLFile.text()))
    .then(text => new DOMParser().parseFromString(text, 'application/xml'))
    .then(xml => kml(xml))
    .then(geojson => toMap(geojson))
    .catch(err => alert(err));

  setCalculateDisabled(false);
}

// Show KML file to map
async function showGeoJSON(){
  new Promise(resolve => resolve(GeoJSONFile.text()))
    .then(text => JSON.parse(text))
    .then(geojson => toMap(geojson))
    .catch(err => alert(err));
  
  setCalculateDisabled(false);
}

// Function to show added geo data to map
function toMap(geojson){
  // Delete current data on Map
  removeAoi();

  // Simplify geometries and delete unecessary data
  geojson.features.map(data => data.properties = null);
  let simplify = turf.simplify(geojson, { tolerance: 0.001, mutate: true });
  simplify = simplify.features.length > 1 ? simplify = turf.dissolve(simplify) : simplify;

  // Add json layer to Data
  Data.addData(simplify);

  // Get map centroid
  const center = turf.centroid(simplify).geometry.coordinates;
  Map.setView([center[1], center[0]], 10, { animate: true });
};

// Remove all AOI function
function removeAoi() {
  Data.clearLayers();
}

// ** Functions ** //