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
  EuiIcon,
  EuiSpacer,
  EuiPageHeader,
  EuiTitle,
  EuiText,
  EuiFlexItem,
  EuiFlexGroup,
} from '@elastic/eui';
import React, { Fragment, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
//@ts-ignore
import chrome from 'ui/chrome';
//@ts-ignore
import { toastNotifications } from 'ui/notify';
import { BREADCRUMBS, SAMPLE_TYPE } from '../../../../utils/constants';
import { GET_ALL_DETECTORS_QUERY_PARAMS } from '../../../utils/constants';
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
  containsIndex,
  containsDetector,
  getDetectorId,
} from '../../utils/helpers';
import { SampleDataBox } from '../../components/SampleDataBox/SampleDataBox';

const delayInMillis = 1000;
const addDelay = (millis: number) =>
  new Promise((res) => setTimeout(res, millis));

export const SampleData = () => {
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

  const getAllDetectors = async () => {
    try {
      dispatch(getDetectorList(GET_ALL_DETECTORS_QUERY_PARAMS));
    } catch {
      console.error('Error getting detector list');
    }
  };

  // Set breadcrumbs on page initialization
  useEffect(() => {
    chrome.breadcrumbs.set([
      BREADCRUMBS.ANOMALY_DETECTOR,
      BREADCRUMBS.SAMPLE_DATA,
    ]);
  }, []);

  // Getting all initial detectors
  useEffect(() => {
    getAllDetectors();
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

    // Create the index
    await dispatch(createIndex(indexConfig)).catch((error: any) => {
      errorDuringAction = true;
      errorMessage = 'Error creating sample index.';
      console.error('Error creating sample index: ', error);
    });

    // Get the sample data from the server and bulk insert
    if (!errorDuringAction) {
      await dispatch(createSampleData(sampleType)).catch((error: any) => {
        errorDuringAction = true;
        errorMessage = error;
        console.error('Error creating all sample data: ', error);
      });
    }

    // Add small delay for index to be fully populated in ES. Can occasionally time out if not
    //await addDelay(delayInMillis);

    // Create the detector
    if (!errorDuringAction) {
      await dispatch(createDetector(detectorConfig))
        .then(function (response: any) {
          const detectorId = response.data.response.id;
          // Start the detector
          dispatch(startDetector(detectorId)).catch((error: any) => {
            errorDuringAction = true;
            errorMessage = error.data.message;
            console.error('Error starting sample detector: ', error);
          });
        })
        .catch((error: any) => {
          errorDuringAction = true;
          errorMessage = error;
          console.error('Error creating sample detector: ', error);
        });
    }

    getAllDetectors();
    setLoadingState(false);
    if (!errorDuringAction) {
      toastNotifications.addSuccess('Successfully loaded sample data');
    } else {
      toastNotifications.addDanger(
        `Unable to load all sample data. ${errorMessage}`
      );
    }
  };

  return (
    <Fragment>
      <EuiPageHeader>
        <EuiTitle size="l">
          <h1>Sample Data</h1>
        </EuiTitle>
      </EuiPageHeader>
      <EuiText>
        Create a detector with streaming sample data to get a deeper
        understanding of how anomaly detection works. These will create and
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
            onLoadData={() => {
              handleLoadData(
                SAMPLE_TYPE.HTTP_RESPONSES,
                sampleHttpResponses.indexConfig,
                sampleHttpResponses.detectorConfig,
                setIsLoadingHttpData
              );
            }}
            isLoadingData={isLoadingHttpData}
            isDataLoaded={containsDetector(
              allDetectors,
              sampleHttpResponses.detectorName
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
            onLoadData={() => {
              handleLoadData(
                SAMPLE_TYPE.ECOMMERCE,
                sampleEcommerce.indexConfig,
                sampleEcommerce.detectorConfig,
                setIsLoadingEcommerceData
              );
            }}
            isLoadingData={isLoadingEcommerceData}
            isDataLoaded={containsDetector(
              allDetectors,
              sampleEcommerce.detectorName
            )}
            detectorId={getDetectorId(
              allDetectors,
              sampleEcommerce.detectorName
            )}
          />
        </EuiFlexItem>
        <EuiFlexItem>
          <SampleDataBox
            title="Monitor health of a host"
            icon={sampleHostHealth.icon}
            description={sampleHostHealth.description}
            onLoadData={() => {
              handleLoadData(
                SAMPLE_TYPE.HOST_HEALTH,
                sampleHostHealth.indexConfig,
                sampleHostHealth.detectorConfig,
                setIsLoadingHostHealthData
              );
            }}
            isLoadingData={isLoadingHostHealthData}
            isDataLoaded={containsDetector(
              allDetectors,
              sampleHostHealth.detectorName
            )}
            detectorId={getDetectorId(
              allDetectors,
              sampleHostHealth.detectorName
            )}
          />
        </EuiFlexItem>
        <EuiSpacer size="m" />
      </EuiFlexGroup>
    </Fragment>
  );
};

// // Remove sample index, stop and remove sample detector
// const handleRemoveData = async (
//   indexToRemove: string,
//   detectorId: string
// ) => {
//   setIsRemovingData(true);
//   let errorDuringAction = false;

//   // perform all actions here
//   await dispatch(deleteIndex(indexToRemove)).catch((error: any) => {
//     errorDuringAction = true;
//     console.error('Error deleting index: ', error);
//   });

//   await dispatch(stopDetector(detectorId))
//     .catch((error: any) => {
//       errorDuringAction = true;
//       console.error('Error stopping detector: ', error);
//     })
//     .then(() => {
//       dispatch(deleteDetector(detectorId)).catch((error: any) => {
//         errorDuringAction = true;
//         console.error('Error deleting detector: ', error);
//       });
//     });

//   setIsRemovingData(false);
//   if (!errorDuringAction) {
//     setIsDataRemoved(true);
//     getAllIndices();
//     toastNotifications.addSuccess('Successfully removed sample data');
//   } else {
//     toastNotifications.addDanger('Unable to remove sample data');
//   }
// };
