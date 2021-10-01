import { combineReducers } from 'redux';

import config from '../config';
import { makeActions, makeFetchThunk, makeAPIReducer } from './reduxeed';

// /////////////////////////////////////////////////////////////////////////////
// PRODUCT_SINGLE
// /////////////////////////////////////////////////////////////////////////////

const productSingleActions = makeActions('PRODUCT_SINGLE', true);

export function fetchProductSingle(id) {
  return makeFetchThunk({
    url: `${config.api}/products/${id}`,
    // cache: true,
    statePath: ['product', 'single', id],
    requestFn: productSingleActions.request.bind(null, id),
    receiveFn: productSingleActions.receive.bind(null, id)
  });
}

const productSingleReducer = makeAPIReducer('PRODUCT_SINGLE', true);

// /////////////////////////////////////////////////////////////////////////////
// PRODUCT_LIST
// /////////////////////////////////////////////////////////////////////////////

const productActions = makeActions('PRODUCT_LIST');

export function fetchProductList() {
  return makeFetchThunk({
    url: `${config.api}/products`,
    cache: true,
    requestFn: productActions.request,
    receiveFn: productActions.receive,
    mutator: d => d.products
  });
}

const productListReducer = makeAPIReducer('PRODUCT_LIST');

// /////////////////////////////////////////////////////////////////////////////
// Export
// /////////////////////////////////////////////////////////////////////////////

export default combineReducers({
  single: productSingleReducer,
  list: productListReducer
});
