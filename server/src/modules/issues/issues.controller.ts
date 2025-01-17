/** Copyright (c) 2024, Tegon, all rights reserved. **/

import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Issue } from '@prisma/client';
import { SessionContainer } from 'supertokens-node/recipe/session';

import { AuthGuard } from 'modules/auth/auth.guard';
import { Session as SessionDecorator } from 'modules/auth/session.decorator';
import LinkedIssueService from 'modules/linked-issue/linked-issue.service';

import {
  ApiResponse,
  CreateIssueInput,
  IssueRequestParams,
  LinkIssueInput,
  SubscribeIssueInput,
  SuggestionsInput,
  TeamRequestParams,
  UpdateIssueInput,
} from './issues.interface';
import IssuesService from './issues.service';

@Controller({
  version: '1',
  path: 'issues',
})
@ApiTags('Issues')
export class IssuesController {
  constructor(
    private issuesService: IssuesService,
    private linkedIssueService: LinkedIssueService,
  ) {}

  @Post()
  @UseGuards(new AuthGuard())
  async createIssue(
    @SessionDecorator() session: SessionContainer,
    @Query() teamParams: TeamRequestParams,
    @Body() issueData: CreateIssueInput,
  ) {
    const userId = session.getUserId();
    return await this.issuesService.createIssue(teamParams, issueData, userId);
  }

  @Post('suggestions')
  @UseGuards(new AuthGuard())
  async suggestions(
    @Query() teamRequestParams: TeamRequestParams,
    @Body() suggestionsInput: SuggestionsInput,
  ) {
    return await this.issuesService.suggestions(
      teamRequestParams,
      suggestionsInput,
    );
  }

  @Post(':issueId')
  @UseGuards(new AuthGuard())
  async updateIssue(
    @SessionDecorator() session: SessionContainer,
    @Param() issueParams: IssueRequestParams,
    @Query() teamParams: TeamRequestParams,
    @Body() issueData: UpdateIssueInput,
  ): Promise<Issue | ApiResponse> {
    const userId = session.getUserId();
    return await this.issuesService.updateIssue(
      teamParams,
      issueData,
      issueParams,
      userId,
    );
  }

  @Delete(':issueId')
  @UseGuards(new AuthGuard())
  async deleteIssue(
    @Param() issueParams: IssueRequestParams,
    @Query() teamParams: TeamRequestParams,
  ): Promise<Issue> {
    return await this.issuesService.deleteIssue(teamParams, issueParams);
  }

  @Post(':issueId/link')
  @UseGuards(new AuthGuard())
  async linkIssue(
    @SessionDecorator() session: SessionContainer,
    @Param() issueParams: IssueRequestParams,
    @Query() teamParams: TeamRequestParams,
    @Body() linkData: LinkIssueInput,
  ) {
    const userId = session.getUserId();
    return await this.linkedIssueService.createLinkIssue(
      teamParams,
      linkData,
      issueParams,
      userId,
    );
  }

  @Post(':issueId/subscribe')
  @UseGuards(new AuthGuard())
  async subscribeIssue(
    @SessionDecorator() session: SessionContainer,
    @Param() issueParams: IssueRequestParams,
    @Body() subscriberData: SubscribeIssueInput,
  ) {
    const userId = session.getUserId();
    return await this.issuesService.handleSubscription(
      userId,
      issueParams.issueId,
      subscriberData.type,
    );
  }
}
