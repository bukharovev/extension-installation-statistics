import csv from 'csvtojson'
import { join } from 'path'

const tier1CountriesListByName = [
  'Australia',
  'Austria',
  'Belgium',
  'Canada',
  'Denmark',
  'Finland',
  'France',
  'Germany',
  'Ireland',
  'Italy',
  'Netherlands',
  'New Zealand',
  'Norway',
  'Spain',
  'Sweden',
  'Switzerland',
  'United Kingdom',
  'United States',
]

const convert = async (pathToCSV) => {
  const tableJSON = await csv().fromFile(pathToCSV)

  const result = {}
  const tier1CountriesListByField = Object.entries(tableJSON[0]).filter(
    ([_fieldNum, countryName]) => tier1CountriesListByName.includes(countryName)
  ).map(([fieldName, _countryName]) => fieldName)

  const tier1CountriesFieldNumToCountryMap = Object.entries(tableJSON[0]).filter(
    ([_fieldNum, countryName]) => tier1CountriesListByName.includes(countryName)
  ).reduce((acc, [fieldNum, countryName]) => (Object.assign(acc, { [fieldNum]: countryName })), {});

  for (const [index, item] of tableJSON.entries()) {
    if (index === 0) continue
    const fields = Object.entries(item)
    fields.map(([key, value]) => {
      if (tier1CountriesListByField.includes(key)) {
        result[key] = result[key] ? result[key] + Number(value) : Number(value)
      }
    })
  }

  return Object.entries(result).reduce((acc, [key, value]) => {
    const countryName = tier1CountriesFieldNumToCountryMap[key]
    acc[countryName] = value
    return acc
  }, {})
}

const installsPath = join('..', '..', 'Downloads', 'installs.csv')
const installs = await convert(installsPath)
// console.log('installs = ', installs);

const uninstallsPath = join('..', '..', 'Downloads', 'uninstalls.csv')
const uninstalls = await convert(uninstallsPath)
// console.log('uninstalls = ', uninstalls)

const result = Object.entries(installs).reduce((acc, [countryName, numOfInstalls]) => {
  const numOfUninstalls = uninstalls[countryName];
  acc[countryName] = numOfInstalls - numOfUninstalls
  return acc;
}, {});
const tier1CountriesUsers = Object.values(result).reduce((acc, num) => acc + num, 0);