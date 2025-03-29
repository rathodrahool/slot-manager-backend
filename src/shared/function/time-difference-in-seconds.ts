const timeDifferenceInSeconds = (startTime, endTime) => {
  const toSeconds = (time) => {
    const [hours, minutes, seconds] = time.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  };

  // Calculate and return the difference
  return toSeconds(endTime) - toSeconds(startTime);
};
export default timeDifferenceInSeconds;
