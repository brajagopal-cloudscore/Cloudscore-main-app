import React from 'react';
import { add } from 'date-fns';

const CurrentUTCDateTime = () => {
  const [currTimestamp, setCurrTimestamp] = React.useState(
    new Date().toISOString()
  );

  React.useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrTimestamp((prev) =>
        add(new Date(prev), { seconds: 1 }).toISOString()
      );
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const getFormattedDateString = (timestamp: string) => {
    const now = new Date(timestamp);

    // Convert to UTC
    const utcDate = new Date(now.toUTCString());

    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      timeZone: 'UTC',
    };

    const formatter = new Intl.DateTimeFormat('en-GB', options);
    const formattedDateTime = formatter.format(utcDate);

    return formattedDateTime;
  };

  return <>{getFormattedDateString(currTimestamp)}</>;
};

export default CurrentUTCDateTime;
