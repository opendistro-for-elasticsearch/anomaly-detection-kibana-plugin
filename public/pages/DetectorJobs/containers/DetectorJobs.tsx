/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
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
  EuiPageBody,
  EuiPageHeader,
  EuiPageHeaderSection,
  EuiFlexItem,
  EuiFlexGroup,
  EuiPage,
  EuiButton,
  EuiTitle,
  EuiButtonEmpty,
  EuiSpacer,
} from '@elastic/eui';
import { FormikProps, Formik } from 'formik';
import { isEmpty } from 'lodash';
import React, { Fragment, useState, useEffect } from 'react';
import { BREADCRUMBS } from '../../../utils/constants';
import { useHideSideNavBar } from '../../main/hooks/useHideSideNavBar';
import { CoreStart } from '../../../../../../src/core/public';
import { CoreServicesContext } from '../../../components/CoreServices/CoreServices';
import { DetectorJobsFormikValues } from '../models/interfaces';
import { RealTimeJob } from '../components/RealTimeJob';
import { HistoricalJob } from '../components/HistoricalJob';
import { convertTimestampToNumber } from '../../../utils/utils';
import { RouteComponentProps } from 'react-router-dom';

interface DetectorJobsProps extends RouteComponentProps {
  setStep?(stepNumber: number): void;
  initialValues: DetectorJobsFormikValues;
  setInitialValues(initialValues: DetectorJobsFormikValues): void;
}

export function DetectorJobs(props: DetectorJobsProps) {
  const core = React.useContext(CoreServicesContext) as CoreStart;
  useHideSideNavBar(true, false);

  const [realTime, setRealTime] = useState<boolean>(
    props.initialValues ? props.initialValues.realTime : true
  );
  const [historical, setHistorical] = useState<boolean>(
    props.initialValues ? props.initialValues.historical : false
  );

  // Jump to top of page on first load
  useEffect(() => {
    scroll(0, 0);
  }, []);

  useEffect(() => {
    core.chrome.setBreadcrumbs([
      BREADCRUMBS.ANOMALY_DETECTOR,
      BREADCRUMBS.DETECTORS,
      BREADCRUMBS.CREATE_DETECTOR,
    ]);
  }, []);

  const handleFormValidation = async (
    formikProps: FormikProps<DetectorJobsFormikValues>
  ) => {
    try {
      formikProps.setSubmitting(true);
      formikProps.validateForm().then((errors) => {
        // We need some custom logic to check the validity here. The EUI date range validity
        // is limited and can only be checked on selection changes. Since a user may go back
        // and forth without changing the selection, we still need to prevent moving to the
        // next step without checking time range validity.
        const isValid =
          isEmpty(errors) &&
          (historical
            ? //@ts-ignore
              convertTimestampToNumber(formikProps.values.startTime) <
              //@ts-ignore
              convertTimestampToNumber(formikProps.values.endTime)
            : true);
        if (isValid) {
          optionallySaveValues({
            ...formikProps.values,
            realTime: realTime,
            historical: historical,
          });
          //@ts-ignore
          props.setStep(4);
        } else {
          // TODO: can add focus to all components or possibly customize error message too
          core.notifications.toasts.addDanger(
            'One or more input fields is invalid'
          );
        }
      });
    } catch (e) {
    } finally {
      formikProps.setSubmitting(false);
    }
  };

  const optionallySaveValues = (values: DetectorJobsFormikValues) => {
    props.setInitialValues(values);
  };

  return (
    <Formik
      initialValues={props.initialValues}
      onSubmit={() => {}}
      validateOnMount={true}
    >
      {(formikProps) => (
        <Fragment>
          <EuiPage
            style={{
              marginTop: '-24px',
            }}
          >
            <EuiPageBody>
              <EuiPageHeader>
                <EuiPageHeaderSection>
                  <EuiTitle size="l">
                    <h1>Set up detector jobs </h1>
                  </EuiTitle>
                </EuiPageHeaderSection>
              </EuiPageHeader>
              <RealTimeJob
                formikProps={formikProps}
                realTime={realTime}
                setRealTime={setRealTime}
              />
              <EuiSpacer />
              <HistoricalJob
                formikProps={formikProps}
                historical={historical}
                setHistorical={setHistorical}
              />
            </EuiPageBody>
          </EuiPage>

          <EuiFlexGroup
            alignItems="center"
            justifyContent="flexEnd"
            gutterSize="s"
            style={{ marginRight: '12px' }}
          >
            <EuiFlexItem grow={false}>
              <EuiButtonEmpty
                onClick={() => {
                  props.history.push('/detectors');
                }}
              >
                Cancel
              </EuiButtonEmpty>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButton
                iconSide="left"
                iconType="arrowLeft"
                fill={false}
                data-test-subj="detectorJobsPreviousButton"
                //isLoading={formikProps.isSubmitting}
                //@ts-ignore
                onClick={() => {
                  optionallySaveValues({
                    ...formikProps.values,
                    realTime: realTime,
                    historical: historical,
                  });
                  //@ts-ignore
                  props.setStep(2);
                }}
              >
                Previous
              </EuiButton>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButton
                type="submit"
                iconSide="right"
                iconType="arrowRight"
                fill={true}
                data-test-subj="detectorJobsNextButton"
                isLoading={formikProps.isSubmitting}
                //@ts-ignore
                onClick={() => {
                  handleFormValidation(formikProps);
                }}
              >
                Next
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </Fragment>
      )}
    </Formik>
  );
}
