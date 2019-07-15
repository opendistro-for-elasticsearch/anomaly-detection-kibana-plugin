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

import { useState, useEffect, useRef } from 'react';

export const useSticky = (ref: any, offset: number): boolean => {
  const [isSticky, setSticky] = useState(false);
  const previousState = useRef<boolean>(false);
  let timeout = 0;
  useEffect(() => {
    previousState.current = isSticky;
  });
  useEffect(() => {
    window.addEventListener('scroll', () => {
      if (timeout) {
        window.cancelAnimationFrame(timeout);
      }
      timeout = window.requestAnimationFrame(handleScroll);
    });
    return () => {
      window.cancelAnimationFrame(timeout);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  const handleScroll = () => {
    const currentSticky =
      ref &&
      ref.current &&
      ref.current.getBoundingClientRect().top + offset - window.pageYOffset <=
        0;
    if (ref.current && previousState.current !== currentSticky) {
      setSticky(currentSticky);
    }
  };

  return isSticky;
};
