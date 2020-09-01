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

//@ts-ignore
import moment from 'moment';
import readline from 'readline';
import { Request } from 'hapi';

import fs from 'fs';
import { createUnzip } from 'zlib';
//@ts-ignore
import { CallClusterWithRequest } from 'src/legacy/core_plugins/elasticsearch';

const BULK_INSERT_SIZE = 500;

export const loadSampleData = (
  filePath: string,
  indexName: string,
  req: Request,
  callWithRequest: CallClusterWithRequest
) => {
  return new Promise((resolve, reject) => {
    let count: number = 0;
    let docs: any[] = [];
    let isPaused: boolean = false;
    let offset = 0;
    const startTime = moment(new Date().getTime()).subtract({ days: 7 });

    // Create the read stream for the file. Set a smaller buffer size here to prevent it from
    // getting too large, to prevent inserting too many docs at once into the index.
    const readStream = fs.createReadStream(filePath, {
      highWaterMark: 1024 * 4,
    });
    const lineStream = readline.createInterface({
      input: readStream.pipe(createUnzip()),
    });

    // This is only ran when the end of lineStream closes normally. It is used to
    // bulk insert the final batch of lines that are < BULK_INSERT_SIZE
    const onClose = async () => {
      if (docs.length > 0) {
        try {
          await bulkInsert(docs);
        } catch (err) {
          reject(err);
          return;
        }
      }
      resolve(count);
    };
    lineStream.on('close', onClose);
    lineStream.on('pause', async () => {
      isPaused = true;
    });
    lineStream.on('resume', async () => {
      isPaused = false;
    });
    lineStream.on('line', async (doc) => {
      // for the initial doc, get the timestamp to properly set an offset
      if (count === 0) {
        const initialTime = moment(JSON.parse(doc).timestamp);
        offset = startTime.diff(initialTime);
      }
      count++;
      docs.push(doc);

      // If not currently paused: pause the stream to prevent concurrent bulk inserts
      // on the cluster which could cause performance issues.
      // Also, empty the current docs[] before performing the bulk insert to prevent
      // buffered docs from being dropped.
      if (docs.length >= BULK_INSERT_SIZE && !isPaused) {
        lineStream.pause();

        // save the docs to insert, and empty out current docs list
        const docsToInsert = docs.slice();
        docs = [];
        try {
          await bulkInsert(docsToInsert);
          lineStream.resume();
        } catch (err) {
          lineStream.removeListener('close', onClose);
          lineStream.close();
          reject(err);
        }
      }
    });

    const bulkInsert = async (docs: any[]) => {
      try {
        const bulkBody = prepareBody(docs, offset);
        const resp = await callWithRequest(req, 'bulk', {
          body: bulkBody,
        });
        if (resp.errors) {
          console.log('Error while bulk inserting. ', resp.errors);
          return Promise.reject(
            new Error('Error while bulk inserting. Please try again.')
          );
        }
      } catch (err) {
        console.log('Error while bulk inserting. ', err);
        return Promise.reject(
          new Error('Error while bulk inserting. Please try again.')
        );
      }
    };

    const prepareBody = (docs: string[], offset: number) => {
      const bulkBody = [] as any[];
      let docIdCount = count - docs.length;
      docs.forEach((doc: string) => {
        bulkBody.push(getDocDetails(docIdCount));
        bulkBody.push(updateTimestamp(doc, offset));
        docIdCount++;
      });
      return bulkBody;
    };

    const updateTimestamp = (doc: any, offset: number) => {
      let docAsJSON = JSON.parse(doc);
      const updatedTimestamp = docAsJSON.timestamp + offset;
      docAsJSON.timestamp = updatedTimestamp;
      return docAsJSON;
    };

    const getDocDetails = (docIdCount: number) => {
      return `{ "index": { "_index": "${indexName}", "_id": ${docIdCount} } }`;
    };
  });
};
