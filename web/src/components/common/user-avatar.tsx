import React from 'react';
import { Avatar } from '@nextui-org/react';
import { getNameInitials, stringToHexCode } from '@/lib/utils/helpers';

interface Props {
  name: string;
  rounded?: boolean;
}

const UserAvatar = ({ name, rounded }: Props) => {
  const avatarColor = stringToHexCode(name);

  return (
    <Avatar
      name={getNameInitials(name)}
      size="sm"
      radius={rounded ? 'full' : 'sm'}
      style={{ backgroundColor: avatarColor }}
    />
  );
};

export default UserAvatar;
