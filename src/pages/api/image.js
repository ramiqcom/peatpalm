import ee from '@google/earthengine';
import privateKey from './privateKey.json';

export default function handler (req, res) {
    ee.data.authenticateViaPrivateKey(
				privateKey, () => {
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
			new Promise((resolve, reject) => resolve(req.body))
				.then(json => ee.FeatureCollection(json))
				.then(features => features.geometry())
				.then(geometry => ee.Image('projects/ee-ramiqcom-asean/assets/landsat/landsat_sumatera_2020').clip(geometry))
				.then(image => stretch(image, ['B5', 'B6', 'B2'], 0.1, 99.9, 30).evaluate(vis => image.getMap(vis, data => res.status(200).send(data))))
				.catch(err => res.status(404).send({ message: err }));
		}

		// Function to get min max of data
    function stretch(image, bands, min=2, max=98, scale=100) {
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