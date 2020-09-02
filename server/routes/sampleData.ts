/*
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

//@ts-ignore
import moment from 'moment';
import { Request, ResponseToolkit } from 'hapi';
import path from 'path';
//@ts-ignore
import { CallClusterWithRequest } from 'src/legacy/core_plugins/elasticsearch';
import { ServerResponse } from '../models/types';
import { Router } from '../router';
import { SAMPLE_TYPE } from '../../public/utils/constants';
import { loadSampleData } from '../sampleData/utils/helpers';

export default function (apiRouter: Router) {
  apiRouter.post('/create_sample_data', createSampleData);
}

// Get the zip file stored in server, unzip it, and bulk insert it
const createSampleData = async (
  req: Request,
  h: ResponseToolkit,
  callWithRequest: CallClusterWithRequest
): Promise<ServerResponse<any>> => {
  //@ts-ignore
  const type = req.payload.type as SAMPLE_TYPE;
  try {
    let filePath = '';
    let indexName = '';

    switch (type) {
      case SAMPLE_TYPE.HTTP_RESPONSES: {
        filePath = path.resolve(
          __dirname,
          '../sampleData/rawData/httpResponses.json.gz'
        );
        indexName = 'opendistro-sample-http-responses';
        break;
      }
      case SAMPLE_TYPE.ECOMMERCE: {
        filePath = path.resolve(
          __dirname,
          '../sampleData/rawData/ecommerce.json.gz'
        );
        indexName = 'opendistro-sample-ecommerce';
        break;
      }
      case SAMPLE_TYPE.HOST_HEALTH: {
        filePath = path.resolve(
          __dirname,
          '../sampleData/rawData/hostHealth.json.gz'
        );
        indexName = 'opendistro-sample-host-health';
        break;
      }
    }

    await loadSampleData(filePath, indexName, req, callWithRequest);

    //@ts-ignore
    return { ok: true };
  } catch (err) {
    console.log('Anomaly detector - Unable to load the sample data', err);
    return { ok: false, error: err.message };
  }
};
