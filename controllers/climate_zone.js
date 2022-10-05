// importing packages
const express = require('express');
// const router = express.Router();
const fetch = (...args) =>
	import('node-fetch').then(({default: fetch}) => fetch(...args));

const get_climate_zone = async (req, res) => {
  // console.log('req.auth._id', req.auth._id);
  // console.log('latitude', req.query.latitude)
  // console.log('longitude', req.query.longitude)
  // console.log(req.body)
  const latitude =req.params.latitude;
  const longitude = req.params.longitude;
  // const { latitude, longitude } = req.query;
  // console.log('req.query latitude', latitude)
  // console.log('req.query longitude', longitude)
	const url =
		`http://climateapi.scottpinkelman.com/api/v1/location/${latitude}/${longitude}`;
	const options = {
		method: 'GET',
		headers: {
      'Content-Type': 'application/json',
		}
	};
	try {
		let response = await fetch(url);
		climateZone = await response.json();
    console.log('climateZone', climateZone)
		res.status(200).json({climateZone});
	} catch (err) {
		console.log(err);
		res.status(500).json({msg: `Internal Server Error.`});
	}
};
module.exports = { get_climate_zone };