import Head from 'next/head';
import { useState, useEffect, useRef } from 'react';
import Select from 'react-select';
import Script from 'next/script';
import * as turf from '@turf/turf';
import { kml } from "@tmcw/togeojson";
import { Chart } from "react-google-charts";

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
let setChartCover;
let setChartPop;
let setChartGDP;
let setDownloadShow;
let setDownloadLink;

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

// Checkbox class
function Checkbox(props) {
  return (
    <label>
      <input type='checkbox' checked={props.checked} onChange={props.onChange} style={props.style} id={props.id} className='checkbox' />
      {props.label}
    </label>
  );
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
  const [downloadDisplay, setDownloadDisplay] = useState('none');
  const [downloadUrl, setDownloadUrl] = useState(null);

  useEffect(() => {
    loadingScreen = setLoading;
    setDownloadShow = setDownloadDisplay;
    setDownloadLink = setDownloadUrl;
  })

  return (
    <div id='info' className='side'>

      <div className='section' style={{ display: loading, textAlign: 'center', fontSize: 'x-large', color: 'blue', fontWeight: 'bold' }}>
        Loading...
      </div>

      <div className='section' style={{ display: downloadDisplay }}>
        <a href={downloadUrl} download='data.csv'>
          <button className='input'>
            Download Data
          </button>
        </a>
      </div>

      <ChartInfo />

    </div>
  )
}

function ChartInfo() {
  const [dataCover, setDataCover] = useState([
    ['Year', 'Peatland', 'Palm Oil'],
    ['1990', 0, 0],
    ['1995', 0, 0],
    ['2000', 0, 0],
    ['2005', 0, 0],
    ['2010', 0, 0],
    ['2015', 0, 0],
    ['2020', 0, 0],
  ]);

  const optionsCover = {
    title: "Peatland vs Palm Oil Area (Ha)",
    curveType: "function",
    legend: { position: "bottom" },
  };

  const [dataPop, setDataPop] = useState([
    ['Year', 'Population'],
    ['1975', 0],
    ['1990', 0],
    ['2000', 0],
    ['2015', 0]
  ]);

  const optionsPop = {
    title: "Population",
    curveType: "function",
    legend: { position: "bottom" },
  };

  const [dataGDP, setDataGDP] = useState([
    ['Year', 'GDP PPP'],
    ['1990', 0],
    ['1991', 0],
    ['1992', 0],
    ['1993', 0],
    ['1994', 0],
    ['1995', 0],
    ['1996', 0],
    ['1997', 0],
    ['1998', 0],
    ['1999', 0],
    ['2000', 0],
    ['2001', 0],
    ['2002', 0],
    ['2003', 0],
    ['2004', 0],
    ['2005', 0],
    ['2006', 0],
    ['2007', 0],
    ['2008', 0],
    ['2009', 0],
    ['2010', 0],
    ['2011', 0],
    ['2012', 0],
    ['2013', 0],
    ['2014', 0],
    ['2015', 0]
  ]);

  const optionsGDP = {
    title: "GDP PPP (Million US Dollar)",
    curveType: "function",
    legend: { position: "bottom" },
  };

  useEffect(() => {
    setChartCover = setDataCover;
    setChartPop = setDataPop;
    setChartGDP = setDataGDP;
  })

  return (
    <div style={{ width: '100%', height: '100%', margin: '0' }}>

      <Chart
        chartType='LineChart'
        width="100%"
        height="30vh"
        data={dataCover}
        options={optionsCover}
      />

      <Chart
        chartType='LineChart'
        width="100%"
        height="30vh"
        data={dataPop}
        options={optionsPop}
      />

      <Chart
        chartType='LineChart'
        width="100%"
        height="30vh"
        data={dataGDP}
        options={optionsGDP}
      />

    </div>
  )
}

// Legend
function Legend(){
  const label = ['Dryland forest', 'Peat swamp forest', 'Mangrove forest',
    'Cropland', 'Palm oil', 'Grassland', 'Peatland',
    'Built-up', 'Bareland', 'Other woody vegetation', 'Water bodies'];

  const palette = ['228B22', '808000','7B68EE', 
    'FFD700', 'D2691E', '7CFC00', '20B2AA',
    'DB7093', 'FFE4B5', '8FBC8F', '87CEFA'];

  return (
    <div className='section'>

      <div style={{ fontSize: '12px', border: '1px solid black', padding: '10px', margin: '10px 0' }}>
        <div style={{ fontSize: '15px', fontWeight: 'bold', textAlign: 'center',  margin: '0 0 10px' }}>
          Land Cover
        </div>
        <div style={{ display: 'block' }}>
          {
            label.map((value, index) => 
              <div style={{ margin: '2px auto', display: 'flex', alignItems: 'flex-start' }} key={index}>
                <div style={{ width: '30px', height: '20px', background: '#' + palette[index] }} />
                &nbsp; &nbsp;
                {value}
              </div>)
          }
        </div>
      </div>

    </div>
  )
}

// Layer list
function Layers(){
  // LC 2020 variable
  const [lc2020, setLc2020] = useState(true);
  function lc2020Change(event){
    const status = event.target.checked;
    setLc2020(status);
    const tile = Image.getLayers()[6];
    status === true ? tile.setOpacity(1) : tile.setOpacity(0);
  };

  // LC 2015 variable
  const [lc2015, setLc2015] = useState(false);
  function lc2015Change(event){
    const status = event.target.checked;
    setLc2015(status);
    const tile = Image.getLayers()[5];
    status === true ? tile.setOpacity(1) : tile.setOpacity(0);
  };

  // LC 2010 variable
  const [lc2010, setLc2010] = useState(false);
  function lc2010Change(event){
    const status = event.target.checked;
    setLc2010(status);
    const tile = Image.getLayers()[4];
    status === true ? tile.setOpacity(1) : tile.setOpacity(0);
  };

  // LC 2010 variable
  const [lc2005, setLc2005] = useState(false);
  function lc2005Change(event){
    const status = event.target.checked;
    setLc2005(status);
    const tile = Image.getLayers()[3];
    status === true ? tile.setOpacity(1) : tile.setOpacity(0);
  };

  // LC 2010 variable
  const [lc2000, setLc2000] = useState(false);
  function lc2000Change(event){
    const status = event.target.checked;
    setLc2000(status);
    const tile = Image.getLayers()[2];
    status === true ? tile.setOpacity(1) : tile.setOpacity(0);
  };

  // LC 2010 variable
  const [lc1995, setLc1995] = useState(false);
  function lc1995Change(event){
    const status = event.target.checked;
    setLc1995(status);
    const tile = Image.getLayers()[1];
    status === true ? tile.setOpacity(1) : tile.setOpacity(0);
  };

  // LC 2010 variable
  const [lc1990, setLc1990] = useState(false);
  function lc1990Change(event){
    const status = event.target.checked;
    setLc1990(status);
    const tile = Image.getLayers()[0];
    status === true ? tile.setOpacity(1) : tile.setOpacity(0);
  };

  return (
    <div className='section' style={{ border: '1px solid black' }}>

      <div style={{ fontSize: '15px', fontWeight: 'bold', textAlign: 'center', margin: '2% auto' }}>
        Layers
      </div>

      <div style={{ margin: '2%', display: 'flex', flexDirection: 'column'  }}>
        <Checkbox label='Land Cover 2020' checked={lc2020} onChange={lc2020Change} />
        <Checkbox label='Land Cover 2015' checked={lc2015} onChange={lc2015Change} />
        <Checkbox label='Land Cover 2010' checked={lc2010} onChange={lc2010Change} />
        <Checkbox label='Land Cover 2005' checked={lc2005} onChange={lc2005Change} />
        <Checkbox label='Land Cover 2000' checked={lc2000} onChange={lc2000Change} />
        <Checkbox label='Land Cover 1995' checked={lc1995} onChange={lc1995Change} />
        <Checkbox label='Land Cover 1990' checked={lc1990} onChange={lc1990Change} />
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
      <Layers />
      <Legend />
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

      <button className='input' id='removeAoi' onClick={removeAoi} style={{ color: 'red', margin: '5% auto' }}>
        Remove AOI
      </button>

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

    const options = {
      method: 'POST',
      body: JSON.stringify(Data.toGeoJSON(false)),
      headers: { 'Content-Type': 'application/json'}
    }

    fetch('/api/calculate', options)
      .then(response => response.json())
      .then(result => {       
        const peatpalm = result.peatpalm;
        setChartCover([
          ['Year', 'Peatland', 'Palm Oil'],
          ['1990', peatpalm[0].peat, peatpalm[0].palm],
          ['1995', peatpalm[1].peat, peatpalm[1].palm],
          ['2000', peatpalm[2].peat, peatpalm[2].palm],
          ['2005', peatpalm[3].peat, peatpalm[3].palm],
          ['2010', peatpalm[4].peat, peatpalm[4].palm],
          ['2015', peatpalm[5].peat, peatpalm[5].palm],
          ['2020', peatpalm[6].peat, peatpalm[6].palm]
        ])

        const pop = result.pop;
        setChartPop([
          ['Year', 'Population'],
          ['1975', pop[0].population],
          ['1990', pop[1].population],
          ['2000', pop[2].population],
          ['2015', pop[3].population],
        ])

        const gdp = result.gdp;
        setChartGDP([
          ['Year', 'GDP PPP'],
          ['1990', gdp[0].gdpPPP],
          ['1991', gdp[1].gdpPPP],
          ['1992', gdp[2].gdpPPP],
          ['1993', gdp[3].gdpPPP],
          ['1994', gdp[4].gdpPPP],
          ['1995', gdp[5].gdpPPP],
          ['1996', gdp[6].gdpPPP],
          ['1997', gdp[7].gdpPPP],
          ['1998', gdp[8].gdpPPP],
          ['1999', gdp[9].gdpPPP],
          ['2000', gdp[10].gdpPPP],
          ['2001', gdp[11].gdpPPP],
          ['2002', gdp[12].gdpPPP],
          ['2003', gdp[13].gdpPPP],
          ['2004', gdp[14].gdpPPP],
          ['2005', gdp[15].gdpPPP],
          ['2006', gdp[16].gdpPPP],
          ['2007', gdp[17].gdpPPP],
          ['2008', gdp[18].gdpPPP],
          ['2009', gdp[19].gdpPPP],
          ['2010', gdp[20].gdpPPP],
          ['2011', gdp[21].gdpPPP],
          ['2012', gdp[22].gdpPPP],
          ['2013', gdp[23].gdpPPP],
          ['2014', gdp[24].gdpPPP],
          ['2015', gdp[25].gdpPPP]
        ]);

        const arrayTable = [
          ['Year', 'GDP PPP', 'Population', 'Peatland', 'Palm Oil'],
          ['1975', null, pop[0].population, null, null],
          ['1990', gdp[0].gdpPPP, pop[1].population, peatpalm[0].peat, peatpalm[0].palm],
          ['1991', gdp[1].gdpPPP, null, null, null],
          ['1992', gdp[2].gdpPPP, null, null, null],
          ['1993', gdp[3].gdpPPP, null, null, null],
          ['1994', gdp[4].gdpPPP, null, null, null],
          ['1995', gdp[5].gdpPPP, null, peatpalm[1].peat, peatpalm[1].palm],
          ['1996', gdp[6].gdpPPP, null, null, null],
          ['1997', gdp[7].gdpPPP, null, null, null],
          ['1998', gdp[8].gdpPPP, null, null, null],
          ['1999', gdp[9].gdpPPP, null, null, null],
          ['2000', gdp[10].gdpPPP, pop[2].population, peatpalm[2].peat, peatpalm[2].palm],
          ['2001', gdp[11].gdpPPP, null, null, null],
          ['2002', gdp[12].gdpPPP, null, null, null],
          ['2003', gdp[13].gdpPPP, null, null, null],
          ['2004', gdp[14].gdpPPP, null, null, null],
          ['2005', gdp[15].gdpPPP, null, peatpalm[3].peat, peatpalm[3].palm],
          ['2006', gdp[16].gdpPPP, null, null, null],
          ['2007', gdp[17].gdpPPP, null, null, null],
          ['2008', gdp[18].gdpPPP, null, null, null],
          ['2009', gdp[19].gdpPPP, null, null, null],
          ['2010', gdp[20].gdpPPP, null, peatpalm[4].peat, peatpalm[4].palm],
          ['2011', gdp[21].gdpPPP, null, null, null],
          ['2012', gdp[22].gdpPPP, null, null, null],
          ['2013', gdp[23].gdpPPP, null, null, null],
          ['2014', gdp[24].gdpPPP, null, null, null],
          ['2015', gdp[25].gdpPPP, pop[3].population, peatpalm[5].peat, peatpalm[5].palm],
          ['2020', null, null, peatpalm[6].peat, peatpalm[6].palm]
        ];

        // Data Table (TODO)
        let csv = arrayTable.map(arr => arr.toString()).join('\n');
        let encodedUri = 'data:application/csv;charset=utf-8,' + encodeURIComponent(csv);
        setDownloadShow('block');
        setDownloadLink(encodedUri);
      })
      .then(() => loadingScreen('none'))

      /*
      .then(data => data.urlFormat)
      .then(url => {
        const tile = L.tileLayer(url);
        tile.on('loading', () => loadingScreen('block'));
        tile.on('load', () => loadingScreen('none'));
        return tile;
      })
      .then(tile => tile.addTo(Image))
      */

      .catch(err => alert(err));
  }

  return (
    <div id='calculate' className='section'>
      <button className='input' onClick={clickCalculate} disabled={disabled} style={{ color: 'green' }}>
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
  
    L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    }).addTo(Map);
  
    Data = L.geoJSON([], {
      style: {
        color: 'red'
      }
    }).addTo(Map);

    const tileUrls = [ 
      'https://storage.googleapis.com/gee-maptile/asean/lc_sumatera_1990/{z}/{x}/{y}',
      'https://storage.googleapis.com/gee-maptile/asean/lc_sumatera_1995/{z}/{x}/{y}',
      'https://storage.googleapis.com/gee-maptile/asean/lc_sumatera_2000/{z}/{x}/{y}',
      'https://storage.googleapis.com/gee-maptile/asean/lc_sumatera_2005/{z}/{x}/{y}',
      'https://storage.googleapis.com/gee-maptile/asean/lc_sumatera_2010/{z}/{x}/{y}',
      'https://storage.googleapis.com/gee-maptile/asean/lc_sumatera_2015/{z}/{x}/{y}',
      'https://storage.googleapis.com/gee-maptile/asean/lc_sumatera_2020/{z}/{x}/{y}'
    ].map((url, index) => index == 6 ? L.tileLayer(url, { minZoom: 0, maxZoom: 12 }) : L.tileLayer(url, { minZoom: 0, maxZoom: 12, opacity: 0 }));

    Image = L.featureGroup(tileUrls).addTo(Map);
    
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
      if (Object.keys(Data.getLayers()).length) {
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
    .then(geojson => toMap(geojson))
    .then(() =>   setCalculateDisabled(false))
    .catch(err => alert(err));

}

// Show KML file to map
function showKML(){
  new Promise(resolve => resolve(KMLFile.text()))
    .then(text => new DOMParser().parseFromString(text, 'application/xml'))
    .then(xml => kml(xml))
    .then(geojson => toMap(geojson))
    .then(() => setCalculateDisabled(false))
    .catch(err => alert(err));
}

// Show KML file to map
async function showGeoJSON(){
  new Promise(resolve => resolve(GeoJSONFile.text()))
    .then(text => JSON.parse(text))
    .then(geojson => toMap(geojson))
    .then(() => setCalculateDisabled(false))
    .catch(err => alert(err));
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
  setCalculateDisabled(true);
}

// ** Functions ** //