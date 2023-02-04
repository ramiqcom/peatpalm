import ee from '@google/earthengine';

export default function handler (req, res) {
  const eeKey = JSON.parse(process.env.EE_KEY);

  ee.data.authenticateViaPrivateKey(
    eeKey, () => {
      console.log('Authentication success');
      ee.initialize(
        null, 
        null, 
        () => {
          console.log('Initialization success');
          init();
        },
      (err) => console.log(err));
    }, 
    (err) => console.log(err)
  );

  function init(){
    // Import data
    const lc1990 = ee.Image('projects/ee-ramiqcom-asean/assets/landcover/LC_sumatera_1990').set('system:time_start', ee.Date('1990-01-01'), 'system:time_end', ee.Date('1990-12-31'));
    const lc1995 = ee.Image('projects/ee-ramiqcom-asean/assets/landcover/LC_sumatera_1995').set('system:time_start', ee.Date('1995-01-01'), 'system:time_end', ee.Date('1995-12-31'));
    const lc2000 = ee.Image('projects/ee-ramiqcom-asean/assets/landcover/LC_sumatera_2000').set('system:time_start', ee.Date('2000-01-01'), 'system:time_end', ee.Date('2000-12-31'));
    const lc2005 = ee.Image('projects/ee-ramiqcom-asean/assets/landcover/LC_sumatera_2005').set('system:time_start', ee.Date('2005-01-01'), 'system:time_end', ee.Date('2005-12-31'));
    const lc2010 = ee.Image('projects/ee-ramiqcom-asean/assets/landcover/LC_sumatera_2010').set('system:time_start', ee.Date('2010-01-01'), 'system:time_end', ee.Date('2010-12-31'));
    const lc2015 = ee.Image('projects/ee-ramiqcom-asean/assets/landcover/LC_sumatera_2015').set('system:time_start', ee.Date('2015-01-01'), 'system:time_end', ee.Date('2015-12-31'));
    const lc2020 = ee.Image('projects/ee-ramiqcom-asean/assets/landcover/LC_sumatera_2020').set('system:time_start', ee.Date('2020-01-01'), 'system:time_end', ee.Date('2020-12-31'));
    const gdp = ee.Image("projects/sat-io/open-datasets/GRIDDED_HDI_GDP/GDP_PPP_1990_2015_5arcmin_v2");

    // Add images into a single collection
    const lc = [lc1990, lc1995, lc2000, lc2005, lc2010, lc2015, lc2020];

    // AOI
    const aoi = ee.FeatureCollection(req.body).geometry();

		// Calculate the area
    const dict = ee.List(lc.map((image, index) => {

			const date = ee.Date(image.get('system:time_start'));
  
      const peatArea = ee.Number(image.eq(21).or(image.eq(22)).or(image.eq(70))
        .reduceRegion(ee.Reducer.sum(), aoi, 1000, 'EPSG:4326', null, true)
        .get('LULC')).multiply(0.09).multiply(1111).ceil();

      const palmArea = ee.Number(image.eq(50)
      .reduceRegion(ee.Reducer.sum(), aoi, 1000, 'EPSG:4326', null, true)
      .get('LULC')).multiply(0.09).multiply(1111).ceil();
      
      return ee.Dictionary({ peat: peatArea, palm: palmArea, date: date.millis(), index: index, year: date.get('year') });
		}));

    // Calculate population
    const pop = ee.List([
      ee.Image('JRC/GHSL/P2016/POP_GPW_GLOBE_V1/1975'),
      ee.Image('JRC/GHSL/P2016/POP_GPW_GLOBE_V1/1990'),
      ee.Image('JRC/GHSL/P2016/POP_GPW_GLOBE_V1/2000'),
      ee.Image('JRC/GHSL/P2016/POP_GPW_GLOBE_V1/2015'),
    ].map((data, index) => {

      const date = ee.Date(data.get('system:time_start'));

      const popSize = ee.Number(data
        .reduceRegion(ee.Reducer.sum(), aoi, 250, 'EPSG:4326', null, true)
        .get('population_count')).ceil();

      return ee.Dictionary({ population: popSize, date: date.millis(), index: index, year: date.get('year') });
    }));

    const gdpPerCapita = ee.List(["b1","b2","b3","b4","b5","b6","b7","b8","b9","b10","b11","b12","b13","b14","b15","b16","b17","b18","b19","b20","b21","b22","b23","b24","b25","b26"]
      .map((band, index) => {
        const date = ee.Date(ee.String(1990 + index + '-01-01'));

        const popSize = ee.Number(gdp.select(band)
          .reduceRegion(ee.Reducer.sum(), aoi, 1000, 'EPSG:4326', null, true)
          .get(band)).divide(1000000).ceil();

        return ee.Dictionary({ gdpPPP: popSize, index: index, date: date.millis(), year: date.get('year') });
      }
    ));

    // Final data to send to client
    const final = ee.Dictionary({
      pop: pop,
      peatpalm: dict,
      gdp: gdpPerCapita
    });

    new Promise(resolve => resolve(final))
      .then(dict => dict.evaluate(data => res.status(200).send(data)))
      .catch(err => res.status(404).send({ message: err }))
  }
}