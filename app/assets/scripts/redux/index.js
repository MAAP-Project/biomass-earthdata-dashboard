'use strict';
import { combineReducers } from 'redux';

import layerData from './layer-data';
import timeSeries from './time-series';
import cogTimeData from './cog-time-data';
import product from './product';
import countryPilot from './country-pilot';

export const reducers = {
  layerData,
  timeSeries,
  cogTimeData,
  product,
  countryPilot
};

export default combineReducers(reducers);
