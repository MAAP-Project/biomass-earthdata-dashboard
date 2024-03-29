import { format, sub } from 'date-fns';
import bbox from '@turf/bbox';

const dateFormats = {
  monthOnly: 'MM',
  month: 'yyyyMM',
  day: 'yyyy.MM.dd'
};

const prepDateSource = (source, date, timeUnit = 'month') => {
  return {
    ...source,
    tiles: source.tiles.map((t) =>
      t.replace('{date}', format(date, dateFormats[timeUnit]))
    )
  };
};

const prepGammaSource = (source, knobPos = 0) => {
  // Gamma is calculated with the following scale:
  // domain: 0-100  range: 2-0.1
  // The higher the Knob, the lower the gamma.
  // This is a linear scale of type y = -mx + b
  // y = -0.02x + 2;

  return {
    ...source,
    tiles: source.tiles.map((t) => t.replace('{gamma}', -0.019 * knobPos + 2))
  };
};

const prepSource = (layerInfo, source, date, knobPos) => {
  if (layerInfo.legend.type === 'gradient-adjustable') {
    source = prepGammaSource(source, knobPos);
  }
  if (date) {
    source = prepDateSource(source, date, layerInfo.timeUnit);
  }
  return source;
};

const replaceRasterTiles = (theMap, sourceId, tiles) => {
  // https://github.com/mapbox/mapbox-gl-js/issues/2941
  // Set the tile url to a cache-busting url (to circumvent browser caching behaviour):
  theMap.getSource(sourceId).tiles = tiles;
  // Remove the tiles for a particular source
  theMap.style.sourceCaches[sourceId].clearTiles();
  // Load the new tiles for the current viewport (theMap.transform -> viewport)
  theMap.style.sourceCaches[sourceId].update(theMap.transform);
  // Force a repaint, so that the map will be repainted without you having to touch the map
  theMap.triggerRepaint();
};

const replaceVectorData = (theMap, sourceId, data) => {
  const empty = {
    type: 'FeatureCollection',
    features: []
  };
  theMap.getSource(sourceId).setData(empty);
  theMap.getSource(sourceId).setData(data);
};

const toggleOrAddLayer = (mbMap, id, source, type, paint, beforeId) => {
  if (mbMap.getSource(id)) {
    mbMap.setLayoutProperty(id, 'visibility', 'visible');
  } else {
    mbMap.addSource(id, source);
    const layer_data = {
      id: id,
      type: type,
      source: id,
      layout: {},
      paint
    };
    if (source['source_layer']) {
      layer_data['source-layer'] = source['source_layer']
    };
    mbMap.addLayer(layer_data);
  }
};

export const layerTypes = {
  'raster-timeseries': {
    update: (ctx, layerInfo, prevProps) => {

      const { mbMap, mbMapComparing, mbMapComparingLoaded, props } = ctx;
      const { id, source, compare, paint } = layerInfo;
      const prevLayerInfo = prevProps.layers.find((l) => l.id === layerInfo.id);
      const { date, comparing } = props;

      const knobPos = layerInfo.knobCurrPos;
      const knobPosPrev = prevLayerInfo ? prevLayerInfo.knobCurrPos : null;

      // Do not update if:
      if (
        // There's no date defined.
        prevProps.date &&
        date &&
        // Dates are the same
        date.getTime() === prevProps.date.getTime() &&
        // Knob position for gamma correction is the same.
        knobPos === knobPosPrev &&
        // Compare didn't change.
        comparing === prevProps.comparing
      ) { return; }

      // The source we're updating is not present.
      if (!mbMap.getSource(id)) return;

      // If we're comparing, and the compare map is not loaded.
      if (comparing && !mbMapComparingLoaded) return;

      // END update checks.

      // Update layer tiles.
      const tiles = prepSource(layerInfo, source, date, knobPos).tiles;
      replaceRasterTiles(mbMap, id, tiles);

      // Update/init compare layer tiles.
      if (comparing) {
        const compareDate =
          typeof compare.compareDate === 'function'
            ? compare.compareDate(date)
            // Default compare date is 5y ago.
            : sub(date, { years: 5 });

        const sourceCompare = prepSource(
          { ...layerInfo, ...compare },
          compare.source || source,
          compareDate,
          knobPos
        );
        if (mbMapComparing.getSource(id)) {
          replaceRasterTiles(mbMapComparing, id, sourceCompare.tiles);
        } else {
          mbMapComparing.addSource(id, sourceCompare);
          mbMapComparing.addLayer(
            {
              id: id,
              type: 'raster',
              source: id,
              paint: paint || {}
            },
            'admin-0-boundary-bg'
          );
        }
      }
    },
    hide: (ctx, layerInfo) => {
      const { mbMap } = ctx;
      const { id } = layerInfo;
      if (mbMap.getSource(id)) {
        mbMap.setLayoutProperty(id, 'visibility', 'none');
      }
    },
    show: (ctx, layerInfo) => {
      const { mbMap, props } = ctx;
      const { id, source, paint } = layerInfo;
      const { date } = props;
      if (!date) return;

      if (mbMap.getSource(id)) {
        mbMap.setLayoutProperty(id, 'visibility', 'visible');
      } else {
        mbMap.addSource(
          id,
          prepSource(layerInfo, source, date, layerInfo.knobCurrPos)
        );
        mbMap.addLayer(
          {
            id: id,
            type: 'raster',
            source: id,
            paint: paint || {}
          },
          'admin-0-boundary-bg'
        );
      }
    }
  },
  raster: {
    update: (ctx, layerInfo, prevProps) => {
      const { mbMap, mbMapComparing, mbMapComparingLoaded, props } = ctx;
      const { id, compare, paint, source } = layerInfo;
      const { comparing } = props;

      const knobPos = layerInfo.knobCurrPos || 50;

      // Check if the source tiles have changed and need to be replaced. This
      // may happen in the stories when maintaining the layer and changing the
      // product. One example is the slowdown raster layer on la and sf.

      const sourceTiles = mbMap.getSource(id).tiles;
      const newSource = prepGammaSource(source, knobPos);

      // Quick compare
      if (sourceTiles && sourceTiles.join('-') !== newSource.tiles.join('-')) {
        replaceRasterTiles(mbMap, id, newSource.tiles);
      }

      // Do not update if:
      if (
        // Compare didn't change.
        comparing === prevProps.comparing ||
        // There's no comparing map.
        !mbMapComparing
      ) { return; }

      // If we're comparing, and the compare map is not loaded.
      if (comparing && !mbMapComparingLoaded) return;

      // END update checks.

      if (mbMapComparing.getSource(id)) {
        mbMapComparing.setLayoutProperty(id, 'visibility', 'visible');
      } else {
        mbMapComparing.addSource(id, compare.source);
        mbMapComparing.addLayer(
          {
            id: id,
            type: 'raster',
            source: id,
            paint: paint || {}
          },
          'admin-0-boundary-bg'
        );
      }
    },
    hide: (ctx, layerInfo) => {
      const { mbMap } = ctx;
      const { id } = layerInfo;
      if (mbMap.getSource(id)) {
        mbMap.setLayoutProperty(id, 'visibility', 'none');
      }
    },
    show: (ctx, layerInfo) => {
      const { mbMap } = ctx;
      const { id, source, paint } = layerInfo;

      if (mbMap.getSource(id)) {
        mbMap.setLayoutProperty(id, 'visibility', 'visible');
      } else {
        mbMap.addSource(
          id,
          prepGammaSource(source, layerInfo.knobCurrPos || 50)        
        );
        const layer_properties = {
          id: id,
          type: 'raster',
          source: id,
          minzoom: source.minzoom,
          maxzoom: source.maxzoom,
          paint: paint || {}
        }
        mbMap.addLayer(layer_properties, 'admin-0-boundary-bg');
      }
    }
  },
  'inference-timeseries': {
    update: (ctx, layerInfo, prevProps) => {
      const { props, mbMap } = ctx;
      const { date } = props;
      const { id, source, backgroundSource } = layerInfo;
      const vecId = `${id}-vector`;
      const rastId = `${id}-raster`;

      // Do not update if:
      if (
        // There's no date defined.
        prevProps.date &&
        date &&
        // Dates are the same
        date.getTime() === prevProps.date.getTime()
      ) { return; }

      // The source we're updating is not present.
      if (!mbMap.getSource(vecId) || !mbMap.getSource(rastId)) return;
      const formatDate = format(date, dateFormats[layerInfo.timeUnit]);
      const vectorData = source.data.replace('{date}', formatDate);
      const rasterTiles = backgroundSource.tiles.map((tile) =>
        tile.replace('{date}', formatDate)
      );

      // inference data moves around, recenter on each update
      fetch(vectorData)
        .then((res) => res.json())
        .then((geo) => {
          mbMap.fitBounds(bbox(geo));
        })
        .catch((err) => {
          console.log(err); // eslint-disable-line no-console
        });

      replaceVectorData(mbMap, vecId, vectorData);
      replaceRasterTiles(mbMap, rastId, rasterTiles);
    },
    hide: (ctx, layerInfo) => {
      const { mbMap } = ctx;
      const { id } = layerInfo;

      const vecId = `${id}-vector`;

      const rastId = `${id}-raster`;
      if (mbMap.getSource(vecId)) {
        mbMap.setLayoutProperty(vecId, 'visibility', 'none');
      }
      if (mbMap.getSource(rastId)) {
        mbMap.setLayoutProperty(rastId, 'visibility', 'none');
      }
    },
    show: (ctx, layerInfo) => {
      const { props, mbMap } = ctx;
      const { date } = props;
      const { id, source, backgroundSource } = layerInfo;
      const vecId = `${id}-vector`;
      const rastId = `${id}-raster`;
      if (!date) return;

      const inferPaint = {
        'line-color': '#f2a73a',
        'line-opacity': 0.8,
        'line-width': 2
      };
      const formatDate = format(date, dateFormats[layerInfo.timeUnit]);
      const vectorL = {
        ...source,
        data: source.data.replace('{date}', formatDate)
      };
      const rasterL = {
        ...backgroundSource,
        tiles: backgroundSource.tiles.map((tile) =>
          tile.replace('{date}', formatDate)
        )
      };

      toggleOrAddLayer(
        mbMap,
        vecId,
        vectorL,
        'line',
        inferPaint
      );
      toggleOrAddLayer(mbMap, rastId, rasterL, 'raster', {});

      fetch(vectorL.data)
        .then((res) => res.json())
        .then((geo) => {
          mbMap.fitBounds(bbox(geo));
        })
        .catch((err) => {
          console.log(err); // eslint-disable-line no-console
        });
    }
  },
  'geojson': {
    hide: (ctx, layerInfo) => {
      const { mbMap } = ctx;
      const { id } = layerInfo;

      const geojsonId = `${id}-geojson`;

      if (mbMap.getSource(geojsonId)) {
        mbMap.setLayoutProperty(geojsonId, 'visibility', 'none');
      }
    },
    show: (ctx, layerInfo) => {
      const { mbMap } = ctx;
      const { id, source, paint } = layerInfo;
      const geojsonId = `${id}-geojson`;

      const geojsonL = {
        ...source,
        data: source.data
      };
      toggleOrAddLayer(
        mbMap,
        geojsonId,
        geojsonL,
        'circle',
        paint
      );
    }
  },
  'vector': {
    hide: (ctx, layerInfo) => {
      const { mbMap } = ctx;
      const { id } = layerInfo;

      const vecId = `${id}-vector`;

      if (mbMap.getSource(vecId)) {
        mbMap.setLayoutProperty(vecId, 'visibility', 'none');
      }
    },
    show: (ctx, layerInfo) => {
      const { mbMap } = ctx;
      const { id, source, paint } = layerInfo;
      const vecId = `${id}-vector`;

      const vectorL = {
        ...source,
        data: source.data
      };
      toggleOrAddLayer(
        mbMap,
        vecId,
        vectorL,
        'circle',
        paint
      );
    }
  }
};
