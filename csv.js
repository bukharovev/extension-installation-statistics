import csv from 'csvtojson';
import { getName as getCountryName } from 'country-list';
import { tier1CountriesListByName, tier2CountriesListByName, tier3CountriesListByName } from './countries.constant.js';

const convert = async (pathToCSV) => {
  const tableJSON = await csv().fromFile(pathToCSV);
  const result = {};

  const countriesByField = Object.entries(tableJSON[0])
    .map(([fieldName, _countryName]) => fieldName);

  const countriesFieldToCountryMap = Object.entries(tableJSON[0])
    .reduce(
      (acc, [fieldNum, countryName]) =>
        Object.assign(acc, { [fieldNum]: countryName }),
      {},
    );
  for (const [index, item] of tableJSON.entries()) {
    if (index === 0) continue;
    const fields = Object.entries(item);
    fields.map(([key, value]) => {
      if (countriesByField.includes(key)) {
        result[key] = result[key] ? result[key] + Number(value) : Number(value);
      }
    });
  }

  return Object.entries(result).reduce((acc, [key, value]) => {
    const countryCode = countriesFieldToCountryMap[key];
    const countryName = getCountryName(countryCode) ?? countryCode;
    if (countryName !== 'Date') acc[countryName] = value;
    return acc;
  }, {});
};

const countByCountryTier = async (
  installsByCountries,
  uninstallsByCountries,
  countriesListByName,
) => {
  const result = Object.entries(installsByCountries)
    .filter(([countryName, _numOfInstalls]) =>
      countriesListByName.includes(countryName),
    )
    .reduce((acc, [countryName, numOfInstalls]) => {
      // if (!uninstallsByCountries[countryName]) {
      //   console.log({ [countryName]: installsByCountries[countryName] })
      // }
      const numOfUninstalls = uninstallsByCountries[countryName] || 0;
      acc[countryName] = numOfInstalls - numOfUninstalls;
      return acc;
    }, {});


  const sum = Object.values(result).reduce((acc, num) => (acc += num), 0);
  return [result, sum];
};

export const countAllCountries = async (installsPath, uninstallsPath) => {
  const installs = await convert(installsPath);
  const uninstalls = await convert(uninstallsPath);

  const installsSum = Object.values(installs).reduce((acc, num) => (acc += num), 0);
  const uninstallsSum = Object.values(uninstalls).reduce((acc, num) => (acc += num), 0);

  const test1 = Object.entries(installs).filter(([countryName, uninstalls]) => !tier1CountriesListByName.includes(countryName) && !tier2CountriesListByName.includes(countryName) && !tier3CountriesListByName.includes(countryName));
  const test2 = Object.entries(uninstalls).filter(([countryName, uninstalls]) => !tier1CountriesListByName.includes(countryName) && !tier2CountriesListByName.includes(countryName) && !tier3CountriesListByName.includes(countryName));
  console.log('test installs = ', test1);
  console.log('test uninstalls = ', test2);

  const [tier1Result, tier1Sum] = await countByCountryTier(
    installs,
    uninstalls,
    tier1CountriesListByName,
  );

  const [tier2Result, tier2Sum] = await countByCountryTier(
    installs,
    uninstalls,
    tier2CountriesListByName,
  );

  const [tier3Result, tier3Sum] = await countByCountryTier(
    installs,
    uninstalls,
    tier3CountriesListByName,
  );

  const total = tier1Sum + tier2Sum + tier3Sum;

  // console.log({ installs, uninstalls })
  // console.log({ tier1Result, tier2Result, tier3Result })
  console.log({ tier1Sum, tier2Sum, tier3Sum, total })
  console.log({ installsSum, uninstallsSum, result: installsSum - uninstallsSum })
};
