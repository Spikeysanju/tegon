/** Copyright (c) 2024, Tegon, all rights reserved. **/

import { observer } from 'mobx-react-lite';
import { usePathname } from 'next/navigation';
import React from 'react';

import { ListView } from 'modules/issues/all/list-view';

import type { ViewType } from 'common/types/view';

import { useContextStore } from 'store/global-context-provider';

interface ViewListProps {
  view: ViewType;
}

export const ViewList = observer(({ view }: ViewListProps) => {
  const { applicationStore } = useContextStore();
  const pathname = usePathname();

  React.useEffect(() => {
    const filters = view.filters;
    if (pathname === applicationStore.identifier) {
      applicationStore.updateFilters(filters);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationStore.identifier]);

  return (
    <div className="grow overflow-hidden">
      <ListView />
    </div>
  );
});
