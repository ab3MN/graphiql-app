'use client';

import { ComponentType, useLayoutEffect } from 'react';
import { redirect } from 'next/navigation';
import { useAppSelector } from '@/utils/store/hooks';
import { HOME } from '@/constants/path';

const isAuth =
  <P extends object>(Component: ComponentType<P>) =>
  (props: P) => {
    const authState = useAppSelector((state) => state.auth.authState);

    useLayoutEffect((): void => {
      if (authState) redirect(HOME);
    }, []);

    return !authState ? <Component {...props} /> : null;
  };

export default isAuth;
