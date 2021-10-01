import { combineReducers } from 'redux';

import config from '../config';
import { makeActions, makeFetchThunk, makeAPIReducer } from './reduxeed';

// /////////////////////////////////////////////////////////////////////////////
// COUNTRY_PILOT_SINGLE
// /////////////////////////////////////////////////////////////////////////////

const countryPilotSingleActions = makeActions('COUNTRY_PILOT_SINGLE', true);

export function fetchCountryPilotSingle (id) {
  return makeFetchThunk({
    url: `${config.api}/country_pilots/${id}`,
    // cache: true,
    statePath: ['country_pilot', 'single', id],
    requestFn: countryPilotSingleActions.request.bind(null, id),
    receiveFn: countryPilotSingleActions.receive.bind(null, id)
  });
}

const countryPilotSingleReducer = makeAPIReducer('COUNTRY_PILOT_SINGLE', true);

// /////////////////////////////////////////////////////////////////////////////
// COUNTRY_PILOT_LIST
// /////////////////////////////////////////////////////////////////////////////

const countryPilotActions = makeActions('COUNTRY_PILOT_LIST');

export function fetchCountryPilotList () {
  return makeFetchThunk({
    url: `${config.api}/country_pilots`,
    cache: true,
    requestFn: countryPilotActions.request,
    receiveFn: countryPilotActions.receive,
    mutator: d => d.country_pilots
  });
}

const countryPilotListReducer = makeAPIReducer('COUNTRY_PILOT_LIST');

// /////////////////////////////////////////////////////////////////////////////
// Export
// /////////////////////////////////////////////////////////////////////////////

export default combineReducers({
  single: countryPilotSingleReducer,
  list: countryPilotListReducer
});
