/**
 * Search Weather Endpoint (idk if this api is accurate or not lmao-)
 */
// REQUIRED DEPENDENCY //
import express from "express";
import axios from "axios";
import fs from "fs";
import path from "path";

// OPTIONAL DEPENDENCY //
import chalk from "chalk";

// VARIABLES //
const rt = express.Router();
const ERR = JSON.parse(fs.readFileSync(path.resolve("./src/api/v1/config/ErrorType.json"), "utf-8"));

// SEARCH ENDPOINT //
rt.get("/", async (req, res) => {
  const srchQuery = req.query.citySrch; // fetch the search query parameter
  if (!srchQuery) {
    const { HTTP_ERR_CODE, ERR_MESSAGE } = ERR.CITY_QUERY_MISSING
    res.status(HTTP_ERR_CODE).json({ "HTTP_ERR_CODE": HTTP_ERR_CODE, "ERR_MESSAGE": ERR_MESSAGE });
    console.log(chalk.red(`[-] Search/Autocomplete Endpoint: ${ERR_MESSAGE}`));
    return;
  };

  try {
    const geoRes = await axios.get(
      "https://nominatim.openstreetmap.org/search",
      {
        params: {
          q: srchQuery, // I TRIED TO USE OTHER NAME FOR "Q" AS QUERY BUT THAT GODDAMN API DIDN'T LIKE IT
          format: "json",
          limit: 5,
        },
      }
    );

    const locations = geoRes.data.map((loc) => ({
      name: loc.display_name,
      lat: loc.lat,
      lon: loc.lon,
    }));

    console.log(
      chalk.blue(`[i] Search results for query: ${srchQuery}`)
    );
    res.status(200).json({ results: locations });
  } catch (srchErr) {
    const { HTTP_ERR_CODE, ERR_MESSAGE } = ERR.API_FETCH_FAILED
    res.status(HTTP_ERR_CODE).json({ "HTTP_ERR_CODE": HTTP_ERR_CODE, "ERR_": { "ERR_MESSAGE": ERR_MESSAGE, "ERR_REASON": srchErr.toString() } });
    console.log(
      chalk.red(
        `[-] Search/Autocomplete Endpoint: ${q}: ${srchErr}`
      )
    );
  }
});


export default rt;