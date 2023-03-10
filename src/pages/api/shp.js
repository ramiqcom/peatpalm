// Convert shp to geojson

// Import module
import * as turf from '@turf/turf';
import * as shapefileToGeojson from "shapefile-to-geojson";
import formidable from 'formidable';
import fs from 'fs';
import decompress from 'decompress';

// Disabled body parser
export const config = {
	api: {
    bodyParser: false,
    responseLimit: '8mb',
	}
};

// Main function for API
export default function handler(req, res){
  const form = new formidable.IncomingForm();

  form.parse(req, (err, fields, files) => {
    const path = files.file.filepath;
    const newPath = path + '.zip';

    fs.rename(path, newPath, (err) => {
      decompress(newPath, path)
        .then(() => {
          new Promise((resolve, reject) => resolve(shapefileToGeojson.parseFolder(path)))
            .then(data => { 
              data.features.map(data => data.properties = null);
              return data
            })
            .then(geojson => turf.simplify(geojson, {tolerance: 0.001, mutate: true}))
            .then(simplify => simplify.features.length > 1 ? turf.dissolve(simplify) : simplify)
            .then(dissolve => res.status(200).send(dissolve))
            .catch(err => res.status(404).send({ message: err }))
            
        });
    })
  });
}