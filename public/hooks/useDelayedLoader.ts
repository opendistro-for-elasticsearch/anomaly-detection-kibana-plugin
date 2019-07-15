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

import { useState, useEffect, useCallback } from 'react';

export const useDelayedLoader = (isLoading: boolean): boolean => {
  const [loaderState, setLoader] = useState(false);
  const [timer, setTimer] = useState(0);

  //Display actually loader latency looks lower
  const handleDisplayLoader = useCallback(() => {
    setLoader(true);
  }, []);

  // Setting up the loader to be visible only when network is too slow
  const handleSetTimer = useCallback(() => {
    const timer = window.setTimeout(handleDisplayLoader, 1000);
    setTimer(timer);
  }, []);

  useEffect(
    () => {
      if (isLoading) {
        handleSetTimer();
      } else {
        clearTimeout(timer);
        setLoader(false);
      }
      //Cleanup incase component unmounts
      return () => {
        clearTimeout(timer);
      };
    },
    [isLoading]
  );
  return loaderState;
};
