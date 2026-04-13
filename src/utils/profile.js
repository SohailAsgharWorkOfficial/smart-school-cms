export const resolveLinkedProfileId = (userProfile) => {
  return userProfile?.linkedProfileId || userProfile?.uid || userProfile?.id || null;
};

