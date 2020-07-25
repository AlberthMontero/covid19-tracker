import React, { useState, useEffect } from 'react';
import {
  FormControl,
  Select,
  MenuItem,
  Card,
  CardContent
} from '@material-ui/core';
import Map from './Map';
import Table from './Table';
import InfoBox from './InfoBox';
import LineGraph from './LineGraph';
import { sortData, prettyPrintStats } from '../utils';
import 'leaflet/dist/leaflet.css';
import './App.css';

function App() {
  const [casesType, setCasesType] = useState('cases');
  const [country, setCountry] = useState('worldwide');
  const [countries, setCountries] = useState([]);
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [mapCenter, setMapCenter] = useState([34.80746, -40.4796]);
  const [mapZoom, setMapZoom] = useState(3);
  const [mapCountries, setMapCountries] = useState([]);

  useEffect(() => {
    fetch('https://disease.sh/v3/covid-19/all')
      .then(response => response.json())
      .then(data => {
        setCountryInfo(data);
      })
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    const getCountriesData = async () => {
      await fetch('https://disease.sh/v3/covid-19/countries')
        .then(response => response.json())
        .then(data => {
          const countries = data.map(country => ({
            name: country.country,
            value: country.countryInfo.iso2
          }));

          const sortedData = sortData(data);
          setTableData(sortedData);
          setCountries(countries);
          setMapCountries(data);
        })
        .catch(err => {
          console.error(err);
        });
    };

    getCountriesData();
  }, []);

  const onCountryChange = event => {
    const countryCode = event.target.value;
    setCountry(countryCode);

    const url =
      countryCode === 'worldwide'
        ? 'https://disease.sh/v3/covid-19/all'
        : `https://disease.sh/v3/covid-19/countries/${countryCode}`;

    fetch(url)
      .then(response => response.json())
      .then(data => {
        setCountry(countryCode);
        setCountryInfo(data);
        setMapZoom(4);
        setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
      })
      .catch(err => console.error(err));
  };

  return (
    <div className="app">
      <div className="app__left">
        <div className="app__header">
          <h1>COVID-19 TRACKER</h1>
          <FormControl className="app__dropdown">
            <Select
              variant="outlined"
              onChange={onCountryChange}
              value={country}
            >
              <MenuItem value="worldwide">Worldwide</MenuItem>
              {countries.map((country, idx) => (
                <MenuItem key={idx} value={country.value}>
                  {country.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        <div className="app__stats">
          <InfoBox
            isRed
            onClick={event => setCasesType('cases')}
            active={casesType === 'cases'}
            title="Coronavirus Cases"
            cases={prettyPrintStats(countryInfo.todayCases)}
            total={prettyPrintStats(countryInfo.cases)}
          />
          <InfoBox
            onClick={event => setCasesType('recovered')}
            active={casesType === 'recovered'}
            title="Recovered"
            cases={prettyPrintStats(countryInfo.todayRecovered)}
            total={prettyPrintStats(countryInfo.recovered)}
          />
          <InfoBox
            isRed
            active={casesType === 'deaths'}
            onClick={event => setCasesType('deaths')}
            title="Deaths"
            cases={prettyPrintStats(countryInfo.todayDeaths)}
            total={prettyPrintStats(countryInfo.deaths)}
          />
        </div>

        <Map
          casesType={casesType}
          countries={mapCountries}
          center={mapCenter}
          zoom={mapZoom}
        />
      </div>
      <Card className="app__right">
        <CardContent>
          <h3>Live Cases by Country</h3>
          <Table countries={tableData} />
          <h3 className="app_graphTitle">Worldwide new {casesType}</h3>
          <LineGraph className="app__lineGraph" casesType={casesType} />
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
