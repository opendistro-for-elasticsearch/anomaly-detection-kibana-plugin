/*
 * Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

import {
  EuiSpacer,
  EuiPageHeader,
  EuiTitle,
  EuiText,
  EuiFlexItem,
  EuiFlexGroup,
} from '@elastic/eui';
import React, { Fragment, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BREADCRUMBS } from '../../../../utils/constants';
import { SAMPLE_TYPE } from '../../../../../server/utils/constants';
import {
  GET_SAMPLE_DETECTORS_QUERY_PARAMS,
  GET_SAMPLE_INDICES_QUERY,
} from '../../../utils/constants';
import { AppState } from '../../../../redux/reducers';
import { getDetectorList } from '../../../../redux/reducers/ad';
import { createSampleData } from '../../../../redux/reducers/sampleData';

import {
  getIndices,
  createIndex,
} from '../../../../redux/reducers/elasticsearch';
import { createDetector, startDetector } from '../../../../redux/reducers/ad';
import {
  sampleHttpResponses,
  sampleEcommerce,
  sampleHostHealth,
} from '../../utils/constants';
import {
  containsSampleIndex,
  containsSampleDetector,
  getDetectorId,
} from '../../utils/helpers';
import { SampleDataBox } from '../../components/SampleDataBox/SampleDataBox';
import { SampleDetailsFlyout } from '../../components/SampleDetailsFlyout/SampleDetailsFlyout';
import { prettifyErrorMessage } from '../../../../../server/utils/helpers';
import { CoreStart } from '../../../../../../../src/core/public';
import { CoreServicesContext } from '../../../../components/CoreServices/CoreServices';

export const SampleData = () => {
  const core = React.useContext(CoreServicesContext) as CoreStart;
  const dispatch = useDispatch();
  const visibleIndices = useSelector(
    (state: AppState) => state.elasticsearch.indices
  );
  const allDetectors = Object.values(
    useSelector((state: AppState) => state.ad.detectorList)
  );

  const [isLoadingHttpData, setIsLoadingHttpData] = useState<boolean>(false);
  const [isLoadingEcommerceData, setIsLoadingEcommerceData] = useState<boolean>(
    false
  );
  const [isLoadingHostHealthData, setIsLoadingHostHealthData] = useState<
    boolean
  >(false);
  const [
    showHttpResponseDetailsFlyout,
    setShowHttpResponseDetailsFlyout,
  ] = useState<boolean>(false);
  const [showEcommerceDetailsFlyout, setShowEcommerceDetailsFlyout] = useState<
    boolean
  >(false);
  const [
    showHostHealthDetailsFlyout,
    setShowHostHealthDetailsFlyout,
  ] = useState<boolean>(false);

  const getAllSampleDetectors = async () => {
    await dispatch(getDetectorList(GET_SAMPLE_DETECTORS_QUERY_PARAMS)).catch(
      (error: any) => {
        console.error('Error getting all detectors: ', error);
      }
    );
  };

  const getAllSampleIndices = async () => {
    await dispatch(getIndices(GET_SAMPLE_INDICES_QUERY)).catch((error: any) => {
      console.error('Error getting all indices: ', error);
    });
  };

  // Set breadcrumbs on page initialization
  useEffect(() => {
    core.chrome.setBreadcrumbs([
      BREADCRUMBS.ANOMALY_DETECTOR,
      BREADCRUMBS.SAMPLE_DETECTORS,
    ]);
  }, []);

  // Getting all initial sample detectors & indices
  useEffect(() => {
    getAllSampleDetectors();
    getAllSampleIndices();
  }, []);

  // Create and populate sample index, create and start sample detector
  const handleLoadData = async (
    sampleType: SAMPLE_TYPE,
    indexConfig: any,
    detectorConfig: any,
    setLoadingState: (isLoading: boolean) => void
  ) => {
    setLoadingState(true);
    let errorDuringAction = false;
    let errorMessage = '';

    // Create the index (if it doesn't exist yet)
    if (!containsSampleIndex(visibleIndices, sampleType)) {
      await dispatch(createIndex(indexConfig)).catch((error: any) => {
        errorDuringAction = true;
        errorMessage =
          'Error creating sample index. ' + prettifyErrorMessage(error);
        console.error(errorMessage);
      });
    }

    // Get the sample data from the server and bulk insert
    if (!errorDuringAction) {
      await dispatch(createSampleData(sampleType)).catch((error: any) => {
        errorDuringAction = true;
        errorMessage = prettifyErrorMessage(error.message);
        console.error('Error bulk inserting data: ', errorMessage);
      });
    }

    // Create the detector
    if (!errorDuringAction) {
      await dispatch(createDetector(detectorConfig))
        .then(function (response: any) {
          const detectorId = response.response.id;
          // Start the detector
          dispatch(startDetector(detectorId)).catch((error: any) => {
            errorDuringAction = true;
            errorMessage = prettifyErrorMessage(error.message);
            console.error('Error starting sample detector: ', errorMessage);
          });
        })
        .catch((error: any) => {
          errorDuringAction = true;
          errorMessage = prettifyErrorMessage(error.message);
          console.error('Error creating sample detector: ', errorMessage);
        });
    }

    getAllSampleDetectors();
    getAllSampleIndices();
    setLoadingState(false);
    if (!errorDuringAction) {
      core.notifications.toasts.addSuccess(
        'Successfully loaded the sample detector'
      );
    } else {
      core.notifications.toasts.addDanger(
        `Unable to load all sample data, please try again. ${errorMessage}`
      );
    }
  };

  return (
    <Fragment>
      <EuiPageHeader>
        <EuiTitle size="l">
          <h1>Sample detectors</h1>
        </EuiTitle>
      </EuiPageHeader>
      <EuiText>
        Create a detector with streaming sample data to get a deeper
        understanding of how anomaly detection works. You can create and
        initialize a detector with configured settings for your selected sample
        index.
      </EuiText>
      <EuiSpacer size="xl" />
      <EuiFlexGroup direction="row" gutterSize="l">
        <EuiFlexItem>
          <SampleDataBox
            title="Monitor HTTP responses"
            icon={sampleHttpResponses.icon}
            description={sampleHttpResponses.description}
            loadDataButtonDescription="Create HTTP response detector"
            onOpenFlyout={() => {
              setShowHttpResponseDetailsFlyout(true);
              setShowEcommerceDetailsFlyout(false);
              setShowHostHealthDetailsFlyout(false);
            }}
            onLoadData={() => {
              handleLoadData(
                SAMPLE_TYPE.HTTP_RESPONSES,
                sampleHttpResponses.indexConfig,
                sampleHttpResponses.detectorConfig,
                setIsLoadingHttpData
              );
            }}
            isLoadingData={isLoadingHttpData}
            isDataLoaded={containsSampleDetector(
              allDetectors,
              SAMPLE_TYPE.HTTP_RESPONSES
            )}
            detectorId={getDetectorId(
              allDetectors,
              sampleHttpResponses.detectorName
            )}
          />
        </EuiFlexItem>
        <EuiFlexItem>
          <SampleDataBox
            title="Monitor eCommerce orders"
            icon={sampleEcommerce.icon}
            description={sampleEcommerce.description}
            loadDataButtonDescription="Create eCommerce orders detector"
            onOpenFlyout={() => {
              setShowHttpResponseDetailsFlyout(false);
              setShowEcommerceDetailsFlyout(true);
              setShowHostHealthDetailsFlyout(false);
            }}
            onLoadData={() => {
              handleLoadData(
                SAMPLE_TYPE.ECOMMERCE,
                sampleEcommerce.indexConfig,
                sampleEcommerce.detectorConfig,
                setIsLoadingEcommerceData
              );
            }}
            isLoadingData={isLoadingEcommerceData}
            isDataLoaded={containsSampleDetector(
              allDetectors,
              SAMPLE_TYPE.ECOMMERCE
            )}
            detectorId={getDetectorId(
              allDetectors,
              sampleEcommerce.detectorName
            )}
          />
        </EuiFlexItem>
        <EuiFlexItem>
          <SampleDataBox
            title="Monitor host health"
            icon={sampleHostHealth.icon}
            description={sampleHostHealth.description}
            loadDataButtonDescription="Create health monitor detector"
            onOpenFlyout={() => {
              setShowHttpResponseDetailsFlyout(false);
              setShowEcommerceDetailsFlyout(false);
              setShowHostHealthDetailsFlyout(true);
            }}
            onLoadData={() => {
              handleLoadData(
                SAMPLE_TYPE.HOST_HEALTH,
                sampleHostHealth.indexConfig,
                sampleHostHealth.detectorConfig,
                setIsLoadingHostHealthData
              );
            }}
            isLoadingData={isLoadingHostHealthData}
            isDataLoaded={containsSampleDetector(
              allDetectors,
              SAMPLE_TYPE.HOST_HEALTH
            )}
            detectorId={getDetectorId(
              allDetectors,
              sampleHostHealth.detectorName
            )}
          />
        </EuiFlexItem>
        <EuiSpacer size="m" />
      </EuiFlexGroup>
      {showHttpResponseDetailsFlyout ? (
        <SampleDetailsFlyout
          title="Monitor HTTP responses"
          sampleData={sampleHttpResponses}
          interval={1}
          onClose={() => setShowHttpResponseDetailsFlyout(false)}
        />
      ) : null}
      {showEcommerceDetailsFlyout ? (
        <SampleDetailsFlyout
          title="Monitor eCommerce orders"
          sampleData={sampleEcommerce}
          interval={1}
          onClose={() => setShowEcommerceDetailsFlyout(false)}
        />
      ) : null}
      {showHostHealthDetailsFlyout ? (
        <SampleDetailsFlyout
          title="Monitor host health"
          sampleData={sampleHostHealth}
          interval={1}
          onClose={() => setShowHostHealthDetailsFlyout(false)}
        />
      ) : null}
    </Fragment>
  );
};
