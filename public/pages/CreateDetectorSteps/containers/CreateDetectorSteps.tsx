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

import React, { Fragment, useState, useEffect } from 'react';
import { RouteComponentProps } from 'react-router';
import { EuiSteps, EuiFlexGroup, EuiFlexItem } from '@elastic/eui';
import { useHideSideNavBar } from '../../main/hooks/useHideSideNavBar';
import { INITIAL_DETECTOR_DEFINITION_VALUES } from '../../DefineDetector/utils/constants';
import { INITIAL_MODEL_CONFIGURATION_VALUES } from '../../ConfigureModel/utils/constants';
import { INITIAL_DETECTOR_JOB_VALUES } from '../../DetectorJobs/utils/constants';
import { STEP_STATUS } from '../utils/constants';
import { DefineDetector } from '../../DefineDetector/containers/DefineDetector';
import { ConfigureModel } from '../../ConfigureModel/containers/ConfigureModel';
import { DetectorJobs } from '../../DetectorJobs/containers/DetectorJobs';
import { ReviewAndCreate } from '../../ReviewAndCreate/containers/ReviewAndCreate';
import { DetectorDefinitionFormikValues } from '../../DefineDetector/models/interfaces';
import { ModelConfigurationFormikValues } from '../../ConfigureModel/models/interfaces';
import { DetectorJobsFormikValues } from '../../DetectorJobs/models/interfaces';
import { CreateDetectorFormikValues } from '../models/interfaces';

interface CreateDetectorStepsProps extends RouteComponentProps {}

export const CreateDetectorSteps = (props: CreateDetectorStepsProps) => {
  useHideSideNavBar(true, false);

  const [step1Status, setStep1Status] = useState<STEP_STATUS>(undefined);
  const [step2Status, setStep2Status] = useState<STEP_STATUS>('disabled');
  const [step3Status, setStep3Status] = useState<STEP_STATUS>('disabled');
  const [step4Status, setStep4Status] = useState<STEP_STATUS>('disabled');

  const [step1Fields, setStep1Fields] = useState<
    DetectorDefinitionFormikValues
  >(INITIAL_DETECTOR_DEFINITION_VALUES);
  const [step2Fields, setStep2Fields] = useState<
    ModelConfigurationFormikValues
  >(INITIAL_MODEL_CONFIGURATION_VALUES);
  const [step3Fields, setStep3Fields] = useState<DetectorJobsFormikValues>(
    INITIAL_DETECTOR_JOB_VALUES
  );
  const [step4Fields, setStep4Fields] = useState<CreateDetectorFormikValues>({
    ...step1Fields,
    ...step2Fields,
    ...step3Fields,
  });

  const [curStep, setCurStep] = useState<number>(1);

  // Hook to update the field values needed for the review step
  useEffect(() => {
    setStep4Fields({
      ...step1Fields,
      ...step2Fields,
      ...step3Fields,
    });
  }, [step1Fields, step2Fields, step3Fields]);

  // Hook to update the progress of the steps - undefined = blue, disabled = grey
  useEffect(() => {
    switch (curStep) {
      case 1:
      default:
        setStep1Status(undefined);
        setStep2Status('disabled');
        setStep3Status('disabled');
        setStep4Status('disabled');
        break;
      case 2:
        setStep1Status(undefined);
        setStep2Status(undefined);
        setStep3Status('disabled');
        setStep4Status('disabled');
        break;
      case 3:
        setStep1Status(undefined);
        setStep2Status(undefined);
        setStep3Status(undefined);
        setStep4Status('disabled');
        break;
      case 4:
        setStep1Status(undefined);
        setStep2Status(undefined);
        setStep3Status(undefined);
        setStep4Status(undefined);
        break;
    }
  }, [curStep]);

  const createSteps = [
    {
      title: 'Define detector',
      status: step1Status,
      children: undefined,
    },
    {
      title: 'Configure model',
      status: step2Status,
      children: undefined,
    },
    {
      title: 'Set up detector jobs',
      status: step3Status,
      children: undefined,
    },
    {
      title: 'Review and create',
      status: step4Status,
      children: undefined,
    },
  ];

  return (
    <Fragment>
      <EuiFlexGroup direction="row">
        <EuiFlexItem grow={false}>
          <EuiSteps steps={createSteps} />
        </EuiFlexItem>
        <EuiFlexItem>
          {curStep === 1 ? (
            <DefineDetector
              isEdit={false}
              setStep={setCurStep}
              initialValues={step1Fields}
              setInitialValues={setStep1Fields}
              {...props}
            />
          ) : curStep === 2 ? (
            <ConfigureModel
              isEdit={false}
              setStep={setCurStep}
              initialValues={step2Fields}
              setInitialValues={setStep2Fields}
              detectorDefinitionValues={step1Fields}
              {...props}
            />
          ) : curStep === 3 ? (
            <DetectorJobs
              setStep={setCurStep}
              initialValues={step3Fields}
              setInitialValues={setStep3Fields}
              {...props}
            />
          ) : curStep === 4 ? (
            <ReviewAndCreate
              setStep={setCurStep}
              values={step4Fields}
              {...props}
            />
          ) : null}
        </EuiFlexItem>
      </EuiFlexGroup>
    </Fragment>
  );
};
