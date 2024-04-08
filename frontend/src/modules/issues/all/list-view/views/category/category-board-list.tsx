/** Copyright (c) 2024, Tegon, all rights reserved. **/

import {
  Draggable,
  type DraggableProvided,
  type DraggableStateSnapshot,
} from '@hello-pangea/dnd';
import { observer } from 'mobx-react-lite';
import React from 'react';

import { WORKFLOW_CATEGORY_ICONS } from 'modules/team-settings/workflow/workflow-item';

import type { IssueType } from 'common/types/issue';
import type { WorkflowType } from 'common/types/team';

import { BoardItem } from 'components/ui/board';
import { useCurrentTeam } from 'hooks/teams';

import { useContextStore } from 'store/global-context-provider';

import { BoardIssueItem } from '../../issue-board-item';
import { useFilterIssues } from '../../list-view-utils';

interface CategoryBoardItemProps {
  workflow: WorkflowType;
}

export const CategoryBoardList = observer(
  ({ workflow }: CategoryBoardItemProps) => {
    const CategoryIcon =
      WORKFLOW_CATEGORY_ICONS[workflow.name] ??
      WORKFLOW_CATEGORY_ICONS['Backlog'];
    const currentTeam = useCurrentTeam();
    const { issuesStore, applicationStore } = useContextStore();
    const issues = issuesStore.getIssuesForState(
      workflow.id,
      currentTeam.id,
      applicationStore.displaySettings.showSubIssues,
    );
    const computedIssues = useFilterIssues(issues);

    if (
      computedIssues.length === 0 &&
      !applicationStore.displaySettings.showEmptyGroups
    ) {
      return null;
    }

    return (
      <div className="flex flex-col max-h-[100%]">
        <div className="flex items-center w-full p-3">
          <CategoryIcon
            size={16}
            className="text-muted-foreground"
            color={workflow.color}
          />
          <h3 className="pl-2 text-sm font-medium">
            {workflow.name}
            <span className="text-muted-foreground ml-2">
              {computedIssues.length}
            </span>
          </h3>
        </div>

        <div className="p-3 flex flex-col gap-2 grow overflow-y-auto pb-10">
          {computedIssues.map((issue: IssueType, index: number) => (
            <BoardItem key={issue.id} id={issue.id}>
              <Draggable key={issue.id} draggableId={issue.id} index={index}>
                {(
                  dragProvided: DraggableProvided,
                  dragSnapshot: DraggableStateSnapshot,
                ) => (
                  <BoardIssueItem
                    issueId={issue.id}
                    isDragging={dragSnapshot.isDragging}
                    provided={dragProvided}
                  />
                )}
              </Draggable>
            </BoardItem>
          ))}
        </div>
      </div>
    );
  },
);