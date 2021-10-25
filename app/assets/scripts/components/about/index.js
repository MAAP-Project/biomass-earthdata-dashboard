import React from 'react';
import styled from 'styled-components';

import App from '../common/app';
import {
  Inpage,
  InpageHeader,
  InpageHeaderInner,
  InpageHeadline,
  InpageTitle,
  InpageBody
} from '../../styles/inpage';
import Constrainer from '../../styles/constrainer';
import Prose from '../../styles/type/prose';

import { glsp } from '../../styles/utils/theme-values';

const PageConstrainer = styled(Constrainer)`
  ${Prose} {
    max-width: 50rem;
  }

  > *:not(:last-child) {
    margin-bottom: ${glsp(2)};
  }
`;

export default class About extends React.Component {
  render () {
    return (
      <App pageTitle='About'>
        <Inpage>
          <InpageHeader>
            <InpageHeaderInner>
              <InpageHeadline>
                <InpageTitle>About</InpageTitle>
              </InpageHeadline>
            </InpageHeaderInner>
          </InpageHeader>
          <InpageBody>
            <PageConstrainer>
              <Prose>
                    <p>
                      <b>Biomass, the living part of vegetation systems, plays a crucial role in climate.</b> Around half of biomass is carbon, so destruction of vegetation, as in deforestation, releases carbon dioxide to the atmosphere. This carbon source is huge (about 6 billion tons of carbon dioxide per year). At the same time, vegetation growth pulls carbon dioxide out of the atmosphere and stores it as biomass. Hence biomass and its change, especially forest biomass, is a key part of both the climate <i>problem</i> and its <i>solution</i>.
                    </p>
                    <p>
                      <b>Mapping aboveground biomass is therefore a priority of several new and upcoming NASA, ESA and JAXA missions, including GEDI, ICESat-2, BIOMASS, ALOS-4 and NISAR.</b>
                    </p>
                    <p>
                      A primary purpose of these missions is to provide biomass density maps that can be used in forest carbon estimation and reporting, and forest and land use management for climate mitigation purposes. Currently, national GHG estimation and reporting depends on either National Forest Inventories (NFIs) or other sparse forest plot data. While the 2019 Refinement to the 2006 IPCC Guidelines provides good practice guidance on using biomass density maps for country purposes, there are very few concrete country examples because it is only recently that space-based data have become available at the level of detail and quality useful for such purposes. There are, however, different space missions using different sensors and technologies (radar, lidar) and thus produce different estimates of biomass. Such disparities are a potential source of confusion for users, so it is highly desirable to produce a single most accurate biomass dataset by combining the strengths of the individual sensors. This dataset must have undergone rigorous, consistent and transparent validation if it is to be used with confidence by the policy community. This issue is pressing as the world prepares for the United Nations Framework Convention on Climate Change's first ‘Global Stocktake' (GST); this will take place in 2023, with repetitions every five years. For space-based biomass information to become a key input to future GSTs, it is essential that it be included in the baseline methods established in the 2023 GST.
                    </p>
                    <p>
                      Several current projects are producing continental to global biomass maps. These include ESA's CCI-Biomass global maps at a scale of 100 m for 2010, 2017, 2018, 2020; JPL's global 100 m map for 2020, and a time series of 10 km biomass maps from 2000-2020; NASA GEDI's 1 km map for 2020 covering latitudes between ~52° N and 52° S; the NASA ICESat-2 30 m boreal map for 2020; and the UK National Centre for Earth Observation (EO) 100 m time series of maps for Africa from 2007 to 2017. Series of biomass change maps are also becoming available.
                    </p>
                    <p>
                      This new generation of biomass products will provide improved global and regional estimation of carbon fluxes from forest changes, but their widespread take-up requires that their differences are addressed and their accuracy is known. The world's EO biomass community is therefore undertaking a programme aimed at resolving discrepancies between products and producing harmonized estimates of biomass and uncertainty at a policy-relevant, jurisdictional-level scale. This effort builds on the CEOS biomass cal/val protocol and reference data and tools available and used by CEOS partners. Key global biomass production and validation teams, including national experts, are engaged in this effort, with a shared goal of producing harmonized biomass products for use in the UNFCCC GST process, with anticipated release in the first half of 2022. Besides the global harmonization effort, the community is working with varying country experts and agencies to demonstrate the uptake of space-based biomass to improve national biomass and forest carbon stock estimation in different country circumstances.
                    </p>
              </Prose>
            </PageConstrainer>
          </InpageBody>
        </Inpage>
      </App>
    );
  }
}
