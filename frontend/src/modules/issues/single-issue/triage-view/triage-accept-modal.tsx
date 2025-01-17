/** Copyright (c) 2024, Tegon, all rights reserved. **/
import { zodResolver } from '@hookform/resolvers/zod';
import { RiArrowDropRightLine } from '@remixicon/react';
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  IssueAssigneeDropdown,
  IssueLabelDropdown,
  IssuePriorityDropdown,
  IssueStatusDropdown,
} from 'modules/issues/components';

import { getTailwindColor } from 'common/color-utils';
import { cn } from 'common/lib/utils';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  getInitials,
} from 'components/ui/avatar';
import { Button } from 'components/ui/button';
import {
  DialogContent,
  Dialog,
  DialogHeader,
  DialogTitle,
} from 'components/ui/dialog';
import { Form, FormControl, FormField, FormItem } from 'components/ui/form';
import { Textarea } from 'components/ui/textarea';
import { useIssueData } from 'hooks/issues';
import { useCurrentTeam } from 'hooks/teams';

import {
  useCreateIssueCommentMutation,
  useUpdateIssueMutation,
} from 'services/issues';

import { UserContext } from 'store/user-context';

interface TriageAcceptModalProps {
  setDialogOpen: (value: boolean) => void;
}

const AcceptIssueSchema = z.object({
  comment: z.optional(z.string()),

  stateId: z.string(),

  labelIds: z.array(z.string()),
  priority: z.number(),
  assigneeId: z.optional(z.string()),
});

interface AcceptIssueParams {
  comment: string;
  stateId: string;

  labelIds: string[];
  priority: number;
  assigneeId?: string;
}

export function TriageAcceptModal({ setDialogOpen }: TriageAcceptModalProps) {
  const currentTeam = useCurrentTeam();
  const issue = useIssueData();
  const currentUser = React.useContext(UserContext);
  const { mutate: updateIssue } = useUpdateIssueMutation({});
  const { mutate: commentIssue } = useCreateIssueCommentMutation({});

  const form = useForm<z.infer<typeof AcceptIssueSchema>>({
    resolver: zodResolver(AcceptIssueSchema),
    defaultValues: {
      labelIds: issue.labelIds,
      priority: issue.priority ?? 0,
      assigneeId: issue.assigneeId,
      stateId: issue.stateId,
    },
  });

  const onSubmit = async (values: AcceptIssueParams) => {
    updateIssue({
      id: issue.id,
      teamId: currentTeam.id,
      labelIds: values.labelIds,
      stateId: values.stateId,
      assigneeId: values.assigneeId,
      priority: values.priority,
    });

    if (values.comment) {
      commentIssue({
        body: values.comment,
        issueId: issue.id,
      });
    }

    setDialogOpen(false);
  };

  return (
    <Dialog open onOpenChange={setDialogOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader className="p-3 pb-0">
          <DialogTitle className="text-sm text-muted-foreground/80 font-normal">
            <div className="flex gap-1 items-center">
              Accept
              <RiArrowDropRightLine size={18} />
              <div>
                {currentTeam.identifier} - {issue.number}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className={cn('flex flex-col')}>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="p-3 pt-0">
                <FormField
                  control={form.control}
                  name="comment"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="flex items-start gap-4">
                          <Avatar className="h-[15px] w-[20px] text-foreground">
                            <AvatarImage />
                            <AvatarFallback
                              className={cn(
                                'text-[0.55rem] rounded-sm',
                                getTailwindColor(currentUser.username),
                              )}
                            >
                              {getInitials(currentUser.fullname)}
                            </AvatarFallback>
                          </Avatar>
                          <Textarea
                            {...field}
                            className="focus-visible:ring-0 border-0 mb-4 w-full min-h-[60px] text-foreground p-0"
                            placeholder="Add a comment"
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex gap-2 items-center">
                  <FormField
                    control={form.control}
                    name="stateId"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <IssueStatusDropdown
                            onChange={field.onChange}
                            value={field.value}
                            teamIdentfier={currentTeam.identifier}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="labelIds"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <IssueLabelDropdown
                            value={field.value}
                            onChange={field.onChange}
                            teamIdentfier={currentTeam.identifier}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <IssuePriorityDropdown
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="assigneeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <IssueAssigneeDropdown
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div
                className={cn(
                  'flex items-center justify-end p-2 border-t gap-2',
                )}
              >
                <Button type="submit" size="sm">
                  Accept
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
