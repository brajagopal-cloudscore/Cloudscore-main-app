import React from 'react';

interface Props {
  members: string[];
}

const MemberListText = ({ members }: Props) => {
  const [showMore, setShowMore] = React.useState(false);

  return (
    <>
      {/* <span className="text-sm text-slate-500">
        {members.slice(0, 3).join(', ')}
        {showMore ? <>, {members.slice(3).join(', ')}</> : null}
      </span> */}
      {members.length > 3 && (
        <span
          className="ml-2 text-blue-500 cursor-pointer text-xs"
          onClick={() => setShowMore((prev) => !prev)}
        >
          {showMore ? 'Show less' : 'Show more'}
        </span>
      )}
    </>
  );
};

export default MemberListText;
