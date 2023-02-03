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
    const l8 = ee.ImageCollection("LANDSAT/LC08/C02/T1_L2");
    const l9 = ee.ImageCollection("LANDSAT/LC09/C02/T1_L2");

    // AOI
    const aoi = ee.FeatureCollection(req.body).geometry();

    const l8Filter = l8.filterBounds(aoi).filterDate('2022-01-01', '2022-12-31');
    const l9Filter = l9.filterBounds(aoi).filterDate('2022-01-01', '2022-12-31');
    const col = l8Filter.merge(l9Filter).map(cloudMask);
    const image = col.median().clip(aoi);

    stretch(image, ['SR_B5', 'SR_B6', 'SR_B2'])
      .evaluate(vis => image.getMap(vis, map => res.status(200).send(map)));
  }

  // Function for cloud mask
  function cloudMask (image) {
    const qa = image.select('QA_PIXEL');
    const dilated = 1 << 1;
    const cirrus = 1 << 2;
    const cloud = 1 << 3;
    const shadow = 1 << 4;

    const mask = qa.bitwiseAnd(dilated).eq(0)
      .and(qa.bitwiseAnd(cirrus).eq(0))
      .and(qa.bitwiseAnd(cloud).eq(0))
      .and(qa.bitwiseAnd(shadow).eq(0));

    return image.select(['SR_B.*']).updateMask(mask);
  }

  // Function to get min max of data
  function stretch (image, bands, min=2, max=98, scale=100) {
    const geometry = image.geometry();

    const reduce1 = image.select(bands[0]).reduceRegion({
        geometry: geometry,
        reducer: ee.Reducer.percentile([min, max]),
        scale: scale,
        bestEffort: true,
        maxPixels: 1e13
    });

    const reduce2 = image.select(bands[1]).reduceRegion({
        geometry: geometry,
        reducer: ee.Reducer.percentile([min, max]),
        scale: scale,
        bestEffort: true,
        maxPixels: 1e13
    });

    const reduce3 = image.select(bands[2]).reduceRegion({
        geometry: geometry,
        reducer: ee.Reducer.percentile([min, max]),
        scale: scale,
        bestEffort: true,
        maxPixels: 1e13
    });

    const min1 = ee.Number(reduce1.get(reduce1.keys().get(0)));
    const min2 = ee.Number(reduce2.get(reduce2.keys().get(0)));
    const min3 = ee.Number(reduce3.get(reduce3.keys().get(0)));

    const max1 = ee.Number(reduce1.get(reduce1.keys().get(1)));
    const max2 = ee.Number(reduce2.get(reduce2.keys().get(1)));
    const max3 = ee.Number(reduce3.get(reduce3.keys().get(1)));

    const vis = ee.Dictionary({
        bands: bands,
        min: [min1, min2, min3],
        max: [max1, max2, max3]
    });

    return vis;
  }
}