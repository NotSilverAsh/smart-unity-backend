/**
 * Weather Endpoint with Wind Speed & Air Quality (placeholder)
 */
import express from "express";
import fs from "fs";
import path from "path";
import chalk from "chalk";

const rt = express.Router();
const ERR = JSON.parse(
  fs.readFileSync(path.resolve("./src/api/v1/config/ErrorType.json"), "utf-8")
);

rt.get("/", async (req, res) => {
  const { lat, lon, date } = req.query;

  if (!lat || !lon || !date) {
    const { HTTP_ERR_CODE, ERR_MESSAGE } = ERR.QUERY_MISSING_ERR;
    res.status(HTTP_ERR_CODE).json({ HTTP_ERR_CODE, ERR_MESSAGE });
    console.log(
      chalk.red(
        `[-] Weather Endpoint: HTTP_Code: ${HTTP_ERR_CODE}, ERR_MSG: ${ERR_MESSAGE}`
      )
    );
    return;
  }

  const selectedDate = new Date(date);
  if (isNaN(selectedDate.getTime())) {
    res.status(400).json({
      HTTP_ERR_CODE: 400,
      ERR_MESSAGE: "Invalid date format. Use YYYY-MM-DD.",
    });
    return;
  }

  const dayOfYear =
    Math.floor(
      (selectedDate.getTime() -
        new Date(selectedDate.getFullYear(), 0, 0).getTime()) /
        (1000 * 60 * 60 * 24)
    ) || 1;

  const startYear = (new Date().getFullYear() - 30).toString();
  const endYear = new Date().getFullYear().toString();

  try {
    // NASA POWER daily fetch with max temp, precipitation, and wind speed
    const NASA_POWER_URL = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M_MAX,PRECTOTCORR,WS10M&community=RE&longitude=${lon}&latitude=${lat}&start=${startYear}0101&end=${endYear}1231&format=JSON`;

    const POWER_RES = await fetch(NASA_POWER_URL);
    if (!POWER_RES.ok)
      throw new Error(`NASA POWER API Error: ${POWER_RES.statusText}`);

    const PowerData = await POWER_RES.json();
    const T2M = PowerData?.properties?.parameter?.T2M_MAX;
    if (!T2M)
      throw new Error("Invalid data structure fetched from NASA POWER API");

    const PREC = PowerData.properties.parameter.PRECTOTCORR || {};
    const WS = PowerData.properties.parameter.WS10M || {};

    const availableYears = Object.keys(T2M).map((d) =>
      parseInt(d.slice(0, 4), 10)
    );
    const maxYearAvailable = Math.max(...availableYears);

    const relevantData = Object.keys(T2M)
      .map((dateString) => {
        const current = new Date(
          dateString.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3")
        );
        const currentDayOfYear = Math.floor(
          (current.getTime() -
            new Date(current.getFullYear(), 0, 0).getTime()) /
            (1000 * 60 * 60 * 24)
        );
        return { date: dateString, dayOfYear: currentDayOfYear };
      })
      .filter((d) => Math.abs(d.dayOfYear - dayOfYear) <= 2) // ±2 days window
      .map(({ date }) => ({
        year: parseInt(date.substring(0, 4), 10),
        max_temp: parseFloat(T2M[date]),
        precipitation: PREC[date] ? parseFloat(PREC[date]) : null,
        wind_speed: WS[date] ? parseFloat(WS[date]) : null,
        air_quality: "N/A", // placeholder for now
      }))
      .filter(
        (d) =>
          d.max_temp > -900 &&
          (d.precipitation === null || d.precipitation > -900)
      )
      .filter((d) => d.year <= maxYearAvailable);

    if (relevantData.length === 0) {
      console.log(
        chalk.red(
          `[-] Weather Endpoint: No historical data for selected date/location.`
        )
      );
      res.status(404).json({
        HTTP_ERR_CODE: 404,
        ERR_MESSAGE:
          "No historical data found for the selected date and location.",
      });
      return;
    }

    const totalYears = relevantData.length;
    const avgMaxTemp =
      relevantData.reduce((sum, d) => sum + d.max_temp, 0) / totalYears;

    const yearsWPrecip = relevantData.filter(
      (d) => d.precipitation !== null && d.precipitation > 0.5
    ).length;
    const changeOfPrecip = (yearsWPrecip / totalYears) * 100;

    const extremeHeatThreshold = 35;
    const yearsWExtremeHeat = relevantData.filter(
      (d) => d.max_temp > extremeHeatThreshold
    ).length;
    const changeOfExtremeHeat = (yearsWExtremeHeat / totalYears) * 100;

    const windData = relevantData.filter((d) => d.wind_speed !== null);
    const avgWindSpeed =
      windData.length > 0
        ? windData.reduce((sum, d) => sum + (d.wind_speed || 0), 0) /
          windData.length
        : null;

    const dataAnalysis = {
      avgMaxTemp: avgMaxTemp.toFixed(1),
      changeOfPrecip: changeOfPrecip.toFixed(0),
      changeOfExtremeHeat: changeOfExtremeHeat.toFixed(0),
      avgWindSpeed: avgWindSpeed ? avgWindSpeed.toFixed(1) : "N/A",
      avgAirQuality: "N/A", // could integrate OpenAQ later
    };

    res.status(200).json({ dataAnalysis, rawData: relevantData });
    console.log(chalk.green(`[+] Weather Endpoint: Sent observation data.`));
  } catch (obsErr) {
    const { HTTP_ERR_CODE, ERR_MESSAGE } = ERR.API_FETCH_FAILED;
    res.status(HTTP_ERR_CODE).json({
      HTTP_ERR_CODE,
      ERR_MESSAGE: { ERR_MESSAGE, ERR_REASON: obsErr.toString() },
    });
    console.log(
      chalk.red(`[-] Weather Endpoint: Error: ${obsErr.message || obsErr}`)
    );
  }
});

export default rt;
