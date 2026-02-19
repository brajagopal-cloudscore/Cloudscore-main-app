import React from 'react';

interface WorkspacePageHeaderProps {
  userProfile?: {
    username?: string;
    name?: string;
  };
  text: string;
}

const WorkspacePageHeader: React.FC<WorkspacePageHeaderProps> = ({ userProfile, text }) => {
  const displayName = userProfile?.username || userProfile?.name;
  
  if (!displayName) return null;

  return (
    <div className="gap-3 mb-[14px]">
      <h1 className="text-2xl leading-7 font-[700] mt-[20px] font-sf-pro">
        Hello, {displayName}!
      </h1>
      <p className="text-muted-foreground font-normal leading-5 font-sf-pro mt-1 text-[#71717A] text-[14px]">
        {text}
      </p>
    </div>
  );
};

export default WorkspacePageHeader;
