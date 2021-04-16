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

  const [step1DefineDetectorStatus, setStep1DefineDetectorStatus] = useState<
    STEP_STATUS
  >(undefined);
  const [step2ConfigureModelStatus, setStep2ConfigureModelStatus] = useState<
    STEP_STATUS
  >('disabled');
  const [step3JobsStatus, setStep3JobsStatus] = useState<STEP_STATUS>(
    'disabled'
  );
  const [step4ReviewCreateStatus, setStep4ReviewCreateStatus] = useState<
    STEP_STATUS
  >('disabled');

  const [step1DefineDetectorFields, setStep1DefineDetectorFields] = useState<
    DetectorDefinitionFormikValues
  >(INITIAL_DETECTOR_DEFINITION_VALUES);
  const [step2ConfigureModelFields, setStep2ConfigureModelFields] = useState<
    ModelConfigurationFormikValues
  >(INITIAL_MODEL_CONFIGURATION_VALUES);
  const [step3JobsFields, setStep3JobsFields] = useState<
    DetectorJobsFormikValues
  >(INITIAL_DETECTOR_JOB_VALUES);
  const [step4ReviewCreateFields, setStep4ReviewCreateFields] = useState<
    CreateDetectorFormikValues
  >({
    ...step1DefineDetectorFields,
    ...step2ConfigureModelFields,
    ...step3JobsFields,
  });

  const [curStep, setCurStep] = useState<number>(1);

  // Hook to update the field values needed for the review step
  useEffect(() => {
    setStep4ReviewCreateFields({
      ...step1DefineDetectorFields,
      ...step2ConfigureModelFields,
      ...step3JobsFields,
    });
  }, [step1DefineDetectorFields, step2ConfigureModelFields, step3JobsFields]);

  // Hook to update the progress of the steps - undefined = blue, disabled = grey
  useEffect(() => {
    switch (curStep) {
      case 1:
      default:
        setStep1DefineDetectorStatus(undefined);
        setStep2ConfigureModelStatus('disabled');
        setStep3JobsStatus('disabled');
        setStep4ReviewCreateStatus('disabled');
        break;
      case 2:
        setStep1DefineDetectorStatus(undefined);
        setStep2ConfigureModelStatus(undefined);
        setStep3JobsStatus('disabled');
        setStep4ReviewCreateStatus('disabled');
        break;
      case 3:
        setStep1DefineDetectorStatus(undefined);
        setStep2ConfigureModelStatus(undefined);
        setStep3JobsStatus(undefined);
        setStep4ReviewCreateStatus('disabled');
        break;
      case 4:
        setStep1DefineDetectorStatus(undefined);
        setStep2ConfigureModelStatus(undefined);
        setStep3JobsStatus(undefined);
        setStep4ReviewCreateStatus(undefined);
        break;
    }
  }, [curStep]);

  const createSteps = [
    {
      title: 'Define detector',
      status: step1DefineDetectorStatus,
      children: undefined,
    },
    {
      title: 'Configure model',
      status: step2ConfigureModelStatus,
      children: undefined,
    },
    {
      title: 'Set up detector jobs',
      status: step3JobsStatus,
      children: undefined,
    },
    {
      title: 'Review and create',
      status: step4ReviewCreateStatus,
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
              initialValues={step1DefineDetectorFields}
              setInitialValues={setStep1DefineDetectorFields}
              {...props}
            />
          ) : curStep === 2 ? (
            <ConfigureModel
              isEdit={false}
              setStep={setCurStep}
              initialValues={step2ConfigureModelFields}
              setInitialValues={setStep2ConfigureModelFields}
              detectorDefinitionValues={step1DefineDetectorFields}
              {...props}
            />
          ) : curStep === 3 ? (
            <DetectorJobs
              setStep={setCurStep}
              initialValues={step3JobsFields}
              setInitialValues={setStep3JobsFields}
              {...props}
            />
          ) : curStep === 4 ? (
            <ReviewAndCreate
              setStep={setCurStep}
              values={step4ReviewCreateFields}
              {...props}
            />
          ) : null}
        </EuiFlexItem>
      </EuiFlexGroup>
    </Fragment>
  );
};
