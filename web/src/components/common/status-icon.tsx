import { getStatusIconStyle, StatusType } from '@/lib/utils/helpers';

const StatusIcon = ({ status }: { status: StatusType }) => {
  return <div className={getStatusIconStyle(status)}></div>;
};

export default StatusIcon;