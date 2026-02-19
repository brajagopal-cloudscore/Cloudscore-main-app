import { isToday } from 'date-fns';
import { getISOEndOfDay, getISOStartOfDay } from '@/lib/utils/helpers';

export const createConnectorPayload = (
  formData: any,
  configuration: any,
  connector: any,
  workspaceId: string
) => {
  const fromDateISO = getISOStartOfDay(new Date(formData.from_date || ''));
  const toDateISO = isToday(formData.to_date || '')
    ? new Date().toISOString()
    : getISOEndOfDay(new Date(formData.to_date || ''));

  return {
    connection_name: formData.connection_name || '',
    synchronization_mode: formData.synchronization_mode || '',
    from_date: fromDateISO,
    to_date: toDateISO,
    is_enterprise: true,
    connector_source_id: connector.id,
    configurations: JSON.stringify(configuration),
    workspace_id: workspaceId,
  };
};
