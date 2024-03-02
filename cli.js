#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { countAllCountries } from './csv.js';

// Initialize yargs using yargs/helpers to handle process.argv
const argv = yargs(hideBin(process.argv))
  .command('count [installs] [uninstalls]', 'Count installs and uninstalls', {
    installs: {
      description: 'installs',
      alias: 'i',
      type: 'string',
    },
    uninstalls: {
      description: 'uninstalls',
      alias: 'u',
      type: 'string',
    },
  })
  .help()
  .alias('help', 'h')
  .parse();

// Command logic
// console.log('!! ARGV = ', argv);
console.log(argv.i)
if (argv.i && argv.u) {
  // console.log(`Installs = ${argv.installs || 'Guest'} and Uninstalls = ${argv.uninstalls}`);
  countAllCountries(argv.installs, argv.uninstalls);
}
