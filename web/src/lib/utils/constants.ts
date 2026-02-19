import { Filters } from '../../types';

export const URL_REGEX = /(<https?:\/\/[^\s>]+>)/g;

export const supportedFilters: Filters[] = [
  'classifiers',
  'components',
  'filetypes',
  'participants',
  'types',
  'systemmsg',
];

export const auditTypeEntityOptions = [
  'application',
  'api_key',
  'model_info',
  'integration',
  'policy',
  'provider_model',
  'risk',
  'stakeholder',
  'use_case',
  'user',
].map((item) => {
  // Convert snake_case to Title Case for display
  const label = item
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  return { id: item, label };
});

export const combinators = [
  {
    name: 'and',
    label: 'AND',
  },
  {
    name: 'or',
    label: 'OR',
  },
];

export const connectorGroups = {
  google: 'Google Workspace',
  gmail: 'Gmail',
  google_drive: 'Google Drive',
  drive: 'Drive',
  shared_drive: 'Shared Drive',
  jira: 'Jira',
  confluence: 'Confluence',
  slack: 'Slack Enterprise',
  public_channels: 'Public Channels',
  private_channels: 'Private Channels',
  group_messages: 'Group Messages',
  direct_messages: 'Direct Messages',
  mpim: 'MPIM',
  im: 'IM',
  teams: 'Microsoft Teams',
  zendesk: 'Zendesk',
  zoom: 'Zoom',
  onedrive: 'OneDrive',
  files: 'Files',
  team_chats: 'Team Chats',
  meetings: 'Meetings',
  box: 'Box',
  microsoft_outlook: 'Microsoft Outlook'
};

export const getConnectorName = {
  google_workspace: "google_workspace",
  gmail: "gmail",
  drive: "drive",
  shared_drive: "shared_drive",
  jira: "jira",
  confluence: "confluence",
  slack_enterprise: "slack_enterprise",
  public_channels: "public_channels",
  private_channels: "private_channels",
  group_messages: "group_messages",
  direct_messages: "direct_messages",
  microsoft_teams: "microsoft_teams",
  zoom: "zoom",
  meetings: "meetings",
  team_chats: "team_chats",
  box: 'box',
  microsoft_outlook: 'microsoft_outlook'
};
