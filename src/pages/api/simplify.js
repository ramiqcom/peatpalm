import * as turf from 'turf';

export default function handler (req, res) {
    new Promise((resolve, reject) => {
        resolve(req.body);
    })
        .then(geojson => turf.simplify(geojson, 0.0001))
        .then(simplify => res.status(200).send(simplify))
        .catch(err => res.status(404).send({ message: err }));
}